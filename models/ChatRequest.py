from pydantic import BaseModel

class ChatRequest(BaseModel):
    session_id:str
    message:str
    db_url: str = None  # Optional: User can provide their own database URL for SQL queries