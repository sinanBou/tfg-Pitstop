import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar explícitamente el archivo .env en os.environ
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    HOST: str = "0.0.0.0"
    PORT: int = 8000

settings = Settings()

