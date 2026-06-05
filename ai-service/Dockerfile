# 1. Imagen base
FROM python:3.11-slim

# 2. Directorio de trabajo
WORKDIR /app

# 3. Instalación de dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 4. Instalación de dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar el código fuente
COPY . .

# 6. Crear el usuario y asignar permisos
RUN useradd -m usuario && chown -R usuario:usuario /app

# 7. Cambiar al usuario recién creado
USER usuario

# 8. Exponer puerto y ejecutar
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]