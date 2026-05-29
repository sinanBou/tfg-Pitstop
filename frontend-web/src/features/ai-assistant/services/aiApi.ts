import type { ChatMessage } from '@/types/ai';


const AI_API_BASE_URL = 'http://localhost:8000/api/ai';


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
    return 'Lo sentimos, hubo un problema al conectar con el asistente de mecánica. Asegúrate de que el microservicio de IA esté ejecutándose localmente.';
  }
}

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
    return 'Lo sentimos, hubo un problema al consultar el manual de la aplicación. Asegúrate de que el microservicio de IA esté ejecutándose localmente.';
  }
}

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
