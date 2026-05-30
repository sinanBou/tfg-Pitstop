import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/api';

export function useOwnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEmployeeProfile(await res.json());
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
    }
  }, []);

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
      
      await fetchProfile();
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, fetchProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileUpdate = async (profileData: { firstname: string; lastname: string; address: string; nif: string; phoneNumber: string }) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
        await fetchData();
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error de conexión al actualizar el perfil');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    const token = localStorage.getItem('jwt_token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`${API_BASE_URL}/employees/me/avatar`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployeeProfile(updated);
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error deleting avatar:', err);
    }
    return false;
  };

  return {
    loading,
    workshops,
    ownerId,
    fetchData,
    employeeProfile,
    handleProfileUpdate,
    handleUploadAvatar,
    handleDeleteAvatar
  };
}
