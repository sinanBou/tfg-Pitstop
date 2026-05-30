export const DashboardIcon = ({ tipo, active }: { tipo: number; active: boolean }) => {
  const cls = `w-7 h-7 transition-colors duration-300 ${active ? 'stroke-blue-500' : 'stroke-gray-600'}`;
  
  const icons = [
    // Home
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    // Vehículos
    <g><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M5 17H2v-2c0-1.1.9-2 2-2h1l2.5-5h9l2.5 5h1c1.1 0 2 .9 2 2v2h-3" /><path d="M9 17h6" /><path d="M7.5 13l2-5h5l2 5H7.5z" /><path d="M12 8v5" /></g>,
    // Citas
    <g><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></g>,
    // Historial
    <g><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></g>
  ];

  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {icons[tipo]}
    </svg>
  );
};