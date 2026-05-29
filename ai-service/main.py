import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from config import settings
from services.groq_service import groq_service
from services.rag_service import rag_service

app = FastAPI(
    title="Pitstop AI Assistant Service",
    description="Microservicio de IA independiente para soporte mecánico e interactivo RAG de Pitstop.",
    version="1.0.0"
)

# Configuración de CORS para permitir solicitudes del Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir a los dominios del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de Pydantic para validación de entrada
class MechanicsChatRequest(BaseModel):
    query: str
    history: Optional[List[dict]] = None

class ManualChatRequest(BaseModel):
    query: str
    role: str  # CLIENT, WORKSHOP_STAFF, WORKSHOP_MANAGER, WORKSHOP_OWNER

# Evento de inicio: Ingesta automática de manuales para garantizar consistencia
@app.on_event("startup")
def startup_event():
    print("🤖 Iniciando Microservicio de IA...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    manual_cliente_path = os.path.join(base_dir, "data", "manual_cliente.md")
    manual_taller_path = os.path.join(base_dir, "data", "manual_taller.md")
    
    print("Ingestando manual de clientes...")
    rag_service.ingest_manual(manual_cliente_path, "client")
    
    print("Ingestando manual operativo del taller...")
    rag_service.ingest_manual(manual_taller_path, "staff")
    
    print("🤖 ¡Microservicio de IA listo para recibir peticiones!")

@app.get("/api/ai/health")
def health_check():
    return {
        "status": "healthy",
        "groq_configured": groq_service.is_configured(),
        "client_manual_chunks": rag_service.client_col.count(),
        "staff_manual_chunks": rag_service.staff_col.count()
    }

@app.post("/api/ai/chat/mechanics")
def chat_mechanics(request: MechanicsChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")
    
    response = groq_service.chat_mechanics(request.query, request.history)
    return {"response": response}

@app.post("/api/ai/chat/manual")
def chat_manual(request: ManualChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")
    
    # 1. Recuperar contexto semántico de la base de datos vectorial ChromaDB según su rol
    context = rag_service.query_manual(request.query, request.role)
    
    # 2. Sintetizar respuesta contextual usando Groq
    response = groq_service.chat_with_context(request.query, context, request.role)
    
    return {
        "response": response,
        "role_applied": request.role
    }

@app.post("/api/ai/manual/ingest")
def force_ingest():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    manual_cliente_path = os.path.join(base_dir, "data", "manual_cliente.md")
    manual_taller_path = os.path.join(base_dir, "data", "manual_taller.md")
    
    rag_service.ingest_manual(manual_cliente_path, "client")
    rag_service.ingest_manual(manual_taller_path, "staff")
    
    return {"message": "Re-ingesta y vectorización forzada con éxito."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
