
from langchain.agents import create_agent 
from config.settings import llm
from tools.arxiv_tool import search_arxiv
from tools.retrieval_tool import search_documents
from tools.sql_tool import query_database
from tools.web_search import search_web
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
import logging
from langchain.agents import create_agent

from memory.chat_memory import get_session_history
logger = logging.getLogger(__name__)


tools=[search_arxiv,search_documents,query_database,search_web]


from langchain.agents import create_agent

def initialize_agent():

    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt="You are an advanced AI assistant. Your job is to understand the user query and decide which tool to use. Use tools whenever required to answer the user."
    )

    agent_with_memory = RunnableWithMessageHistory(
        agent,
        get_session_history,
        input_messages_key="messages",
        history_messages_key="history",
    )

    logger.info("Initialized an agent with memory")

    return agent_with_memory


agent = initialize_agent()
def run_agent(query: str, session_id: str):
    logger.info("Agent is running the query")
    result = agent.invoke(
        {"messages": [{"role": "user", "content": query}]},
        config={"configurable": {"session_id": session_id}}
    )
    return result.get("output", result)