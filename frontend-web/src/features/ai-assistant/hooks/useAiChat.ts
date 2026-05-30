import { useState, useEffect, useRef } from 'react';
import { askMechanic, askManual, checkAiHealth } from '../services/aiApi';
import type { ChatMessage } from '@/types/ai';

// Función helper pura para decodificar de forma segura el JWT token desde el cliente
const decodeToken = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function useAiChat(userRole: string) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Obtener el identificador único del usuario para aislar completamente su historial
  const token = localStorage.getItem('jwt_token');
  const decoded = decodeToken(token);
  const userEmail = decoded?.sub || 'default';
  const chatKey = `pitstop_ai_chat_messages_${userEmail}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem(chatKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        role: 'assistant',
        content: `¡Hola! Soy tu asistente inteligente de **Pitstop**. 🤖\n\n¿En qué te puedo ayudar hoy? Escribe tu consulta abajo.`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'mechanics' | 'manual'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerUp, setIsServerUp] = useState(false);
  const [isGroqConfigured, setIsGroqConfigured] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recargar los mensajes cuando el chatKey cambia (ej. cambio de usuario)
  useEffect(() => {
    const saved = sessionStorage.getItem(chatKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // Fallback en caso de error de parseo
      }
    } else {
      setMessages([
        {
          role: 'assistant',
          content: `¡Hola! Soy tu asistente inteligente de **Pitstop**. 🤖\n\n¿En qué te puedo ayudar hoy? Escribe tu consulta abajo.`
        }
      ]);
    }
  }, [chatKey]);

  // Guardar mensajes en la caché de sesión para mantener el chat fluido al cambiar de página
  useEffect(() => {
    sessionStorage.setItem(chatKey, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, chatKey]);

  // 1. Verificar la conexión y salud del microservicio una sola vez al montar (para pintar el led rojo/verde)
  useEffect(() => {
    const verifyHealth = async () => {
      const health = await checkAiHealth();
      if (health.status === 'healthy') {
        setIsServerUp(true);
        setIsGroqConfigured(health.groq_configured);
      } else {
        setIsServerUp(false);
        setIsGroqConfigured(false);
      }
    };
    verifyHealth();
  }, []);

  // 2. Intervalo activo de re-verificación SOLO mientras la ventana de chat está abierta (Optimización de recursos)
  useEffect(() => {
    if (!isOpen) return;

    const verifyHealth = async () => {
      const health = await checkAiHealth();
      if (health.status === 'healthy') {
        setIsServerUp(true);
        setIsGroqConfigured(health.groq_configured);
      } else {
        setIsServerUp(false);
        setIsGroqConfigured(false);
      }
    };
    
    const interval = setInterval(verifyHealth, 15000); // Re-verificar cada 15 segundos mientras está abierto
    return () => clearInterval(interval);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    // Añadir mensaje del usuario al chat
    const newMessages = [...messages, { role: 'user', content: userText } as ChatMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let reply = '';
      if (!isServerUp) {
        reply = 'El asistente IA no está disponible en estos momentos';
      } else if (mode === 'mechanics') {
        // Enviar consulta de mecánica directa con historial
        reply = await askMechanic(userText, messages.slice(-6)); // Enviamos las últimas 3 parejas de mensajes como contexto
      } else {
        // Enviar consulta del manual filtrada por el rol de usuario
        reply = await askManual(userText, userRole);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Error sending message to AI assistant:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ocurrió un error inesperado al procesar tu solicitud. Por favor, inténtalo de nuevo.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const defaultWelcome = {
      role: 'assistant',
      content: `¡Hola! Soy tu asistente inteligente de **Pitstop**. 🤖\n\n¿En qué te puedo ayudar hoy? Escribe tu consulta abajo.`
    } as ChatMessage;
    setMessages([defaultWelcome]);
    sessionStorage.removeItem(chatKey);
  };

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    mode,
    setMode,
    isLoading,
    isServerUp,
    isGroqConfigured,
    messagesEndRef,
    handleSendMessage,
    clearChat
  };
}
