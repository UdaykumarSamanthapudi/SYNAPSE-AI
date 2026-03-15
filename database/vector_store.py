from langchain_chroma import Chroma
from config.settings import embedding_model,vector_path
from rag.ingestion import process_document
from app import logger


def create_vector_store(filepath:str):
    chunks=process_document(filepath)
    vector_store=Chroma.from_documents(chunks,embedding_model,persist_directory=vector_path)
    vector_store.persist()
    logger.info(f"Stored {len(chunks)} document chunks in {vector_path} ")


vector_store = Chroma(
    persist_directory=vector_path,
    embedding_function=embedding_model
)

retriever = vector_store.as_retriever(search_kwargs={"k":4})