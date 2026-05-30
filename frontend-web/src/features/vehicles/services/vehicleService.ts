import { API_BASE_URL } from '@/config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getCatalogMakes = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/makes`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener marcas');
  return res.json();
};

export const getCatalogModels = async (make: string): Promise<string[]> => {
  if (!make) return [];
  const res = await fetch(`${API_BASE_URL}/vehicles/catalog/models/${make}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener modelos');
  return res.json();
};
