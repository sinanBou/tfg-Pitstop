import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  // Determinamos si ocultar los botones de acción según la ruta actual
  const homeBar = location.pathname === '/' ? true : false;
  const authBar = location.pathname === '/login' || location.pathname === '/registration' ? true : false;

  const handleLogout = () => {
    // 1. Borramos los datos del almacenamiento local
    localStorage.removeItem('jwt_token'); 
    localStorage.removeItem('role');
    
    localStorage.clear(); 

    navigate('/');
  };
  return (
    <nav className="bg-black/80 backdrop-blur-md h-12 w-full px-5 flex items-center justify-between text-white border-b border-white/10">
      <div className="text-xl p-1">
        <Link to="/" className="font-bold text-3xl">
          PitStop
        </Link>
      </div>

      {homeBar && (
        <div className="flex gap-4 text-md font-bold">
          <Link 
            to="/login" 
            className="border border-white rounded px-2 p-1 hover:bg-white/20 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            to="/registration" 
            className="bg-red-600 text-white rounded px-2 p-1 hover:bg-red-700 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      )}
      {!homeBar && !authBar && (
        <div className="flex gap-4 text-xl font-bold">
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white rounded px-4 py-1 hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}