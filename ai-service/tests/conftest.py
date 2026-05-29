import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Añadir el directorio raíz del servicio de IA al path para importaciones correctas
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Evitar que se cargue la clave real de Groq o se intente conectar de verdad durante los tests
os.environ["GROQ_API_KEY"] = "mock_api_key_for_testing"
os.environ["CHROMA_PERSIST_DIR"] = "./chroma_test_db"

@pytest.fixture(autouse=True)
def mock_groq_client():
    """
    Mockea la clase Groq para evitar llamadas reales a la API de Groq en la inicialización
    y llamadas de chat.
    """
    with patch("services.groq_service.Groq") as mock_groq_class:
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        # Estructura del retorno de chat.completions.create
        mock_choice = MagicMock()
        mock_choice.message.content = "Respuesta simulada de Groq LLM."
        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_completion
        
        yield mock_client

@pytest.fixture
def mock_sentence_transformer():
    """
    Mockea el modelo local de SentenceTransformer si se desea
    evitar la vectorización real en CPU.
    """
    with patch("services.rag_service.SentenceTransformer") as mock_transformer_class:
        mock_model = MagicMock()
        # Devuelve un objeto simulado cuyo método tolist() retorna una lista flotante ficticia
        mock_array = MagicMock()
        mock_array.tolist.return_value = [0.1] * 384
        mock_model.encode.return_value = mock_array
        mock_transformer_class.return_value = mock_model
        yield mock_model

@pytest.fixture
def client():
    """
    Fixture para interactuar con la API de FastAPI a través de TestClient.
    """
    from fastapi.testclient import TestClient
    from main import app
    with TestClient(app) as test_client:
        yield test_client
