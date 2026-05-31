# Usamos una imagen de Python
FROM python:3.11-slim

WORKDIR /app

# Instalamos dependencias del sistema ChromaDB 
RUN apt-get update && apt-get install -y \
    build-essential \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de requerimientos
COPY requirements.txt .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto de tu código 
COPY . .

# Exponemos el puerto de FastAPI
EXPOSE 8000

# Arrancamos el servidor 
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]