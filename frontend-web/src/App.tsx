import { Routes, Route } from 'react-router-dom';
import './index.css';

// Componentes
import Navbar from './components/layout/Navbar'; // Importa el nuevo componente
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';

import ClientDashboard from './pages/ClientDashboard'; 
import WorkshopDashboard from './pages/WorkshopDashboard';

function App() {
  return (
    <div className="h-full bg-black text-white flex flex-col">
      <Navbar />

      {/* CONTENIDO CAMBIANTE */}
      <main className="bg-black h-screen w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/workshop-dashboard" element={<WorkshopDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;