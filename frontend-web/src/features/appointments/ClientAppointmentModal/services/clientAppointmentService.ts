import { API_BASE_URL } from '@/config/api';
import type { WorkshopMinDTO } from '@/types/client';

export interface SearchWorkshopsResponse {
  content: WorkshopMinDTO[];
  last: boolean;
}

export const searchWorkshopsApi = async (query: string, page: number, size: number = 5): Promise<SearchWorkshopsResponse> => {
  const token = localStorage.getItem('jwt_token');
  const res = await fetch(
    `${API_BASE_URL}/workshops/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  if (!res.ok) {
    throw new Error('Error al buscar talleres');
  }
  return res.json();
};
