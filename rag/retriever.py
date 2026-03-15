from config.settings import vector_path,embedding_model,llm
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


def retrieve_documents(query:str):
    vector_store = Chroma(
    persist_directory=vector_path,
    embedding_function=embedding_model
)
    relevant_docs=vector_store.similarity_search(query,k=3)
    return relevant_docs

def rag_answer(query:str):
    relevant_docs=retrieve_documents(query)
    text=[r.page_content for r in relevant_docs]
    prompt=ChatPromptTemplate.from_template(
    """
    You are an AI assistant.
    Answer the question using only the provided context.
    If the answer is not there in the context then , u need to call tools.
    context:{context}
    query: {input}
    Generate the answer in a neat text format.
    """)
    chain = prompt | llm | StrOutputParser()
    result=chain.invoke({"input":query,"context":text})
    return result