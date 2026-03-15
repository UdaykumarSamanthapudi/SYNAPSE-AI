from rag.retriever import rag_answer
from langchain.tools import tool

@tool
def search_documents(query:str):
    """Use this tool to read, query, or summarize the user's uploaded documents (PDFs, txt files).
    Call this tool if the user asks 'from my documents'."""
    result=rag_answer(query)
    return result