import pytest
from unittest.mock import MagicMock, patch
from services.groq_service import GroqService

def test_groq_is_configured_true(mock_groq_client):
    """
    Verifica que is_configured retorne True si la API Key está configurada.
    """
    service = GroqService()
    assert service.is_configured() is True

def test_groq_is_configured_false():
    """
    Verifica que is_configured retorne False si no hay API Key configurada.
    """
    with patch("services.groq_service.settings") as mock_settings:
        mock_settings.GROQ_API_KEY = ""
        with patch.dict("os.environ", {}, clear=True):
            service = GroqService()
            assert service.is_configured() is False

def test_chat_mechanics_sends_system_prompt_and_query(mock_groq_client):
    """
    Verifica que se envíe el prompt de sistema de mecánica y la consulta del usuario.
    """
    service = GroqService()
    response = service.chat_mechanics("¿Por qué chirrían mis frenos?")
    
    assert response == "Respuesta simulada de Groq LLM."
    
    # Verificar llamadas del cliente mockeado
    mock_groq_client.chat.completions.create.assert_called_once()
    call_args = mock_groq_client.chat.completions.create.call_args[1]
    
    messages = call_args["messages"]
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert "Ingeniero Mecánico" in messages[0]["content"]
    assert messages[1]["role"] == "user"
    assert messages[1]["content"] == "¿Por qué chirrían mis frenos?"

def test_chat_mechanics_appends_conversation_history(mock_groq_client):
    """
    Verifica que el historial previo se inyecte correctamente en el orden correcto.
    """
    history = [
        {"role": "user", "content": "Hola"},
        {"role": "assistant", "content": "Hola, soy el mecánico de Pitstop."}
    ]
    service = GroqService()
    service.chat_mechanics("Necesito cambiar el aceite", history=history)
    
    call_args = mock_groq_client.chat.completions.create.call_args[1]
    messages = call_args["messages"]
    
    # 1 system prompt + 2 history messages + 1 user query = 4
    assert len(messages) == 4
    assert messages[1]["content"] == "Hola"
    assert messages[2]["content"] == "Hola, soy el mecánico de Pitstop."
    assert messages[3]["content"] == "Necesito cambiar el aceite"

def test_chat_mechanics_handles_api_exception(mock_groq_client):
    """
    Verifica que las excepciones de llamada se capturen de manera segura y controlada.
    """
    mock_groq_client.chat.completions.create.side_effect = Exception("Groq Rate Limit Exceeded")
    
    service = GroqService()
    response = service.chat_mechanics("Consulta")
    
    assert "Error al conectar con la inteligencia artificial" in response
    assert "Groq Rate Limit Exceeded" in response

def test_chat_with_context_includes_rag_and_role(mock_groq_client):
    """
    Verifica que se envíe el contexto del RAG y el rol adecuado del usuario.
    """
    service = GroqService()
    response = service.chat_with_context(
        query="¿Cómo registro un coche?",
        context="Para registrar un vehículo, ingresa la matrícula en el panel.",
        user_role="CLIENT"
    )
    
    assert response == "Respuesta simulada de Groq LLM."
    
    call_args = mock_groq_client.chat.completions.create.call_args[1]
    messages = call_args["messages"]
    
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert "Cliente" in messages[0]["content"]
    assert "Asistente Oficial de Soporte" in messages[0]["content"]
    
    assert messages[1]["role"] == "user"
    assert "CONTEXTO DEL MANUAL" in messages[1]["content"]
    assert "Para registrar un vehículo" in messages[1]["content"]
    assert "¿Cómo registro un coche?" in messages[1]["content"]
