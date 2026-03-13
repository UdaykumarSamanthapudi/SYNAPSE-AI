from fastapi import FastAPI
import logging
app=FastAPI("SYNAPSE-AI PROJECT")

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

@app.post("/chat")
def chat(query:str)-> str:
    pass