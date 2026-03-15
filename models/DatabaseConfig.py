from pydantic import BaseModel

class DatabaseConfig(BaseModel):
    db_type: str
    host: str
    port: int
    database: str
    username: str
    password: str
    db_url:str