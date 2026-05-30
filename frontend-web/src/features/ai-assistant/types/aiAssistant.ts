export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiAssistantChatProps {
  userRole: 'CLIENT' | 'WORKSHOP_STAFF' | 'WORKSHOP_MANAGER' | 'WORKSHOP_OWNER';
}
