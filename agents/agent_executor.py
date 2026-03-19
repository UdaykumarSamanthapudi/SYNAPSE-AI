from typing import Optional
from config.settings import llm
from tools.arxiv_tool import search_arxiv
from tools.retrieval_tool import search_documents
from tools.sql_tool import query_database
from tools.web_search import search_web
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import ToolMessage
import logging

from memory.chat_memory import get_session_history
logger = logging.getLogger(__name__)


# Tools list
tools = [search_arxiv, search_documents, query_database, search_web]
tools_map = {tool.name: tool for tool in tools}


def initialize_agent():
    llm_with_tools = llm.bind_tools(tools)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are Synapse AI — a helpful, intelligent assistant. Answer questions clearly and directly.

You have access to 4 tools. Use them ONLY when needed:

- search_arxiv: Use for requests about scientific/academic/research papers (keywords: "research paper", "arxiv", "academic", "scientific paper")
- search_documents: Use ONLY when the user explicitly says "my documents", "from my files", "search my documents", "in my uploaded files"
- query_database: Use ONLY when the user explicitly mentions "database", "SQL", "table", "from db", "my database", or any data retrieval from a DB. The db_url will be injected automatically — just pass the natural language query.
- search_web: Use for current events, facts, or anything requiring fresh information from the internet

IMPORTANT RULES:
- For general questions like "what is Python", "what is Java", "explain X" — answer directly from your own knowledge WITHOUT any tool
- Do NOT use query_database for general knowledge questions
- Do NOT use search_documents unless user explicitly says "my documents"
- Always respond in plain, friendly language with a clear direct answer
- If anyone asks who created you, who built you, or who is your creator — always answer: "I was created by UDAY KUMAR SAMANTHAPUDI." """),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
    ])

    chain = prompt | llm_with_tools

    agent_with_memory = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )

    logger.info("Initialized agent with memory")
    return agent_with_memory


agent = initialize_agent()


def execute_tool_call(tool_call, injected_db_url: Optional[str] = None) -> tuple[str, str]:
    """Execute a tool call. If tool is query_database and db_url was provided by user,
    inject it directly instead of relying on the LLM to pass it."""
    if isinstance(tool_call, dict):
        tool_name = tool_call.get('name', '')
        tool_args = dict(tool_call.get('args', {}))
        tool_id = tool_call.get('id', tool_name)
    else:
        tool_name = tool_call.name
        tool_args = dict(tool_call.args)
        tool_id = getattr(tool_call, 'id', tool_name)

    # Injecting the db_url directly to  tool
    if tool_name == 'query_database' and injected_db_url:
        tool_args['db_url'] = injected_db_url
        logger.info(f"Injected db_url into query_database: {injected_db_url}")

    logger.info(f"Executing tool: {tool_name} with args: {tool_args}")
    tool = tools_map.get(tool_name)
    if not tool:
        return tool_id, f"Tool '{tool_name}' not found"

    try:
        result = tool.invoke(tool_args)
        return tool_id, str(result)
    except Exception as e:
        logger.exception(f"Tool {tool_name} failed")
        return tool_id, f"Error: {str(e)}"


def run_agent(query: str, session_id: str, db_url: Optional[str] = None) -> str:
    logger.info(f"Agent running query for session {session_id}: {query}")

    config = {"configurable": {"session_id": session_id}}
   
    response = agent.invoke({"input": query}, config=config)
 
    if not (hasattr(response, 'tool_calls') and response.tool_calls):
        logger.info("No tool calls — returning direct answer")
        return response.content if hasattr(response, 'content') else str(response)

    tool_messages = []
    for tool_call in response.tool_calls:
        tool_id, tool_result = execute_tool_call(tool_call, injected_db_url=db_url)
        tool_name = tool_call['name'] if isinstance(tool_call, dict) else tool_call.name
        logger.info(f"Tool {tool_name} result (first 300 chars): {tool_result[:300]}")
        tool_messages.append(ToolMessage(content=tool_result, tool_call_id=tool_id))

   
    from langchain_core.messages import SystemMessage, HumanMessage

    synthesis_messages = [
        SystemMessage(content=(
            "You are Synapse AI, a helpful assistant. "
            "The tools have already run and returned results shown below. "
            "Using ONLY those results, give a clear and direct answer to the user's question. "
            "If the result contains a markdown table, reproduce it exactly as-is. "
            "Do NOT generate any code, function calls, or XML/function tags. "
            "Do NOT say you cannot access databases — the data is already provided to you."
        )),
        HumanMessage(content=query),   
        *tool_messages,                
    ]

    try:
        final = llm.invoke(synthesis_messages)
        final_content = final.content if hasattr(final, 'content') else str(final)
        logger.info(f"Synthesized answer (first 300 chars): {final_content[:300]}")
        return final_content
    except Exception as e:
        logger.exception("Synthesis step failed — returning raw tool results as fallback")
        return "\n\n".join(tm.content for tm in tool_messages)

