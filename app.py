from fastapi import FastAPI, UploadFile, File
import logging
import os
from models.ChatRequest import ChatRequest
from agents.agent_executor import run_agent
from database.vector_store import create_vector_store

app = FastAPI(title="SYNAPSE-AI PROJECT")

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
            session_id=request.session_id,
            db_url=request.db_url or None,
        )

        if isinstance(agent_response, dict):
            if "output" in agent_response:
                final_response = agent_response["output"]
            elif "messages" in agent_response:
                messages = agent_response["messages"]
                final_response = messages[-1].content if messages else "No response"
            else:
                final_response = str(agent_response)
        elif hasattr(agent_response, "content"):
            final_response = agent_response.content
        else:
            final_response = str(agent_response)

        return {"response": final_response}

    except Exception:
        logger.exception("Error occurred")
        return {"error": "Something went wrong"}


@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)) -> dict:
    """
    Upload and ingest a document (PDF or TXT) into the vector store.
    After ingestion, you can search the document using /chat with "search my documents".
    """
    try:
        # Saving the uploaded file temporarily
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Ingesting document: {file.filename}")
        
        # Create vector store from the document
        create_vector_store(file_path)
        
        # Clean up temp file
        os.remove(file_path)
        
        return {
            "status": "success",
            "message": f"Document '{file.filename}' has been ingested successfully. You can now search it using /chat with queries like 'search my documents about...'",
            "filename": file.filename
        }
    
    except Exception as e:
        logger.exception("Error ingesting document")
        return {"error": f"Failed to ingest document: {str(e)}"}
