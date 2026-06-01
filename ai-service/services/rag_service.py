import os
import chromadb
from sentence_transformers import SentenceTransformer
from config import settings

class RAGService:
    def __init__(self):
        # Directorio de persistencia
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        
        # Inicializar cliente de ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        
        # Cargar modelo local de embeddings
        print("Cargando modelo local de embeddings semánticos (all-MiniLM-L6-v2)...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Modelo cargado con éxito.")
        
        # Obtener o crear colecciones segregadas
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
        Lee un manual en Markdown, lo divide en fragmentos lógicos
        y los almacena vectorizados en ChromaDB.
        """
        if not os.path.exists(file_path):
            print(f"Error en ingesta: El archivo {file_path} no existe.")
            return

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Dividimos el manual en fragmentos utilizando encabezados y párrafos
        sections = content.split("\n## ")
        chunks = []
        
        # El primer elemento puede contener el título principal
        first_sec = sections[0].strip()
        if first_sec:
            chunks.append(first_sec)
            
        for sec in sections[1:]:
            sec_text = "## " + sec.strip()
            # Si la sección es demasiado grande, la dividimos por párrafos
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

        # Filtrar fragmentos vacíos
        chunks = [c for c in chunks if c.strip()]

        # Seleccionar colección
        collection = self.client_col if collection_type == "client" else self.staff_col
        
        # Limpiar datos previos para evitar duplicados en re-ingesta
        try:
            existing = collection.get()
            if existing and existing["ids"]:
                collection.delete(ids=existing["ids"])
        except Exception as e:
            print(f"Aviso al limpiar colección: {e}")
            
        # Insertar nuevos fragmentos
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
        Realiza una búsqueda semántica de los k fragmentos más parecidos
        en la colección correspondiente al rol del usuario.
        """
        collection_type = "client" if user_role.upper() == "CLIENT" else "staff"
        collection = self.client_col if collection_type == "client" else self.staff_col

        # Verificar si hay documentos cargados
        count = collection.count()
        if count == 0:
            return "El manual operativo no ha sido indexado en la base de datos de vectores."

        # Vectorizar consulta
        query_embedding = self.model.encode(query).tolist()
        
        # Consulta semántica
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(k, count)
        )
        
        documents = results.get("documents", [[]])[0]
        if not documents:
            return "No se ha encontrado información específica en el manual de usuario."
            
        return "\n\n---\n\n".join(documents)

rag_service = RAGService()
