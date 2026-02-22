export default function WorkshopDashboard() {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-500">Panel de Taller</h1>
                    <p className="text-gray-400">Gestiona tus reparaciones y clientes</p>
                </div>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                    Cerrar Sesión
                </button>
            </header>  
        </div>
    )
}