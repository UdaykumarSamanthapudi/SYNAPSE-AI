import logging
from langchain_chroma import Chroma
from config.settings import embedding_model, vector_path
from rag.ingestion import process_document

logger = logging.getLogger(__name__)

COLLECTION_NAME = "synapse_docs"


def create_vector_store(filepath: str):
    chunks = process_document(filepath)
    Chroma.from_documents(
        chunks,
        embedding_model,
        persist_directory=vector_path,
        collection_name=COLLECTION_NAME,
    )
    logger.info(f"Stored {len(chunks)} document chunks in collection '{COLLECTION_NAME}'")