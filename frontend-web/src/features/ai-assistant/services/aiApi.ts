import type { ChatMessage } from '../types/aiAssistant';


const AI_API_BASE_URL = '/api/ai';


/**
 * Envía una consulta técnica sobre mecánica de vehículos al asistente inteligente (AI),
 * incluyendo el historial de conversación actual para mantener el contexto del diálogo.
 * @param query Pregunta técnica formulada por el usuario.
 * @param history Historial acumulado de mensajes en el chat.
 * @returns La respuesta de texto generada por la IA o un mensaje de error por defecto.
 */
export async function askMechanic(query: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/chat/mechanics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history })
    });
    if (!res.ok) {
      throw new Error('Error al conectar con el asistente de mecánica');
    }
    const data = await res.json();
    return data.response;
  } catch (error) {
    console.error('Error in askMechanic:', error);
    return 'El asistente IA no está disponible en estos momentos';
  }
}

/**
 * Consulta el manual de usuario o especificaciones del taller al asistente IA según el rol del usuario.
 * @param query Pregunta formulada por el usuario.
 * @param role Rol del usuario consultante (ej: WORKSHOP_OWNER, CLIENT).
 * @returns La respuesta de texto generada por la IA o un mensaje de error por defecto.
 */
export async function askManual(query: string, role: string): Promise<string> {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/chat/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, role })
    });
    if (!res.ok) {
      throw new Error('Error al conectar con el asistente del manual');
    }
    const data = await res.json();
    return data.response;
  } catch (error) {
    console.error('Error in askManual:', error);
    return 'El asistente IA no está disponible en estos momentos';
  }
}

/**
 * Comprueba el estado de disponibilidad de la API de IA y si el proveedor Groq está configurado.
 * @returns Estado del servicio ('up'/'down') e indicador de si Groq está listo.
 */
export async function checkAiHealth(): Promise<{ status: string; groq_configured: boolean }> {
  try {
    const res = await fetch(`${AI_API_BASE_URL}/health`);
    if (res.ok) {
      return await res.json();
    }
    return { status: 'down', groq_configured: false };
  } catch {
    return { status: 'down', groq_configured: false };
  }
}

