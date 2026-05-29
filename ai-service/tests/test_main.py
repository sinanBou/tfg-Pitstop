import pytest
from unittest.mock import patch, MagicMock

def test_health_check_endpoint(client):
    """
    Test para verificar que el endpoint de salud responde correctamente.
    """
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "groq_configured" in data
    assert "client_manual_chunks" in data
    assert "staff_manual_chunks" in data

def test_chat_mechanics_endpoint_success(client):
    """
    Test para verificar el éxito de la consulta al chat mecánico.
    """
    payload = {
        "query": "¿Cómo cambio las bujías?",
        "history": []
    }
    
    with patch("services.groq_service.groq_service.chat_mechanics") as mock_chat:
        mock_chat.return_value = "Paso 1: Localiza las bujías..."
        
        response = client.post("/api/ai/chat/mechanics", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "Paso 1: Localiza las bujías..."
        mock_chat.assert_called_once_with("¿Cómo cambio las bujías?", [])

def test_chat_mechanics_endpoint_empty_query(client):
    """
    Test para verificar que consultas vacías al chat mecánico devuelvan 400 Bad Request.
    """
    payload = {
        "query": "   ",
        "history": []
    }
    
    response = client.post("/api/ai/chat/mechanics", json=payload)
    
    assert response.status_code == 400
    assert "La consulta no puede estar vacía." in response.json()["detail"]

def test_chat_manual_endpoint_success(client):
    """
    Test para verificar la consulta RAG al manual con rol y contexto exitosa.
    """
    payload = {
        "query": "¿Cómo imprimo mi factura?",
        "role": "CLIENT"
    }
    
    with patch("services.rag_service.rag_service.query_manual") as mock_rag, \
         patch("services.groq_service.groq_service.chat_with_context") as mock_groq:
         
        mock_rag.return_value = "Contexto sobre descargas de facturas en PDF..."
        mock_groq.return_value = "Para imprimir tu factura, ve al historial de citas."
        
        response = client.post("/api/ai/chat/manual", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["response"] == "Para imprimir tu factura, ve al historial de citas."
        assert data["role_applied"] == "CLIENT"
        
        mock_rag.assert_called_once_with("¿Cómo imprimo mi factura?", "CLIENT")
        mock_groq.assert_called_once_with("¿Cómo imprimo mi factura?", "Contexto sobre descargas de facturas en PDF...", "CLIENT")

def test_chat_manual_endpoint_empty_query(client):
    """
    Test para verificar que consultas vacías al chat de manuales devuelvan 400 Bad Request.
    """
    payload = {
        "query": "",
        "role": "CLIENT"
    }
    
    response = client.post("/api/ai/chat/manual", json=payload)
    
    assert response.status_code == 400
    assert "La consulta no puede estar vacía." in response.json()["detail"]

def test_force_ingest_endpoint(client):
    """
    Test para verificar la re-ingesta manual/forzada de manuales.
    """
    with patch("services.rag_service.rag_service.ingest_manual") as mock_ingest:
        response = client.post("/api/ai/manual/ingest")
        
        assert response.status_code == 200
        assert "excepcional" not in response.text
        assert "Re-ingesta y vectorización forzada con éxito." in response.json()["message"]
        
        # Debe haber llamado a la ingesta para ambos perfiles (client y staff)
        assert mock_ingest.call_count == 2
