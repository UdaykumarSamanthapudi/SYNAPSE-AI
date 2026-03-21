from typing import Optional
from langchain_community.utilities import SQLDatabase
from langchain_core.output_parsers import StrOutputParser
from config.settings import llm, DEFAULT_DATABASE_URL
from langchain_core.prompts import ChatPromptTemplate
from langchain.tools import tool
from sqlalchemy import create_engine, text
import logging

logger = logging.getLogger(__name__)


@tool
def query_database(query: str, db_url: Optional[str] = None):
    """
    Query a SQL database to answer questions about data.
    Takes a natural language query and an optional database URL to connect and retrieve the result.

    Args:
        query: The natural language question about the database
        db_url: Database connection string (optional, uses default if not provided)
               Examples: sqlite:///mydb.db, postgresql://user:pass@localhost/dbname
    """
    if db_url is None or db_url == "":
        db_url = DEFAULT_DATABASE_URL

    db = connect_db(db_url)
    schema = db.get_table_info()
    database_name = db_url.split('/')[-1] if '/' in db_url else db_url

    # Step 1 — Generating  SQL from natural language
    query_prompt = ChatPromptTemplate.from_template(
        """You are an expert SQL developer.
Convert the user question into a valid SQL query.

Database Name: {database_name}
Database Schema:
{schema}

User Question: {input}

Rules:
1. Only generate SELECT queries.
2. Do NOT generate INSERT, UPDATE, DELETE, DROP.
3. Return ONLY the raw SQL query — no markdown fences, no explanation, no trailing semicolon issues.
4. Use backtick-quoted identifiers if the table/column names are reserved words.
"""
    )
    chain = query_prompt | llm | StrOutputParser()
    raw_sql = chain.invoke({"database_name": database_name, "schema": schema, "input": query})

    # Step 2 — Clean up the generated SQL
    cleaned_sql = raw_sql.strip()
    # Strip markdown fences (```sql ... ```) that the LLM sometimes adds
    if "```" in cleaned_sql:
        lines = cleaned_sql.splitlines()
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned_sql = "\n".join(lines).strip()
    # Strip trailing semicolon
    cleaned_sql = cleaned_sql.rstrip(";").strip()

    logger.info(f"Generated SQL: {cleaned_sql}")

    if not cleaned_sql.lower().startswith("select"):
        return f"⚠ Only SELECT queries are allowed. Generated: {cleaned_sql}"

    # Step 3 — Execute and format as markdown table
    return _run_and_format(db_url, cleaned_sql)


def _run_and_format(db_url: str, sql: str) -> str:
    """Execute SQL and return results as a markdown table."""
    engine = create_engine(db_url)
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            rows = result.fetchall()

        if not rows:
            return "Query executed successfully — no rows returned."

        # Building markdown table
        header = "| " + " | ".join(str(c) for c in columns) + " |"
        separator = "| " + " | ".join("---" for _ in columns) + " |"
        data_rows = [
            "| " + " | ".join(str(cell) if cell is not None else "NULL" for cell in row) + " |"
            for row in rows
        ]

        table = "\n".join([header, separator] + data_rows)
        summary = f"**{len(rows)} row(s) returned from `{sql.split()[2] if len(sql.split()) > 2 else 'table'}`**\n\n"
        return summary + table

    except Exception as e:
        logger.exception("SQL execution failed")
        return f"⚠ SQL Error: {str(e)}"
    finally:
        engine.dispose()


def connect_db(db_url: str) -> SQLDatabase:
    return SQLDatabase.from_uri(db_url)
