import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
load_dotenv()

llm=ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model=os.getenv("MODEL"),
    temperature=float(os.getenv("TEMPERATURE")),
    max_tokens=1024)


embedding_model = HuggingFaceInferenceAPIEmbeddings(
    api_key=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
    model_name="sentence-transformers/all-MiniLM-L6-v2",
)


vector_path="./vector_store"

# Default database URL for SQL queries
# Can be overridden by user in query (e.g., "query my postgres db at localhost:5432/mydb")
DEFAULT_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///knowledge.db")
