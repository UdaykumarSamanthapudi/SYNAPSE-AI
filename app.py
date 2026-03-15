from fastapi import FastAPI
import logging
from models.ChatRequest import ChatRequest
from agents.agent_executor import run_agent
app=FastAPI(app = FastAPI(title="SYNAPSE-AI PROJECT"))

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
@app.post("/chat")
def chat(request: ChatRequest) -> dict:
    try:
        logger.info(f"Received query from session {request.session_id}: {request.message}")

        agent_response = run_agent(
            query=request.message,
            session_id=request.session_id
        )

        messages = agent_response["messages"]

        final_response = messages[-1].content

        return {"response": final_response}

    except Exception as e:
        logger.error(f"Error occurred: {str(e.with_traceback)} ")
        return {"error": "Something went wrong"}