#!/bin/bash
# Script de inicio automatizado para el microservicio de IA local de Pitstop

# Detener en caso de error
set -e


# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual de Python (venv)..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "ctivando entorno virtual..."
source venv/bin/activate

# Actualizar pip e instalar dependencias
echo "📥 Instalando/Actualizando dependencias de requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# Iniciar servidor Uvicorn en el puerto 8000
echo "===================================================================="
echo " ARRANCANDO SERVIDOR FASTAPI EN http://localhost:8000 "
echo "===================================================================="
uvicorn main:app --reload --host 0.0.0.0 --port 8000
