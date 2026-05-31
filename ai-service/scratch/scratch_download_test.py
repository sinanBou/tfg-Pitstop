import requests

BASE_URL = "https://pitstop.solutions/api/ai"

def test_download_invoice():
    query = "¿Cómo puedo descargar mi última factura?"
    print(f" Probando RAG para Cliente")
    print(f"Pregunta: {query}")
    try:
        res = requests.post(f"{BASE_URL}/chat/manual", json={
            "query": query,
            "role": "CLIENT"
        })
        if res.status_code == 200:
            print("Respuesta del Asistente:")
            print(res.json()["response"])
        else:
            print(f"Error {res.status_code}: {res.text}")
    except Exception as e:
        print(f"Fallo de conexión: {e}")

if __name__ == "__main__":
    test_download_invoice()
