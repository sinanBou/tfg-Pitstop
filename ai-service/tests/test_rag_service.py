import os
import tempfile
import pytest
from unittest.mock import MagicMock, patch
from services.rag_service import RAGService

@pytest.fixture
def temp_markdown_file():
    """
    Fixture que crea un archivo Markdown temporal con contenido de prueba.
    """
    content = (
        "# Manual de Pitstop\n\n"
        "Este es el título inicial del manual.\n\n"
        "## Sección de Registro\n\n"
        "Para añadir un nuevo coche a tu garaje, debes ingresar a la sección de vehículos.\n"
        "Introduce la matrícula y el kilometraje actual.\n\n"
        "## Sección de Facturas\n\n"
        "Puedes descargar e imprimir tu factura en PDF directamente desde el historial de citas.\n"
        "El navegador te dará la opción de guardar el archivo localmente.\n"
    )
    with tempfile.NamedTemporaryFile(suffix=".md", delete=False, mode="w", encoding="utf-8") as f:
        f.write(content)
        temp_path = f.name
    yield temp_path
    if os.path.exists(temp_path):
        os.remove(temp_path)

def test_ingest_manual_creates_chunks(temp_markdown_file, mock_sentence_transformer):
    """
    Verifica que la ingesta procese correctamente las secciones en chunks y los guarde.
    """
    # Inicializar RAGService con ChromaDB in-memory mockeado
    with patch("services.rag_service.chromadb.PersistentClient") as mock_chroma:
        mock_client = MagicMock()
        mock_chroma.return_value = mock_client
        
        # Mock de las colecciones de ChromaDB
        mock_col = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_col
        mock_col.get.return_value = {"ids": []}  # Colección inicialmente vacía
        
        service = RAGService()
        service.ingest_manual(temp_markdown_file, "client")
        
        # Debe llamar al SentenceTransformer para codificar los fragmentos
        assert mock_sentence_transformer.encode.called
        
        # Debe llamar a add para almacenar los fragmentos en la colección
        assert mock_col.add.called
        call_kwargs = mock_col.add.call_args[1]
        
        # Deben haber al menos 3 fragmentos (título inicial + 2 encabezados ##)
        assert len(call_kwargs["ids"]) >= 3
        assert "doc_client_0" in call_kwargs["ids"]
        assert "Sección de Registro" in call_kwargs["documents"][1]

def test_ingest_manual_cleans_previous_entries(temp_markdown_file, mock_sentence_transformer):
    """
    Verifica que la re-ingesta limpie las entradas anteriores para evitar duplicados.
    """
    with patch("services.rag_service.chromadb.PersistentClient") as mock_chroma:
        mock_client = MagicMock()
        mock_chroma.return_value = mock_client
        
        mock_col = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_col
        
        # Simular que ya existen fragmentos previos
        mock_col.get.return_value = {"ids": ["doc_client_0", "doc_client_1"]}
        
        service = RAGService()
        service.ingest_manual(temp_markdown_file, "client")
        
        # Debe llamar a delete para limpiar la base de datos antes de insertar
        mock_col.delete.assert_called_once_with(ids=["doc_client_0", "doc_client_1"])

def test_query_manual_returns_closest_chunks(mock_sentence_transformer):
    """
    Verifica la recuperación semántica del contexto del manual según el rol.
    """
    with patch("services.rag_service.chromadb.PersistentClient") as mock_chroma:
        mock_client = MagicMock()
        mock_chroma.return_value = mock_client
        
        mock_col = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_col
        mock_col.count.return_value = 10
        
        # Simular resultado de consulta de ChromaDB
        mock_col.query.return_value = {
            "documents": [["## Sección de Facturas\n\nPuedes descargar e imprimir tu factura en PDF."]]
        }
        
        service = RAGService()
        result = service.query_manual("¿Cómo descargo mi factura?", "CLIENT")
        
        # Debe vectorizar la consulta y consultar a la colección correcta
        assert mock_sentence_transformer.encode.called
        mock_col.query.assert_called_once()
        assert "factura" in result

def test_query_manual_empty_db():
    """
    Verifica el comportamiento cuando no hay datos ingestados en ChromaDB.
    """
    with patch("services.rag_service.chromadb.PersistentClient") as mock_chroma:
        mock_client = MagicMock()
        mock_chroma.return_value = mock_client
        
        mock_col = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_col
        mock_col.count.return_value = 0
        
        service = RAGService()
        result = service.query_manual("consulta", "CLIENT")
        
        assert "no ha sido indexado" in result
