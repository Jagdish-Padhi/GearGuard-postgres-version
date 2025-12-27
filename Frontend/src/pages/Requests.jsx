// src/pages/Requests.jsx
import React, { useState } from 'react';
import { Plus, Search, AlertCircle, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

// Status mapping between frontend and backend
const STATUS_MAP = {
  'NEW': 'new',
  'IN_PROGRESS': 'in-progress',
  'REPAIRED': 'repaired',
  'SCRAP': 'scrap',
};

const REVERSE_STATUS_MAP = {
  'new': 'NEW',
  'in-progress': 'IN_PROGRESS',
  'repaired': 'REPAIRED',
  'scrap': 'SCRAP',
};

const Requests = () => {
  const { requests, equipment, teams, addRequest, updateRequest } = useApp();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [duration, setDuration] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CORRECTIVE',
    priority: 'MEDIUM',
    equipmentId: '',
    scheduledDate: '',
  });

  const statuses = [
    { id: 'new', backendId: 'NEW', label: 'New', icon: <AlertCircle size={20} />, color: 'bg-primary-500' },
    { id: 'in-progress', backendId: 'IN_PROGRESS', label: 'In Progress', icon: <Clock size={20} />, color: 'bg-warning-500' },
    { id: 'repaired', backendId: 'REPAIRED', label: 'Repaired', icon: <CheckCircle2 size={20} />, color: 'bg-success-500' },
    { id: 'scrap', backendId: 'SCRAP', label: 'Scrap', icon: <Trash2 size={20} />, color: 'bg-danger-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await addRequest({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      equipmentId: formData.equipmentId,
      scheduledDate: formData.type === 'PREVENTIVE' ? formData.scheduledDate : null,
    });

    setLoading(false);

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
    } else {
      alert(result.error || 'Failed to create request');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'CORRECTIVE',
      priority: 'MEDIUM',
      equipmentId: '',
      scheduledDate: '',
    });
  };

  const handleDragStart = (e, request) => {
    setDraggedItem(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    const currentStatus = STATUS_MAP[draggedItem.status] || draggedItem.status;
    if (currentStatus === newStatus) {
      setDraggedItem(null);
      return;
    }

    // If dropping to "repaired", ask for duration
    if (newStatus === 'repaired') {
      setPendingStatusChange({ request: draggedItem, newStatus });
      setShowDurationModal(true);
      setDraggedItem(null);
      return;
    }

    // Otherwise, update directly
    await updateRequest(draggedItem._id, { status: newStatus });
    setDraggedItem(null);
  };

  const handleDurationSubmit = async () => {
    if (!pendingStatusChange || !duration) return;

    setLoading(true);
    await updateRequest(pendingStatusChange.request._id, {
      status: pendingStatusChange.newStatus,
      duration: parseInt(duration),
    });
    setLoading(false);
    setShowDurationModal(false);
    setPendingStatusChange(null);
    setDuration('');
  };

  const getRequestsByStatus = (frontendStatus) => {
    const backendStatus = REVERSE_STATUS_MAP[frontendStatus];
    return requests
      .filter(req => req.status === backendStatus)
      .filter(req =>
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const isOverdue = (request) => {
    if (request.status === 'REPAIRED' || request.status === 'SCRAP') return false;
    if (!request.scheduledDate) return false;
    const scheduledDate = new Date(request.scheduledDate);
    return scheduledDate < new Date();
  };

  const getEquipmentName = (req) => {
    if (req.equipment?.name) return req.equipment.name;
    const eq = equipment.find(e => e._id === req.equipment);
    return eq?.name || 'Unknown';
  };

  const getTeamName = (req) => {
    if (req.assignedTeam?.name) return req.assignedTeam.name;
    const team = teams.find(t => t._id === req.assignedTeam);
    return team?.name || 'Unassigned';
  };


  const selectedEquipmentData = equipment.find(eq => eq._id === formData.equipmentId);
  const autoFilledTeam = selectedEquipmentData?.assignedTeam?.name ||
    teams.find(t => t._id === selectedEquipmentData?.assignedTeam)?.name || '';


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Maintenance Requests
          </h1>
          <p className="text-secondary-600 mt-1">
            Manage all maintenance requests with Kanban board
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Request
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={20} />}
        />
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {statuses.map((status) => {
          const statusRequests = getRequestsByStatus(status.id);

          return (
            <div key={status.id} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-secondary-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`${status.color} p-2 rounded-lg text-white`}>
                      {status.icon}
                    </div>
                    <h3 className="font-semibold text-secondary-900">
                      {status.label}
                    </h3>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {statusRequests.length}
                  </Badge>
                </div>
                <div className={`h-1 rounded-full ${status.color} opacity-30`}></div>
              </div>

              {/* Column Cards */}
              <div
                className="flex-1 space-y-3 min-h-[500px] p-3 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
              >
                {statusRequests.map((request) => {
                  const overdue = isOverdue(request);

                  return (
                    <div
                      key={request._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, request)}
                      onClick={() => setSelectedRequest(request)}
                      className={`
                                                bg-white p-4 rounded-lg shadow-sm border-2 border-secondary-200
                                                cursor-move hover:shadow-md hover:border-primary-300
                                                transition-all duration-200
                                                ${overdue ? 'border-l-4 border-l-danger-500' : ''}
                                                ${draggedItem?._id === request._id ? 'opacity-50' : ''}
                                            `}
                    >
                      {/* Priority & Overdue Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant={
                            request.priority === 'HIGH' ? 'danger' :
                              request.priority === 'MEDIUM' ? 'warning' : 'success'
                          }
                          size="sm"
                        >
                          {request.priority}
                        </Badge>
                        {overdue && (
                          <Badge variant="danger" size="sm">Overdue</Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-secondary-900 mb-2">
                        {request.title}
                      </h4>

                      {/* Equipment */}
                      <p className="text-sm text-secondary-600 mb-2">
                        📦 {getEquipmentName(request)}
                      </p>

                      {/* Team */}
                      <p className="text-sm text-secondary-500 mb-2">
                        👥 {getTeamName(request)}
                      </p>

                      {/* Type Badge */}
                      <Badge
                        variant={request.type === 'PREVENTIVE' ? 'primary' : 'secondary'}
                        size="sm"
                      >
                        {request.type}
                      </Badge>

                      {/* Duration (if repaired) */}
                      {request.status === 'REPAIRED' && request.duration && (
                        <p className="text-xs text-secondary-500 mt-2">
                          ⏱️ Duration: {request.duration} mins
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Maintenance Request"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter request title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <Select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: 'CORRECTIVE', label: 'Corrective' },
              { value: 'PREVENTIVE', label: 'Preventive' },
            ]}
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
          />

          <Select
            label="Equipment"
            name="equipmentId"
            value={formData.equipmentId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Equipment' },
              ...equipment
                .filter(eq => eq.status === 'ACTIVE')
                .map(eq => ({ value: eq._id, label: `${eq.name} (${eq.serialNumber})` })),
            ]}
            required
          />

          {autoFilledTeam && (
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                <strong>Auto-assigned Team:</strong> {autoFilledTeam}
              </p>
            </div>
          )}

          {formData.type === 'PREVENTIVE' && (
            <Input
              label="Scheduled Date"
              name="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Request
            </Button>
          </div>
        </form>
      </Modal>


      {/* Duration Modal (for Repaired status) */}
      <Modal
        isOpen={showDurationModal}
        onClose={() => {
          setShowDurationModal(false);
          setPendingStatusChange(null);
          setDuration('');
        }}
        title="Enter Repair Duration"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Please enter the time taken to complete this repair.
          </p>
          <Input
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 60"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDurationModal(false);
                setPendingStatusChange(null);
                setDuration('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDurationSubmit}
              loading={loading}
              disabled={!duration}
            >
              Mark as Repaired
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-500">Title</label>
              <p className="text-secondary-900">{selectedRequest.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-500">Description</label>
              <p className="text-secondary-900">{selectedRequest.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-500">Type</label>
                <p className="text-secondary-900">{selectedRequest.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Priority</label>
                <p className="text-secondary-900">{selectedRequest.priority}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Status</label>
                <p className="text-secondary-900">{selectedRequest.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-500">Equipment</label>
                <p className="text-secondary-900">{getEquipmentName(selectedRequest)}</p>
              </div>
            </div>
            {selectedRequest.duration && (
              <div>
                <label className="text-sm font-medium text-secondary-500">Duration</label>
                <p className="text-secondary-900">{selectedRequest.duration} minutes</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Requests;