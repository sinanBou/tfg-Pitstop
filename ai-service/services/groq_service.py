import os
from groq import Groq
from config import settings

class GroqService:
    def __init__(self):
        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
        self.client = Groq(api_key=api_key) if api_key else None
        self.model = "llama-3.1-8b-instant"


    def is_configured(self) -> bool:
        return self.client is not None

    def chat_mechanics(self, query: str, history: list = None) -> str:
        """
        Calls Groq with a highly restrictive system prompt to keep responses 100% focused on mechanics.
        """
        if not self.is_configured():
            return "Error: La API Key de Groq no está configurada en el servidor de IA."

        system_prompt = (
            "Eres un Ingeniero Mecánico y Jefe de Taller experto de la marca Pitstop. "
            "Tu misión es responder ÚNICAMENTE a consultas relacionadas con mecánica automotriz, "
            "diagnósticos de fallos de vehículos, mantenimiento, repuestos, herramientas de taller y consejos del motor. "
            "Si el usuario te pregunta sobre cualquier otro tema ajeno a la mecánica automotriz, el motor o los vehículos "
            "(como recetas de cocina, deportes, historia, geografía, programación general, etc.), responde de manera educada "
            "indicando que como asistente especializado de Pitstop solo estás autorizado a responder sobre temas de mecánica "
            "y automóviles. Responde siempre en español y mantén un tono profesional y técnico pero accesible."
        )

        messages = [{"role": "system", "content": system_prompt}]
        
        # Inyectar historial si existe
        if history:
            for msg in history:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
        messages.append({"role": "user", "content": query})

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.3,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error al conectar con la inteligencia artificial de Groq: {str(e)}"

    def chat_with_context(self, query: str, context: str, user_role: str) -> str:
        """
        Generates a context-aware answer from the user manual retrieved context.
        """
        if not self.is_configured():
            return "Error: La API Key de Groq no está configurada en el servidor de IA."

        role_name = "Cliente" if user_role.upper() == "CLIENT" else "Personal del Taller (Mecánico/Gerente/Dueño)"

        system_prompt = (
            f"Eres el Asistente Oficial de Soporte de la aplicación Pitstop. "
            f"Estás respondiendo a un usuario con el rol de: {role_name}. "
            "Tu objetivo es guiar al usuario sobre cómo utilizar la aplicación basándote en el manual de usuario "
            "que te proporcionamos como contexto. "
            "Responde de manera precisa, paso a paso, usando un formato limpio y siendo muy amable. "
            "Ten en cuenta sinónimos y conceptos equivalentes comunes. Por ejemplo: 'descargar factura' o 'guardar reporte' es "
            "equivalente a la sección del manual que explica 'imprimir o guardar la factura en PDF' (ya que el navegador "
            "permite guardarla directamente). Igualmente, 'añadir coche' o 'meter matrícula' es equivalente a 'registrar vehículo'. "
            "Si el manual describe la acción utilizando un concepto equivalente, guíale directamente con esos pasos "
            "sin decir que la funcionalidad no existe. "
            "Solo si la funcionalidad realmente no guarda ninguna relación con el contexto provisto, dile amablemente "
            "que no tienes registro de esa funcionalidad en el manual de su rol."
        )


        user_content = (
            f"CONTEXTO DEL MANUAL DE USUARIO:\n"
            f"==================================\n"
            f"{context}\n"
            f"==================================\n\n"
            f"PREGUNTA DEL USUARIO:\n"
            f"{query}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.2,
                max_tokens=800,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error al generar respuesta RAG con Groq: {str(e)}"

groq_service = GroqService()
