import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as workshopService from '../services/workshopService';
import type { EmployeeProfile, Workshop } from '../types/workshop.types';

export function useOwnerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await workshopService.getEmployeeMe();
      setEmployeeProfile(profile);
    } catch (err) {
      console.error('Error fetching employee profile:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const user = await workshopService.getUserMe();
      setOwnerId(user.employeeId || null);
      
      if (user.employeeId) {
        const wData = await workshopService.getWorkshopsByOwner(user.employeeId);
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
    try {
      const updated = await workshopService.updateEmployeeMe(profileData);
      setEmployeeProfile(updated);
      await fetchData();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error al actualizar el perfil');
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await workshopService.uploadAvatar(file);
      setEmployeeProfile(updated);
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error uploading avatar:', err);
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    try {
      const updated = await workshopService.deleteAvatar();
      setEmployeeProfile(updated);
      await fetchData();
      return true;
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
