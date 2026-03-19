from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    session_id: str
    message: str
    db_url: Optional[str] = None  # Optional: User can provide their own database URL for SQL queries