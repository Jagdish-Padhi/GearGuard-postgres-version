import React, { createContext, useContext, useState, useEffect } from 'react';
import { equipmentAPI, teamAPI, requestAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setEquipment([]);
      setTeams([]);
      setRequests([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipmentRes, teamsRes, requestsRes] = await Promise.all([
        equipmentAPI.getAll(),
        teamAPI.getAll(),
        requestAPI.getAll(),
      ]);

      setEquipment(equipmentRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setRequests(requestsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  // EQUIPMENT OPERATIONS 
  const addEquipment = async (data) => {
    try {
      const response = await equipmentAPI.create({
        name: data.name,
        serialNumber: data.serialNumber,
        location: data.location,
        assignedTeam: data.teamId || null,
      });
      const newEquipment = response.data.data;
      setEquipment(prev => [newEquipment, ...prev]);
      return { success: true, data: newEquipment };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add equipment' };
    }
  };


  const updateEquipment = async (id, updates) => {
    try {
      const response = await equipmentAPI.update(id, {
        name: updates.name,
        serialNumber: updates.serialNumber,
        location: updates.location,
        assignedTeam: updates.teamId || null,
      });
      const updated = response.data.data;
      setEquipment(prev => prev.map(eq => eq._id === id ? updated : eq));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update equipment' };
    }
  };


  const deleteEquipment = async (id) => {
    try {
      await equipmentAPI.delete(id);
      setEquipment(prev => prev.filter(eq => eq._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete equipment' };
    }
  };


  const scrapEquipment = async (id) => {
    try {
      const response = await equipmentAPI.scrap(id);
      const updated = response.data.data;
      setEquipment(prev => prev.map(eq => eq._id === id ? updated : eq));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to scrap equipment' };
    }
  };


  // TEAM OPERATIONS
  const addTeam = async (data) => {
    try {
      const response = await teamAPI.create({
        name: data.name,
        technicians: data.technicians || [],
      });
      const newTeam = response.data.data;
      setTeams(prev => [newTeam, ...prev]);
      return { success: true, data: newTeam };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add team' };
    }
  };


  const updateTeam = async (id, updates) => {
    try {
      const response = await teamAPI.update(id, { name: updates.name });
      const updated = response.data.data;
      setTeams(prev => prev.map(team => team._id === id ? updated : team));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update team' };
    }
  };


  const deleteTeam = async (id) => {
    try {
      await teamAPI.delete(id);
      setTeams(prev => prev.filter(team => team._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete team' };
    }
  };


  const addTechnician = async (teamId, technicianId) => {
    try {
      const response = await teamAPI.addTechnician(teamId, technicianId);
      const updated = response.data.data;
      setTeams(prev => prev.map(team => team._id === teamId ? updated : team));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add technician' };
    }
  };


  const removeTechnician = async (teamId, technicianId) => {
    try {
      const response = await teamAPI.removeTechnician(teamId, technicianId);
      const updated = response.data.data;
      setTeams(prev => prev.map(team => team._id === teamId ? updated : team));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to remove technician' };
    }
  };


  // REQUEST OPERATIONS 
  const addRequest = async (data) => {
    try {
      const response = await requestAPI.create({
        title: data.subject || data.title,
        description: data.description,
        type: data.type?.toUpperCase() || 'CORRECTIVE',
        priority: data.priority?.toUpperCase() || 'MEDIUM',
        equipment: data.equipmentId || data.equipment,
        scheduledDate: data.scheduledDate || null,
      });
      const newRequest = response.data.data;
      setRequests(prev => [newRequest, ...prev]);
      return { success: true, data: newRequest };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add request' };
    }
  };


  const updateRequest = async (id, updates) => {
    try {
      // If updating status, use status endpoint
      if (updates.status) {
        const statusMap = {
          'new': 'NEW',
          'in-progress': 'IN_PROGRESS',
          'repaired': 'REPAIRED',
          'scrap': 'SCRAP',
        };
        const backendStatus = statusMap[updates.status] || updates.status.toUpperCase();
        const response = await requestAPI.updateStatus(id, backendStatus, updates.duration);
        const updated = response.data.data;
        setRequests(prev => prev.map(req => req._id === id ? updated : req));
        return { success: true, data: updated };
      }

      // Otherwise, regular update
      const response = await requestAPI.update(id, {
        title: updates.subject || updates.title,
        description: updates.description,
        priority: updates.priority?.toUpperCase(),
        scheduledDate: updates.scheduledDate,
      });
      const updated = response.data.data;
      setRequests(prev => prev.map(req => req._id === id ? updated : req));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update request' };
    }
  };


  const deleteRequest = async (id) => {
    try {
      await requestAPI.delete(id);
      setRequests(prev => prev.filter(req => req._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete request' };
    }
  };


  // HELPER FUNCTIONS 
  const getEquipmentById = (id) => {
    return equipment.find(eq => eq._id === id || eq.id === id);
  };

  const getTeamById = (id) => {
    return teams.find(team => team._id === id || team.id === id);
  };

  const getRequestsByEquipment = (equipmentId) => {
    return requests.filter(req =>
      req.equipment?._id === equipmentId || req.equipment === equipmentId
    );
  };

  const getRequestsByTeam = (teamId) => {
    return requests.filter(req =>
      req.assignedTeam?._id === teamId || req.assignedTeam === teamId
    );
  };

  const value = {
    // Data
    equipment,
    teams,
    requests,
    loading,
    error,

    // Refresh
    refreshData: fetchAllData,

    // Equipment
    addEquipment,
    updateEquipment,
    deleteEquipment,
    scrapEquipment,

    // Teams
    addTeam,
    updateTeam,
    deleteTeam,
    addTechnician,
    removeTechnician,

    // Requests
    addRequest,
    updateRequest,
    deleteRequest,

    // Helpers
    getEquipmentById,
    getTeamById,
    getRequestsByEquipment,
    getRequestsByTeam,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
