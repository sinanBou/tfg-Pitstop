import { API_BASE_URL } from '@/config/api';

/**
 * Obtiene las cabeceras HTTP necesarias para las peticiones autenticadas y con JSON payload.
 * @returns Cabeceras con la autorización Bearer JWT y Content-Type.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Obtiene el listado de marcas de vehículos disponibles en el catálogo.
 * @returns Promesa con la lista de marcas.
 */
export const getCatalogMakes = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener marcas');
  return res.json();
};

/**
 * Obtiene el listado de modelos asociados a una marca específica del catálogo.
 * @param make Nombre de la marca.
 * @returns Promesa con la lista de modelos.
 */
export const getCatalogModels = async (make: string): Promise<string[]> => {
  if (!make) return [];
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener modelos');
  return res.json();
};

