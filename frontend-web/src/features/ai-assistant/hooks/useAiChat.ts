import { useState, useEffect, useRef } from 'react';
import { askMechanic, askManual, checkAiHealth } from '../services/aiApi';
import type { ChatMessage } from '@/types/ai';



export function useAiChat(userRole: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('pitstop_ai_chat_messages');
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

  // Guardar mensajes en la caché de sesión para mantener el chat fluido al cambiar de página
  useEffect(() => {
    sessionStorage.setItem('pitstop_ai_chat_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Verificar la conexión y salud del microservicio al abrir el chat
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
    const interval = setInterval(verifyHealth, 15000); // Re-verificar cada 15 segundos
    return () => clearInterval(interval);
  }, []);

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
        reply = 'Lo sentimos, el microservicio de Inteligencia Artificial independiente de Pitstop no se encuentra activo o cargando. Por favor, asegúrate de iniciar el microservicio en local (puerto 8000).';
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
    sessionStorage.removeItem('pitstop_ai_chat_messages');
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
