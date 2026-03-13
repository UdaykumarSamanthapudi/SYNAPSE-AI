import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import Chroma
def load_env():
    load_dotenv()

llm=ChatGroq(model=os.getenv("MODEL"),temperature=os.getenv("TEMPERATURE"))

embedding_model=HuggingFaceBgeEmbeddings()

vector_path="./vector_store"
