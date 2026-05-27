import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/api';

export function useOwnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No autenticado");
      const data = await res.json();
      
      setOwnerId(data.employeeId);
      
      const wRes = await fetch(`${API_BASE_URL}/workshops/owner/${data.employeeId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkshops(wData);
      }
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    workshops,
    ownerId,
    fetchData
  };
}
