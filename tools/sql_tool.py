
from models import DatabaseConfig
from langchain_community.utilities import SQLDatabase
from config.settings import llm
from langchain_core.prompts import ChatPromptTemplate
from langchain.tools import tool
@tool
def query_database(query:str,db_url:str):
    """
    Query a SQL database to answer questions about data.
    Takes a natural language query and a DatabaseConfig object to connect and retrieve the result.
    """
    db=connect_db(db_url)
    schema=db.get_table_info()
    query_prompt = ChatPromptTemplate.from_template(
    """
    You are an expert SQL developer.

    Convert the user question into a SQL query.

    Database Name: {database_name}

    Database Schema:
    {schema}

    User Question:
    {input}

    Rules:
    1. Only generate SELECT queries.
    2. Do NOT generate INSERT, UPDATE, DELETE, DROP.
    3. Return ONLY the SQL query.
    """
    )
    chain=query_prompt | llm | StrOutputParser()
    query_result=chain.invoke({"database_name":databaseconfig.database,"schema":schema,"input":query})
    if not query_result.content.lower().strip().startswith("select"):
        return "Only SELECT queries are allowed."
    results=db.run(query_result.content)
    return results

    

def connect_db(db_url:str):
    db=SQLDatabase.from_uri(db_url)
    return db
    
