from config.settings import llm
from tools.arxiv_tool import search_arxiv
from tools.retrieval_tool import search_documents
from tools.sql_tool import query_database
from tools.web_search import search_web
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
import logging

from memory.chat_memory import get_session_history
logger = logging.getLogger(__name__)


# Tools list
tools = [search_arxiv, search_documents, query_database, search_web]


def initialize_agent():
    # Bind tools directly to LLM using bind_tools
    llm_with_tools = llm.bind_tools(tools)
    
    # Create prompt 
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an advanced AI assistant. Your job is to understand the user query and decide which tool to use. 
Available tools:
- search_arxiv: For scientific research papers, academic papers
- search_documents: For searching your personal documents/knowledge base
- query_database: For querying your database (requires db_url and query)
- search_web: For current information, general web searches

DATABASE QUERY RULES:
- If the user asks about database data, use query_database tool
- The query parameter should be the user's question in natural language
- For db_url: 
  - If user provides a database URL in their query (e.g., "my postgres db at localhost:5432/mydb" or "sqlite:///mydb.db"), extract it and use it
  - If user does NOT provide a db_url, leave the db_url parameter EMPTY - the system will use a default database
  - IMPORTANT: Only ask user for db_url if they want to query a specific database that is NOT the default

When you need to use a tool, use the appropriate tool call."""),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
    ])
    
    # Simple chain - LLM with tools bound
    chain = prompt | llm_with_tools
    
    # Wrap with memory
    agent_with_memory = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )

    logger.info("Initialized agent with memory")

    return agent_with_memory


agent = initialize_agent()


def execute_tool_call(tool_call):
    """Execute a tool call and return the result"""
    # Handle both dictionary and object formats
    if isinstance(tool_call, dict):
        tool_name = tool_call.get('name')
        tool_args = tool_call.get('args', {})
    else:
        tool_name = tool_call.name
        tool_args = tool_call.args
    
    # Find the matching tool
    for tool in tools:
        if tool.name == tool_name:
            try:
                result = tool.invoke(tool_args)
                return str(result)
            except Exception as e:
                return f"Error executing {tool_name}: {str(e)}"
    
    return f"Tool {tool_name} not found"


def run_agent(query: str, session_id: str):
    logger.info("Agent is running the query")
    
    # Get the response from the chain
    response = agent.invoke(
        {"input": query},
        config={"configurable": {"session_id": session_id}}
    )
    
    logger.info(f"Response: {response}")
    logger.info(f"Tool calls: {response.tool_calls if hasattr(response, 'tool_calls') else 'None'}")
    
    # Check if the response has tool calls
    if hasattr(response, 'tool_calls') and response.tool_calls:
        # Execute each tool call
        tool_results = []
        for tool_call in response.tool_calls:
            logger.info(f"Executing tool: {tool_call['name']}")
            tool_result = execute_tool_call(tool_call)
            tool_results.append(f"[{tool_call['name']}: {tool_result}]")
        
        return f"{response.content}\n\nTools executed:\n" + "\n".join(tool_results)
    
    # No tool calls - return the response directly
    return response
