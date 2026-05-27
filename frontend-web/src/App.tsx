import { Routes, Route } from 'react-router-dom';
import '@/index.css';

// Componentes
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';

import ClientDashboard from '@/pages/ClientDashboard'; 
import OwnerDashboard from '@/pages/OwnerDashboard';
import WorkshopAdminDashboard from '@/pages/WorkshopAdminDashboard';
import WorkerDashboard from '@/pages/WorkerDashboard';

function App() {
  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* CONTENIDO CAMBIANTE */}
      <main className="bg-black h-screen w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/workshop/:id" element={<WorkshopAdminDashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;