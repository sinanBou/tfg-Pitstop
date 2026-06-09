"""
Módulo de configuración para el microservicio de IA.
Carga las variables de entorno desde el archivo .env y define la estructura de configuración global.
"""

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Determina la ruta absoluta del directorio base y carga el archivo de configuración .env
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

class Settings(BaseSettings):
    """
    Clase de configuración de la aplicación basada en Pydantic Settings.
    Define las variables de entorno requeridas para el servicio de IA y sus valores predeterminados.
    """
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    HOST: str = "0.0.0.0"
    PORT: int = 8000

# Instancia global de configuración lista para ser importada por otros módulos
settings = Settings()


