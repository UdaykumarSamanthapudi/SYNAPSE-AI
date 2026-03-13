from config.settings import vector_path,embedding_model,llm
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate


def retrieve_documents(query:str):
    vector_store = Chroma(
    persist_directory=vector_path,
    embedding_function=embedding_model
)
    relevant_docs=vector_store.similarity_search(query,k=3)
    return relevant_docs

def rag_answer(query:str):
    relevant_docs=retrieve_documents(query)
    prompt=ChatPromptTemplate.from_template(
    """
    
    """)
    
