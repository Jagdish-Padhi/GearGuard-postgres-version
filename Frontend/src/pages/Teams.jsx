import React, { useState, useEffect } from 'react';
import { Plus, Users as UsersIcon, Mail, Wrench, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { userAPI } from '../services/api';

const Teams = () => {
    const { teams, requests, addTeam, updateTeam, deleteTeam, addTechnician, removeTechnician, getRequestsByTeam } = useApp();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [availableTechnicians, setAvailableTechnicians] = useState([]);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
    });

    // Fetch available technicians
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await userAPI.getAllTechnicians?.() || 
                    await fetch('/api/v1/users?role=TECHNICIAN').then(r => r.json());
                setAvailableTechnicians(response.data?.data || response.data || []);
            } catch (error) {
                console.error('Failed to fetch technicians:', error);
            }
        };
        fetchTechnicians();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await addTeam({
            name: formData.name,
        });

        setLoading(false);

        if (result.success) {
            setShowAddModal(false);
            resetForm();
        } else {
            alert(result.error || 'Failed to create team');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam) return;

        setLoading(true);

        const result = await updateTeam(selectedTeam._id, {
            name: formData.name,
        });

        setLoading(false);

        if (result.success) {
            setShowEditModal(false);
            setSelectedTeam(null);
            resetForm();
        } else {
            alert(result.error || 'Failed to update team');
        }
    };

    const handleDelete = async () => {
        if (!selectedTeam) return;

        setLoading(true);
        const result = await deleteTeam(selectedTeam._id);
        setLoading(false);

        if (result.success) {
            setShowDeleteModal(false);
            setSelectedTeam(null);
        } else {
            alert(result.error || 'Failed to delete team');
        }
    };

    const handleAddMember = async () => {
        if (!selectedTeam || !selectedTechnicianId) return;

        setLoading(true);
        const result = await addTechnician(selectedTeam._id, selectedTechnicianId);
        setLoading(false);

        if (result.success) {
            setShowAddMemberModal(false);
            setSelectedTechnicianId('');
            // Update selected team with new data
            setSelectedTeam(result.data);
        } else {
            alert(result.error || 'Failed to add technician');
        }
    };

    const handleRemoveMember = async (technicianId) => {
        if (!selectedTeam) return;

        if (!confirm('Are you sure you want to remove this technician from the team?')) return;

        setLoading(true);
        const result = await removeTechnician(selectedTeam._id, technicianId);
        setLoading(false);

        if (result.success) {
            setSelectedTeam(result.data);
        } else {
            alert(result.error || 'Failed to remove technician');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
        });
    };

    const openEditModal = (team) => {
        setSelectedTeam(team);
        setFormData({
            name: team.name || '',
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (team) => {
        setSelectedTeam(team);
        setShowDeleteModal(true);
    };

    const openAddMemberModal = (team) => {
        setSelectedTeam(team);
        setSelectedTechnicianId('');
        setShowAddMemberModal(true);
    };

    const getTeamRequestCount = (teamId) => {
        const teamRequests = getRequestsByTeam(teamId);
        const active = teamRequests.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length;
        return { total: teamRequests.length, active };
    };

    // Get technicians not in the selected team
    const getAvailableTechniciansForTeam = () => {
        if (!selectedTeam) return availableTechnicians;
        const teamTechIds = selectedTeam.technicians?.map(t => t._id || t) || [];
        return availableTechnicians.filter(tech => !teamTechIds.includes(tech._id));
    };

    const getTotalMembers = () => {
        return teams.reduce((acc, team) => acc + (team.technicians?.length || 0), 0);
    };

    const getActiveRequestsCount = () => {
        return requests.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-secondary-900">
                        Maintenance Teams
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        Manage your maintenance teams and members
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => setShowAddModal(true)}
                >
                    Add Team
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <UsersIcon size={24} className="text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-secondary-600">Total Teams</p>
                            <p className="text-3xl font-bold text-secondary-900">{teams.length}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success-100 rounded-lg">
                            <UsersIcon size={24} className="text-success-600" />
                        </div>
                        <div>
                            <p className="text-sm text-secondary-600">Total Members</p>
                            <p className="text-3xl font-bold text-secondary-900">{getTotalMembers()}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-warning-100 rounded-lg">
                            <Wrench size={24} className="text-warning-600" />
                        </div>
                        <div>
                            <p className="text-sm text-secondary-600">Active Requests</p>
                            <p className="text-3xl font-bold text-secondary-900">{getActiveRequestsCount()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => {
                    const { total, active } = getTeamRequestCount(team._id);
                    const memberCount = team.technicians?.length || 0;

                    return (
                        <Card key={team._id} className="hover:shadow-lg transition-shadow">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{ backgroundColor: team.color || '#3b82f6' + '20' }}
                                        >
                                            <UsersIcon size={24} style={{ color: team.color || '#3b82f6' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-secondary-900">{team.name}</h3>
                                            <p className="text-sm text-secondary-500">{memberCount} members</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(team)}
                                            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(team)}
                                            className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Members List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-secondary-700">Team Members</span>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon={<UserPlus size={14} />}
                                            onClick={() => openAddMemberModal(team)}
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    {team.technicians && team.technicians.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {team.technicians.map((tech) => (
                                                <div
                                                    key={tech._id || tech}
                                                    className="flex items-center justify-between p-2 bg-secondary-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-medium text-primary-600">
                                                                {(tech.fullName || tech.name || 'U')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-secondary-900">
                                                                {tech.fullName || tech.name || 'Unknown'}
                                                            </p>
                                                            {tech.email && (
                                                                <p className="text-xs text-secondary-500">{tech.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTeam(team);
                                                            handleRemoveMember(tech._id || tech);
                                                        }}
                                                        className="p-1 text-secondary-400 hover:text-danger-600 rounded"
                                                    >
                                                        <UserMinus size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-secondary-500 italic py-2">No members yet</p>
                                    )}
                                </div>

                                {/* Request Stats */}
                                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                                    <span className="text-sm text-secondary-600">Assigned Requests</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" size="sm">{total} total</Badge>
                                        {active > 0 && (
                                            <Badge variant="warning" size="sm">{active} active</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {teams.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <UsersIcon size={48} className="mx-auto text-secondary-400 mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No teams yet</h3>
                        <p className="text-secondary-600 mb-4">
                            Get started by creating your first maintenance team
                        </p>
                        <Button variant="primary" onClick={() => setShowAddModal(true)}>
                            Add Team
                        </Button>
                    </div>
                </Card>
            )}

            {/* Add Team Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); resetForm(); }}
                title="Create New Team"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Team Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Mechanics, Electricians"
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading}>
                            Create Team
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Team Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setSelectedTeam(null); resetForm(); }}
                title="Edit Team"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <Input
                        label="Team Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Mechanics, Electricians"
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedTeam(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedTeam(null); }}
                title="Delete Team"
            >
                <div className="space-y-4">
                    <p className="text-secondary-600">
                        Are you sure you want to delete <strong>{selectedTeam?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedTeam(null); }}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} loading={loading}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Member Modal */}
            <Modal
                isOpen={showAddMemberModal}
                onClose={() => { setShowAddMemberModal(false); setSelectedTeam(null); setSelectedTechnicianId(''); }}
                title={`Add Member to ${selectedTeam?.name || 'Team'}`}
            >
                <div className="space-y-4">
                    <Select
                        label="Select Technician"
                        value={selectedTechnicianId}
                        onChange={(e) => setSelectedTechnicianId(e.target.value)}
                        options={[
                            { value: '', label: 'Select a technician' },
                            ...getAvailableTechniciansForTeam().map(tech => ({
                                value: tech._id,
                                label: `${tech.fullName || tech.name} (${tech.email})`,
                            })),
                        ]}
                    />

                    {getAvailableTechniciansForTeam().length === 0 && (
                        <p className="text-sm text-warning-600 bg-warning-50 p-3 rounded-lg">
                            No available technicians. All technicians are already in this team or no users with TECHNICIAN role exist.
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowAddMemberModal(false); setSelectedTeam(null); setSelectedTechnicianId(''); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddMember}
                            loading={loading}
                            disabled={!selectedTechnicianId}
                        >
                            Add Member
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Teams;
