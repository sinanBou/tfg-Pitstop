"""
Módulo principal del microservicio de IA para Pitstop.
Define la API REST con FastAPI, los endpoints para consultas generales y RAG,
e inicializa la ingesta de los manuales de usuario al arrancar.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from config import settings
from services.groq_service import groq_service
from services.rag_service import rag_service

# Inicialización de la aplicación FastAPI y metadatos descriptivos
app = FastAPI(
    title="Pitstop AI Assistant Service",
    description="Microservicio de IA independiente para soporte mecánico e interactivo RAG de Pitstop.",
    version="1.0.0"
)

# Configuración de CORS para permitir solicitudes del Frontend en desarrollo/producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MechanicsChatRequest(BaseModel):
    """
    Modelo de datos para la solicitud de consulta mecánica.
    """
    query: str
    history: Optional[List[dict]] = None

class ManualChatRequest(BaseModel):
    """
    Modelo de datos para la solicitud de consulta sobre los manuales de usuario (RAG).
    """
    query: str
    role: str  # Los roles permitidos son: CLIENT, WORKSHOP_STAFF, WORKSHOP_MANAGER, WORKSHOP_OWNER

@app.on_event("startup")
def startup_event():
    """
    Evento que se ejecuta automáticamente al arrancar la aplicación.
    Realiza la lectura e ingesta inicial de los manuales Markdown en la base de datos vectorial ChromaDB.
    """
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
    """
    Endpoint de comprobación del estado y salud del servicio.

    Returns:
        dict: Estado del servicio, configuración de la API Key e información de fragmentos vectorizados.
    """
    return {
        "status": "healthy",
        "groq_configured": groq_service.is_configured(),
        "client_manual_chunks": rag_service.client_col.count(),
        "staff_manual_chunks": rag_service.staff_col.count()
    }

@app.post("/api/ai/chat/mechanics")
def chat_mechanics(request: MechanicsChatRequest):
    """
    Endpoint para chatear con el asistente de mecánica especializada.

    Args:
        request (MechanicsChatRequest): Datos de la consulta e historial.

    Returns:
        dict: Respuesta del asistente mecánico.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")
    
    response = groq_service.chat_mechanics(request.query, request.history)
    return {"response": response}

@app.post("/api/ai/chat/manual")
def chat_manual(request: ManualChatRequest):
    """
    Endpoint RAG para responder a preguntas sobre la aplicación basándose en los manuales indexados.

    Args:
        request (ManualChatRequest): Datos de la consulta y el rol del usuario.

    Returns:
        dict: Respuesta generada a partir del contexto del manual y rol correspondiente.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía.")
    
    # 1. Recupera el contexto semántico más relevante de ChromaDB en función del rol del usuario
    context = rag_service.query_manual(request.query, request.role)
    
    # 2. Sintetiza la respuesta final con Groq usando el contexto y aplicando el tono del rol
    response = groq_service.chat_with_context(request.query, context, request.role)
    
    return {
        "response": response,
        "role_applied": request.role
    }

@app.post("/api/ai/manual/ingest")
def force_ingest():
    """
    Endpoint para forzar manualmente la re-ingesta y vectorización de los manuales Markdown.

    Returns:
        dict: Mensaje de confirmación del éxito de la operación.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    manual_cliente_path = os.path.join(base_dir, "data", "manual_cliente.md")
    manual_taller_path = os.path.join(base_dir, "data", "manual_taller.md")
    
    rag_service.ingest_manual(manual_cliente_path, "client")
    rag_service.ingest_manual(manual_taller_path, "staff")
    
    return {"message": "Re-ingesta y vectorización forzada con éxito."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)

