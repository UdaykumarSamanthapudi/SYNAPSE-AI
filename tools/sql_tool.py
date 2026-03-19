
from models import DatabaseConfig
from langchain_community.utilities import SQLDatabase
from langchain_core.output_parsers import StrOutputParser
from config.settings import llm, DEFAULT_DATABASE_URL
from langchain_core.prompts import ChatPromptTemplate
from langchain.tools import tool
@tool
def query_database(query:str, db_url:str = None):
    """
    Query a SQL database to answer questions about data.
    Takes a natural language query and an optional database URL to connect and retrieve the result.
    
    Args:
        query: The natural language question about the database
        db_url: Database connection string (optional, uses default if not provided)
               Examples: sqlite:///mydb.db, postgresql://user:pass@localhost/dbname
    """
    # Use default database URL if not provided
    if db_url is None or db_url == "":
        db_url = DEFAULT_DATABASE_URL
    
    db = connect_db(db_url)
    schema = db.get_table_info()
    
    # Extract database name from URL for display
    database_name = db_url.split('/')[-1] if '/' in db_url else db_url
    
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
    query_result = chain.invoke({"database_name": database_name, "schema": schema, "input": query})
    
    # Clean up the query - remove common prefixes the LLM might add
    cleaned_result = query_result.lower().strip()
    
    # Remove common prefixes
    prefixes_to_remove = [
        "sql query:", "sql:", "query:", "here is the query:", 
        "here's the query:", "the query is:", "select query:",
        "```sql", "```", "'", '"'
    ]
    for prefix in prefixes_to_remove:
        if cleaned_result.startswith(prefix):
            cleaned_result = cleaned_result[len(prefix):].strip()
    
    if not cleaned_result.startswith("select"):
        return f"Only SELECT queries are allowed. Got: {query_result}"
    
    results=db.run(cleaned_result)
    return results

    

def connect_db(db_url:str):
    db=SQLDatabase.from_uri(db_url)
    return db
