from config.settings import vector_path, embedding_model, llm
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import logging

logger = logging.getLogger(__name__)

#  match the collection_name used in vector_store.py during ingestion
COLLECTION_NAME = "synapse_docs"


def _get_vector_store() -> Chroma:
    """
    Load fresh from disk on every call so newly ingested documents are visible.
    Uses the same collection_name as the ingest step.
    """
    return Chroma(
        persist_directory=vector_path,
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME,
    )


def retrieve_documents(query: str):
    store = _get_vector_store()
    results = store.similarity_search(query, k=4)
    logger.info(f"Retrieved {len(results)} chunks for query: {query!r}")
    return results


def rag_answer(query: str) -> str:
    relevant_docs = retrieve_documents(query)

    if not relevant_docs:
        return (
            "I couldn't find any relevant content in your uploaded documents. "
            "Please make sure you have uploaded a file using the Upload Document section, "
            "then try again with a query like 'search my documents about …'."
        )

    context = "\n\n".join(doc.page_content for doc in relevant_docs)

    prompt = ChatPromptTemplate.from_template(
        """You are a helpful AI assistant.
Answer the user's question using ONLY the document context provided below.
Be specific, clear, and extract the exact information asked for.
If the context doesn't contain the answer, say so honestly — do NOT make up information.

Context from uploaded documents:
{context}

User question: {input}

Answer:"""
    )

    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"input": query, "context": context})
    return result