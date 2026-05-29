import React from 'react';
import { useAiChat } from '../../hooks/useAiChat';

interface AiAssistantChatProps {
  userRole: 'CLIENT' | 'WORKSHOP_STAFF' | 'WORKSHOP_MANAGER' | 'WORKSHOP_OWNER';
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({ userRole }) => {
  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    mode,
    setMode,
    isLoading,
    isServerUp,
    messagesEndRef,
    handleSendMessage,
    clearChat
  } = useAiChat(userRole);

  // Parseador de Markdown extremadamente liviano, rápido y seguro de cero dependencias
  const renderMessageContent = (text: string) => {
    // Escapar HTML básico para prevenir XSS
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convertir títulos ### o ## o #
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold mt-2.5 mb-1 text-slate-100 uppercase tracking-wider">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h3 class="text-sm font-bold mt-2.5 mb-1 text-slate-100 uppercase tracking-wider">$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h3 class="text-sm font-bold mt-2.5 mb-1 text-slate-100 uppercase tracking-wider">$1</h3>');

    // Convertir negrita **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');

    // Convertir cursiva *texto*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Convertir listas con viñetas "- item" o "* item"
    html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li class="mb-0.5 list-disc ml-4 text-slate-300">$1</li>');
    // Envolver elementos li adyacentes en ul
    html = html.replace(/(<li class="mb-0.5 list-disc ml-4 text-slate-300">.*?<\/li>)+/g, '<ul class="my-2">$&</ul>');

    // Convertir saltos de línea a <br /> si no están en una lista o etiqueta de bloque
    html = html.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-[13.5px] leading-relaxed text-slate-300" />;
  };

  return (
    <>
      {/* Burbuja flotante de Chat (Diseño limpio y plano con simple hover) */}
      <div 
        className="fixed bottom-6 right-6 w-[56px] h-[56px] rounded-full bg-zinc-800 border border-white/10 shadow-lg flex justify-center items-center cursor-pointer z-[9999] transition-colors duration-200 hover:bg-red-600 hover:border-red-500/20 group"
        onClick={() => setIsOpen(!isOpen)}
        title="Asistente de Inteligencia Artificial Pitstop"
      >
        <svg 
          className="w-6 h-6 text-slate-100 transition-transform duration-200 group-hover:scale-105"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        
        {/* Indicador visual de estado del servidor en caliente */}
        <span className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-zinc-800 ${
          isServerUp ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {/* Ventana de Conversación del Asistente (Instante, sin animaciones complejas) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl bg-zinc-900/95 backdrop-blur-[12px] border border-white/5 shadow-2xl flex flex-col overflow-hidden z-[9998]">
          {/* Cabecera */}
          <div className="px-5 py-4 bg-zinc-900 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex justify-center items-center shadow-md">
                <span className="font-bold text-[15px] text-white">P</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white tracking-wide font-sans m-0">Asistente Pitstop</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-widest font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isServerUp ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isServerUp ? 'Conectado (Groq AI)' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat} 
                className="bg-transparent border-none text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg cursor-pointer transition-colors duration-200 flex justify-center items-center"
                title="Limpiar Conversación"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-transparent border-none text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg cursor-pointer transition-colors duration-200 flex justify-center items-center"
                title="Cerrar Chat"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="flex p-2 bg-zinc-900 border-b border-white/5 gap-2">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 flex justify-center items-center gap-1.5 font-sans ${
                mode === 'manual' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Manual de Uso
            </button>
            <button
              onClick={() => setMode('mechanics')}
              className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-200 flex justify-center items-center gap-1.5 font-sans ${
                mode === 'mechanics' 
                  ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Asistente Mecánico
            </button>
          </div>

          {/* Listado de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-zinc-900/40">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-zinc-800 text-slate-200 rounded-bl-none border border-white/5'
                }`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            
            {/* Pensando... */}
            {isLoading && (
              <div className="flex w-full justify-start animate-pulse">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans bg-zinc-800 text-slate-200 rounded-bl-none border border-white/5">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <div className="p-4 bg-zinc-900 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  !isServerUp 
                    ? "Inicie el servidor de IA..." 
                    : mode === 'manual' 
                      ? "Preguntar sobre el uso de la app..." 
                      : "Describir consulta o fallo mecánico..."
                }
                className="flex-1 bg-zinc-850 border border-white/5 rounded-xl px-4 py-3 text-white text-[13.5px] font-sans placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors duration-200 disabled:bg-zinc-950 disabled:text-slate-700 disabled:border-white/5"
                disabled={isLoading || !isServerUp}
                autoFocus
              />
              <button 
                type="submit" 
                className="bg-red-600 text-white border-none w-11 h-11 rounded-xl flex justify-center items-center cursor-pointer transition-colors duration-200 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-slate-600 disabled:cursor-not-allowed"
                disabled={!input.trim() || isLoading || !isServerUp}
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistantChat;
