import { useEffect, useRef, useState } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: any) => void;
  clientId?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  clientId = '726404400773-96f4turaj551sb6sqmgb9g8n1qqrujq3.apps.googleusercontent.com'
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Sincronizar siempre los callbacks más recientes para evitar stale closures
  useEffect(() => {
    window.__google_gsi_callback = (response: any) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else if (onError) {
        onError(new Error('No se recibió la credencial de Google.'));
      }
    };
  }, [onSuccess, onError]);

  useEffect(() => {
    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGoogleSignIn = () => {
      try {
        if (window.google) {
          // Evitar inicializar múltiples veces GSI para esquivar la advertencia del logger de Google
          if (!window.__google_gsi_initialized) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: (response: any) => {
                if (window.__google_gsi_callback) {
                  window.__google_gsi_callback(response);
                }
              },
              auto_select: false,
            });
            window.__google_gsi_initialized = true;
          }

          // Renderizar el botón con estilos premium adaptados a tema oscuro y ancho numérico correcto
          if (containerRef.current) {
            window.google.accounts.id.renderButton(containerRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'signin_with',
              shape: 'pill',
              width: 384, // Ancho numérico en píxeles para evitar advertencia de "100%"
              logo_alignment: 'left',
            });
          }
        }
      } catch (err) {
        console.error('Error al inicializar Google Sign-In:', err);
        if (onError) onError(err);
      }
    };

    if (window.google) {
      setIsScriptLoaded(true);
      initializeGoogleSignIn();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        initializeGoogleSignIn();
      };
      script.onerror = (err) => {
        console.error('Fallo al cargar el script de Google GSI:', err);
        if (onError) onError(err);
      };
      document.body.appendChild(script);
    } else {
      const handleLoad = () => {
        setIsScriptLoaded(true);
        initializeGoogleSignIn();
      };
      script.addEventListener('load', handleLoad);
      return () => {
        script?.removeEventListener('load', handleLoad);
      };
    }
  }, [clientId, onError]);

  // Si cambia el estado de carga o renderizado, forzar el render del botón
  useEffect(() => {
    if (isScriptLoaded && window.google && containerRef.current) {
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 384, // Ancho numérico en píxeles para evitar advertencia de "100%"
        logo_alignment: 'left',
      });
    }
  }, [isScriptLoaded]);

  return (
    <div className="w-full flex justify-center py-2 transition-transform duration-300 active:scale-[0.98]">
      {/* Contenedor del botón nativo de Google */}
      <div ref={containerRef} className="w-full max-w-sm overflow-hidden rounded-full shadow-[0_0_15px_rgba(0,0,0,0.4)] border border-neutral-800" />
    </div>
  );
}

declare global {
  interface Window {
    google?: any;
    __google_gsi_initialized?: boolean;
    __google_gsi_callback?: (response: any) => void;
  }
}
