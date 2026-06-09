/**
 * Representa un mensaje individual dentro de la conversación del chat del Asistente IA.
 */
export interface ChatMessage {
  /** Emisor del mensaje (usuario final o el asistente de IA). */
  role: 'user' | 'assistant';
  /** Contenido de texto en formato plano o Markdown del mensaje. */
  content: string;
}

/**
 * Propiedades de entrada para el componente AiAssistantChat.
 */
export interface AiAssistantChatProps {
  /** Rol de acceso del usuario autenticado (para contextualizar el manual). */
  userRole: 'CLIENT' | 'WORKSHOP_STAFF' | 'WORKSHOP_MANAGER' | 'WORKSHOP_OWNER';
}

