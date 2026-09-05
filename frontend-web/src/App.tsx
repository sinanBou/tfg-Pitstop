import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '@/index.css';
import AiAssistantChat from '@/features/ai-assistant/components/AiAssistantChat';
import { ToastProvider } from '@/hooks/useToast';

// Componentes
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import ClientDashboard from '@/pages/ClientDashboard'; 
import OwnerDashboard from '@/pages/OwnerDashboard';
import WorkshopAdminDashboard from '@/pages/WorkshopAdminDashboard';
import WorkerDashboard from '@/pages/WorkerDashboard';

import { LanguageProvider } from '@/i18n';

function App() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<'CLIENT' | 'WORKSHOP_STAFF' | 'WORKSHOP_MANAGER' | 'WORKSHOP_OWNER' | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role && ['CLIENT', 'WORKSHOP_STAFF', 'WORKSHOP_MANAGER', 'WORKSHOP_OWNER'].includes(role)) {
      setUserRole(role as any);
    } else {
      setUserRole(null);
    }
  }, [location]);

  const isPublicRoute = ['/', '/login', '/registration', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="h-full bg-black text-white flex flex-col relative">
          {/* CONTENIDO CAMBIANTE */}
          <main className="bg-black h-screen w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/workshop/:id" element={<WorkshopAdminDashboard />} />
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            </Routes>
          </main>

          {/* ASISTENTE DE IA FLOTANTE (Solo si está logueado y no está en una ruta pública) */}
          {userRole && !isPublicRoute && <AiAssistantChat userRole={userRole} />}
        </div>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;