export const staffAppointmentStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
  
  @keyframes fade-in-up {
     0% { opacity: 0; transform: translateY(20px); }
     100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
     animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
     opacity: 0;
  }
`;
