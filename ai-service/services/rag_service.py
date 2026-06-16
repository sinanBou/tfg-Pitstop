"""
Módulo del servicio RAG (Generación Aumentada por Recuperación).
Se encarga de la vectorización de manuales con SentenceTransformers,
el almacenamiento en ChromaDB y la recuperación semántica basada en roles.
"""

import os
import chromadb
from sentence_transformers import SentenceTransformer
from config import settings

class RAGService:
    """
    Servicio de base de datos vectorial y embeddings para gestionar los manuales de usuario.
    Permite ingestar documentos Markdown y realizar búsquedas de similitud.
    """

    def __init__(self):
        """
        Inicializa el cliente persistente de ChromaDB y carga el modelo de embeddings SentenceTransformer.
        """
        # Crea el directorio de persistencia si no existe
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        
        # Inicializa el cliente local persistente de ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        
        # Carga el modelo local para generar embeddings vectoriales en CPU
        print("Cargando modelo local de embeddings semánticos (paraphrase-multilingual-MiniLM-L12-v2)...")
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("Modelo cargado con éxito.")
        
        # Obtiene o crea las colecciones segregadas para clientes y personal del taller (seguridad de datos)
        self.client_col = self.chroma_client.get_or_create_collection(
            name="client_manual",
            metadata={"hnsw:space": "cosine"}
        )
        self.staff_col = self.chroma_client.get_or_create_collection(
            name="staff_manual",
            metadata={"hnsw:space": "cosine"}
        )

    def ingest_manual(self, file_path: str, collection_type: str):
        """
        Lee un archivo Markdown de manual, lo fragmenta de manera inteligente y lo vectoriza en ChromaDB.

        Args:
            file_path (str): Ruta absoluta al archivo Markdown (.md).
            collection_type (str): Tipo de colección ('client' o 'staff').
        """
        if not os.path.exists(file_path):
            print(f"Error en ingesta: El archivo {file_path} no existe.")
            return

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Divide el manual en fragmentos utilizando los encabezados de segundo nivel '##'
        sections = content.split("\n## ")
        chunks = []
        
        # Agrega la primera sección si contiene texto (generalmente el título principal)
        first_sec = sections[0].strip()
        if first_sec:
            chunks.append(first_sec)
            
        for sec in sections[1:]:
            sec_text = "## " + sec.strip()
            # Si el fragmento de la sección supera los 1000 caracteres, se subdivide por párrafos
            if len(sec_text) > 1000:
                paragraphs = sec_text.split("\n\n")
                current_chunk = ""
                for para in paragraphs:
                    if len(current_chunk) + len(para) < 800:
                        current_chunk += "\n\n" + para if current_chunk else para
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = para
                if current_chunk:
                    chunks.append(current_chunk.strip())
            else:
                chunks.append(sec_text)

        # Filtra fragmentos vacíos o que solo contengan espacios en blanco
        chunks = [c for c in chunks if c.strip()]

        # Selecciona la colección destino adecuada según el tipo solicitado
        collection = self.client_col if collection_type == "client" else self.staff_col
        
        # Limpia datos previos de esa colección para evitar duplicados en re-ingestas
        try:
            existing = collection.get()
            if existing and existing["ids"]:
                collection.delete(ids=existing["ids"])
        except Exception as e:
            print(f"Aviso al limpiar colección: {e}")
            
        # Inserta los nuevos fragmentos y sus correspondientes embeddings vectoriales
        ids = [f"doc_{collection_type}_{i}" for i in range(len(chunks))]
        embeddings = [self.model.encode(c).tolist() for c in chunks]
        metadatas = [{"source": os.path.basename(file_path), "index": i} for i in range(len(chunks))]
        
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        print(f" Ingesta finalizada: {len(chunks)} fragmentos vectorizados en '{collection_type}_manual'.")

    def query_manual(self, query: str, user_role: str, k: int = 3) -> str:
        """
        Realiza una consulta semántica para recuperar los fragmentos más relevantes del manual.

        Args:
            query (str): Término o pregunta de búsqueda semántica.
            user_role (str): Rol del usuario que realiza la consulta para determinar la colección a usar.
            k (int, optional): Número máximo de fragmentos relevantes a recuperar. Por defecto es 3.

        Returns:
            str: Fragmentos recuperados concatenados o un mensaje de error/advertencia.
        """
        collection_type = "client" if user_role.upper() == "CLIENT" else "staff"
        collection = self.client_col if collection_type == "client" else self.staff_col

        # Comprueba si la colección tiene documentos indexados
        count = collection.count()
        if count == 0:
            return "El manual operativo no ha sido indexado en la base de datos de vectores."

        # Vectoriza la consulta del usuario
        query_embedding = self.model.encode(query).tolist()
        
        # Realiza la consulta por similitud de coseno
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(k, count)
        )
        
        documents = results.get("documents", [[]])[0]
        if not documents:
            return "No se ha encontrado información específica en el manual de usuario."
            
        # Devuelve los fragmentos más relevantes separados por líneas divisoras
        return "\n\n---\n\n".join(documents)

# Instancia global para ser utilizada en el microservicio de IA
rag_service = RAGService()
