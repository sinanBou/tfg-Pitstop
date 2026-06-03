import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/features/home/components/HeroSection";
import { Footer } from "@/features/home/components/FooterSection";
import { Button } from "@/components/common/Button/Button";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col bg-zinc-950 font-sans selection:bg-red-600/30 selection:text-white relative overflow-hidden">
      
      {/* Global Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none z-0"></div>

      {/* --- NAVBAR --- */}
      <nav className="w-full fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 animate-fade-in-up">
         <div className="w-full max-w-6xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg">
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">PitStop</h1>
            <div className="flex gap-4 items-center">
               <Button 
                 onClick={() => navigate('/login')} 
                 variant="ghost"
                 className="!px-4 !py-2.5 !text-[10px] md:!text-xs border-transparent hover:border-neutral-800"
               >
                 Iniciar Sesión
               </Button>
               <Button 
                 onClick={() => navigate('/registration')} 
                 variant="primary"
                 className="!px-5 !py-2.5 !text-[10px] md:!text-xs !bg-white !text-black hover:!bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-transparent"
                 glow={false}
               >
                 Registrarse
               </Button>
            </div>
         </div>
      </nav>

      <HeroSection />
      <Footer />

      {/* Estilos globales compartidos para home */}
      <style>{`
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
           100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
           animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           opacity: 0;
        }
        
        @keyframes line-pulse {
           0% { background-color: rgba(63, 63, 70, 0.2); }
           50% { background-color: rgba(63, 63, 70, 0.5); }
           100% { background-color: rgba(63, 63, 70, 0.2); }
        }
        .line-pulse {
           animation: line-pulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  ) 
}