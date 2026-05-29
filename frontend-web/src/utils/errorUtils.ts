/**
 * Extrae, limpia y traduce los mensajes de error de la API a textos legibles y amigables.
 * Elimina cualquier rastro de "403 Forbidden", "Unauthorized", "Bad Credentials", etc.
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    let message = text;

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        if (parsed.message) {
          message = parsed.message;
        } else if (parsed.error) {
          message = parsed.error;
        }
      }
    } catch {
      // No es JSON, continuamos con texto plano
    }

    // Si no hay mensaje, mapeamos directamente por código de estado
    if (!message) {
      if (response.status === 403) return 'La cuenta no está verificada. Por favor, revisa tu correo electrónico.';
      if (response.status === 401) return 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      if (response.status === 400) return 'Los datos proporcionados son incorrectos. Por favor, revísalos.';
      if (response.status === 500) return 'Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.';
      return `Error de comunicación (${response.status}).`;
    }

    // 1. Limpiar prefijos de estado comunes de Spring Boot (ej: "403 FORBIDDEN", "401 UNAUTHORIZED", etc.)
    message = message.replace(/^(403|401|400|500|forbidden|unauthorized|bad\s+request|internal\s+server\s+error)\b[:\s-]*/i, '');

    // 2. Limpiar comillas iniciales/finales o escapadas sobrantes
    message = message.trim().replace(/^["']|["']$/g, '');

    // 3. Traducir errores de autenticación comunes a mensajes hermosos en español
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('bad credentials') || response.status === 401) {
      return 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
    }
    
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('not verified') || lowerMessage.includes('no está verificada') || response.status === 403) {
      return 'La cuenta no está verificada. Por favor, revisa tu correo electrónico.';
    }
    
    if (lowerMessage.includes('internal server error') || response.status === 500) {
      return 'Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.';
    }
    
    if (lowerMessage.includes('bad request') || response.status === 400) {
      return 'Los datos proporcionados son incorrectos. Por favor, revísalos.';
    }

    return message;
  } catch {
    return 'Error de comunicación con el servidor. Comprueba tu conexión.';
  }
}
