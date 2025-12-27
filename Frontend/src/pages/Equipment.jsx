import React, { useState } from 'react';
import { Plus, Search, Filter, Package, MapPin, Wrench, AlertTriangle, Trash2, Edit, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';

const Equipment = () => {
  const { equipment, teams, addEquipment, updateEquipment, deleteEquipment, scrapEquipment, getRequestsByEquipment } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    teamId: '',
  });

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await addEquipment({
      name: formData.name,
      serialNumber: formData.serialNumber,
      location: formData.location,
      teamId: formData.teamId || null,
    });

    setLoading(false);

    if (result.success) {
      setShowAddModal(false);
      resetForm();
    } else {
      alert(result.error || 'Failed to add equipment');
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setLoading(true);

    const result = await updateEquipment(selectedEquipment._id, {
      name: formData.name,
      serialNumber: formData.serialNumber,
      location: formData.location,
      teamId: formData.teamId || null,
    });

    setLoading(false);

    if (result.success) {
      setShowEditModal(false);
      setSelectedEquipment(null);
      resetForm();
    } else {
      alert(result.error || 'Failed to update equipment');
    }
  };


  const handleDelete = async () => {
    if (!selectedEquipment) return;

    setLoading(true);
    const result = await deleteEquipment(selectedEquipment._id);
    setLoading(false);

    if (result.success) {
      setShowDeleteModal(false);
      setSelectedEquipment(null);
    } else {
      alert(result.error || 'Failed to delete equipment');
    }
  };


  const handleScrap = async (eq) => {
    if (!confirm('Are you sure you want to scrap this equipment? This action marks it as inactive.')) return;

    setLoading(true);
    const result = await scrapEquipment(eq._id);
    setLoading(false);

    if (!result.success) {
      alert(result.error || 'Failed to scrap equipment');
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
      serialNumber: '',
      location: '',
      teamId: '',
    });
  };


  const openEditModal = (eq) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name || '',
      serialNumber: eq.serialNumber || '',
      location: eq.location || '',
      teamId: eq.assignedTeam?._id || eq.assignedTeam || '',
    });
    setShowEditModal(true);
  };


  const openDetailModal = (eq) => {
    setSelectedEquipment(eq);
    setShowDetailModal(true);
  };


  const openDeleteModal = (eq) => {
    setSelectedEquipment(eq);
    setShowDeleteModal(true);
  };


  const getTeamName = (eq) => {
    if (eq.assignedTeam?.name) return eq.assignedTeam.name;
    const team = teams.find(t => t._id === eq.assignedTeam);
    return team?.name || 'Unassigned';
  };


  const getRequestCount = (eq) => {
    const reqs = getRequestsByEquipment(eq._id);
    const pending = reqs.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length;
    return { total: reqs.length, pending };
  };


  // Smart button handler - navigate to requests filtered by equipment
  const handleMaintenanceClick = (equipmentId) => {
    navigate('/requests', { state: { equipmentFilter: equipmentId } });
  };


  const statusColors = {
    ACTIVE: 'success',
    SCRAPPED: 'danger',
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Equipment
          </h1>
          <p className="text-secondary-600 mt-1">
            Manage all equipment and their maintenance
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Equipment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Equipment</p>
              <p className="text-3xl font-bold text-secondary-900">{equipment.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Package size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Active</p>
              <p className="text-3xl font-bold text-secondary-900">
                {equipment.filter(eq => eq.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle size={24} className="text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Scrapped</p>
              <p className="text-3xl font-bold text-secondary-900">
                {equipment.filter(eq => eq.status === 'SCRAPPED').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SCRAPPED', label: 'Scrapped' },
            ]}
          />
        </div>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => {
          const { total, pending } = getRequestCount(eq);

          return (
            <Card key={eq._id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Package size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{eq.name}</h3>
                      <p className="text-sm text-secondary-500">{eq.serialNumber}</p>
                    </div>
                  </div>
                  <Badge variant={statusColors[eq.status]} size="sm">
                    {eq.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <MapPin size={16} />
                    <span>{eq.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <Wrench size={16} />
                    <span>{getTeamName(eq)}</span>
                  </div>
                </div>

                {/* Request Count */}
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-secondary-600">Maintenance Requests</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">{total} total</Badge>
                    {pending > 0 && (
                      <Badge variant="warning" size="sm">{pending} pending</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-secondary-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => openDetailModal(eq)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit size={16} />}
                    onClick={() => openEditModal(eq)}
                    disabled={eq.status === 'SCRAPPED'}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Wrench size={16} />}
                    onClick={() => handleMaintenanceClick(eq._id)}
                  >
                    Maintenance
                  </Button>
                  {eq.status === 'ACTIVE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleScrap(eq)}
                    >
                      Scrap
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-secondary-400 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No equipment found</h3>
            <p className="text-secondary-600 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first equipment'}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add Equipment
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add Equipment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Equipment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Equipment Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., CNC Machine #1"
            required
          />

          <Input
            label="Serial Number"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="e.g., CNC-2024-001"
            required
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Building A - Floor 2"
            required
          />

          <Select
            label="Assigned Team"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Team (Optional)' },
              ...teams.map(team => ({ value: team._id, label: team.name })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Add Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedEquipment(null); resetForm(); }}
        title="Edit Equipment"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Equipment Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., CNC Machine #1"
            required
          />

          <Input
            label="Serial Number"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="e.g., CNC-2024-001"
            required
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Building A - Floor 2"
            required
          />

          <Select
            label="Assigned Team"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Team (Optional)' },
              ...teams.map(team => ({ value: team._id, label: team.name })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedEquipment(null); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedEquipment(null); }}
        title="Equipment Details"
      >
        {selectedEquipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-500">Name</label>
                <p className="text-secondary-900">{selectedEquipment.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Serial Number</label>
                <p className="text-secondary-900">{selectedEquipment.serialNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Location</label>
                <p className="text-secondary-900">{selectedEquipment.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Status</label>
                <Badge variant={statusColors[selectedEquipment.status]}>
                  {selectedEquipment.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Assigned Team</label>
                <p className="text-secondary-900">{getTeamName(selectedEquipment)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Created At</label>
                <p className="text-secondary-900">
                  {new Date(selectedEquipment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSelectedEquipment(null); }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedEquipment(null); }}
        title="Delete Equipment"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to delete <strong>{selectedEquipment?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedEquipment(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Equipment;