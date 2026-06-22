# 🏁 Pitstop: Plataforma Integral de Gestión y Planificación de Talleres Mecánicos con IA

Pitstop es una solución de software empresarial (SaaS) diseñada para optimizar y automatizar los flujos de trabajo de talleres mecánicos de cualquier escala. La plataforma proporciona control total sobre la planificación de citas, asignación y seguimiento de tareas de mecánicos, gestión de inventario y facturación, todo ello potenciado por un microservicio de Inteligencia Artificial (IA) especializado con capacidades de generación aumentada por recuperación (RAG).

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una arquitectura de microservicios e infraestructura desacoplada, orquestada de forma nativa mediante contenedores Docker.

### Componentes Principales

1. **`backend-api` (Java 25 + Spring Boot 4.0)**:
   * Núcleo de lógica de negocio del sistema, estructurado bajo **Clean Architecture** y principios **SOLID**.
   * Gestión de persistencia con Spring Data JPA y transaccionalidad robusta.
   * Seguridad perimetral con Spring Security y tokens JWT para autenticación stateless.
   * Integraciones con servicios de terceros: AWS S3 (almacenamiento de fotos de estado e informes) y JavaMail (notificaciones automáticas y recuperación de credenciales).

2. **`frontend-web` (React + TypeScript + Vite)**:
   * SPA moderna y reactiva diseñada con componentes desacoplados y modulares.
   * Panel de planificación interactivo avanzado (Timeline) con soporte nativo de arrastrar y soltar (Drag & Drop).
   * Sistema de rutas protegido por roles y carga diferida (lazy loading) de módulos de administración.

3. **`ai-service` (Python 3.11 + FastAPI)**:
   * Microservicio independiente enfocado en tareas de IA y procesamiento de lenguaje natural.
   * **Buscador RAG (Retrieval-Augmented Generation)**: Vectorización local y segmentación de manuales técnicos mediante `SentenceTransformers` (`paraphrase-multilingual-MiniLM-L12-v2`).
   * Base de datos vectorial persistente con **ChromaDB** para almacenar embeddings semánticos segmentados por roles de seguridad.
   * Integración de inferencia ultrarrápida con la API de **Groq** utilizando LLMs de última generación (Llama-3).

4. **`db` (MySQL 8.0)**:
   * Base de datos relacional para la persistencia transaccional del sistema (`mecanicalApp`).

---


## 🚀 Despliegue y Configuración

### Requisitos Previos
* Docker y Docker Compose instalados en el sistema.
* Una cuenta de desarrollo y API Key de **Groq** (para funciones de IA).

### ⚙️ Variables de Entorno
El sistema utiliza un archivo `.env` en la raíz del proyecto para definir las credenciales y URLs de los contenedores. Se debe crear un archivo `.env` basado en el siguiente ejemplo:

```env
# API Key para Groq LLM en el Microservicio de IA
GROQ_API_KEY=tu_groq_api_key_aqui

# Configuración de Base de Datos MySQL
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mecanicalApp?createDatabaseIfNotExist=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=admin123

# Clave secreta para JWT (Spring Security)
JWT_SECRET_ENV=tu_clave_secreta_jwt_minimo_32_caracteres

# Credenciales y Configuración de AWS S3 para almacenamiento
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=tu_s3_bucket_name

# Configuración de Correo Electrónico SMTP
SPRING_MAIL_PASSWORD=tu_app_password_smtp
SPRING_MAIL_FROM=tu_correo_emisor@gmail.com

# Credenciales de Google OAuth2 (Autenticación del Cliente)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# URLs de la aplicación
APP_FRONTEND_URL=http://localhost:8080
APP_BACKEND_URL=http://localhost:9091
```

### 🐳 Despliegue con Docker Compose (Recomendado)
Para levantar todos los servicios en sus contenedores Docker correspondientes de manera automatizada:

```bash
docker compose up --build -d
```

Este comando descargará e instalará las dependencias necesarias, compilará los módulos Java y TypeScript, e iniciará los servicios en los siguientes puertos locales:
* **Frontend**: `http://localhost:8080`
* **Backend REST API**: `http://localhost:9091`
* **Microservicio IA (FastAPI)**: `http://localhost:8000`
* **Base de datos (MySQL)**: Puerto interno `3306`

---

## 💻 Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios de forma local e independiente para desarrollo rápido:

### 1. Base de datos
Asegúrate de tener una instancia de MySQL 8 activa con una base de datos llamada `mecanicalApp` y las credenciales correspondientes con las definidas en el `.env`.

### 2. Backend (Spring Boot)
1. Navega al directorio `/backend-api`.
2. Asegúrate de tener instalado Java 25.
3. Ejecuta el backend utilizando el Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

### 3. Microservicio de IA (FastAPI)
1. Navega al directorio `/ai-service`.
2. Crea un entorno virtual y activa la instalación de dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Ejecuta el servidor FastAPI con Uvicorn:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

### 4. Frontend (React + Vite)
1. Navega al directorio `/frontend-web`.
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

---

## 🧪 Pruebas Unitarias e Integración

Para validar el backend y asegurar la no regresión del sistema, se dispone de un conjunto completo de pruebas automatizadas:

* **Ejecutar todos los tests del backend**:
  ```bash
  cd backend-api
  ./mvnw test
  ```

---

## 📄 Licencia
Este proyecto es privado y de uso exclusivo académico. Todos los derechos reservados.
