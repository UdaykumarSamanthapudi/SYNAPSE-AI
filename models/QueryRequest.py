
from pydantic import BaseModel
from models import DatabaseConfig
class QueryRequest(BaseModel):
    question:str
    database:DatabaseConfig
