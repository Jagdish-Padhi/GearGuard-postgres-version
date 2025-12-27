// src/pages/Equipment.jsx
import React, { useState } from 'react';
import { Plus, Search, Filter, Package, MapPin, Calendar, Wrench, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import { categories, departments } from '../services/mockData';

const Equipment = () => {
  const { equipment, teams, addEquipment, getRequestsByEquipment } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    category: categories[0],
    department: departments[0],
    owner: '',
    teamId: teams[0]?.id || '',
    technician: '',
    location: '',
    purchaseDate: '',
    warrantyExpiry: '',
    status: 'operational',
    company: 'My Company (San Francisco)',
    usedBy: '',
    workCenter: '',
  });

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || eq.department === filterDepartment;
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    return matchesSearch && matchesDepartment && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addEquipment(formData);
    setShowAddModal(false);
    resetForm();
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
      category: categories[0],
      department: departments[0],
      owner: '',
      teamId: teams[0]?.id || '',
      technician: '',
      location: '',
      purchaseDate: '',
      warrantyExpiry: '',
      status: 'operational',
      company: 'My Company (San Francisco)',
      usedBy: '',
      workCenter: '',
    });
  };

  const statusColors = {
    operational: 'success',
    maintenance: 'warning',
    broken: 'danger',
    retired: 'secondary',
  };

  // Smart button handler
  const handleMaintenanceClick = (equipmentId) => {
    navigate('/requests', { state: { equipmentFilter: equipmentId } });
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
            Manage all your company assets and equipment
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowAddModal(true)}
        >
          New
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
          </div>

          <Select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            options={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(dept => ({ value: dept, label: dept }))
            ]}
          />

          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </Card>

      {/* Equipment List */}
      <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Equipment Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Equipment Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredEquipment.map((eq) => {
                const requests = getRequestsByEquipment(eq.id);
                const openRequests = requests.filter(req =>
                  req.status !== 'repaired' && req.status !== 'scrap'
                );

                return (
                  <tr
                    key={eq.id}
                    className="hover:bg-secondary-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package size={20} className="text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">
                            {eq.name}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {eq.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-secondary-700">
                        {eq.serialNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-700">
                        {eq.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${eq.technician}&background=3b82f6&color=fff&size=32`}
                          alt={eq.technician}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-secondary-700">
                          {eq.technician}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-700">
                        {eq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-700">
                        {eq.company || 'My Company (San Francisco)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusColors[eq.status]} size="sm">
                        {eq.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {/* Smart Button - Maintenance (count) */}
                      <button
                        onClick={() => handleMaintenanceClick(eq.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors text-sm font-medium border border-primary-200"
                      >
                        <Wrench size={16} />
                        <span>Maintenance</span>
                        {openRequests.length > 0 && (
                          <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white rounded-full text-xs font-bold">
                            {openRequests.length}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-secondary-300 mb-4" />
            <p className="text-secondary-500">No equipment found</p>
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="New Equipment"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Equipment Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories.map(cat => ({ value: cat, label: cat }))}
            />
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Used By (Employee)"
              name="usedBy"
              value={formData.usedBy}
              onChange={handleChange}
            />
            <Input
              label="Used in Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Maintenance Team"
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              options={teams.map(team => ({ value: team.id, label: team.name }))}
            />
            <Input
              label="Technician"
              name="technician"
              value={formData.technician}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Work Center"
            name="workCenter"
            value={formData.workCenter}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
              placeholder="Equipment description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Assigned Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments.map(dept => ({ value: dept, label: dept }))}
            />
          </div>
        </form>
      </Modal>

      {/* Equipment Details Modal */}
      {selectedEquipment && (
        <Modal
          isOpen={!!selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          title={selectedEquipment.name}
          size="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Serial Number</p>
                <p className="font-mono text-secondary-900">{selectedEquipment.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Status</p>
                <Badge variant={statusColors[selectedEquipment.status]}>
                  {selectedEquipment.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Category</p>
                <p className="text-secondary-900">{selectedEquipment.category}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Department</p>
                <p className="text-secondary-900">{selectedEquipment.department}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Location</p>
                <p className="text-secondary-900">{selectedEquipment.location}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Technician</p>
                <p className="text-secondary-900">{selectedEquipment.technician}</p>
              </div>
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-secondary-900">
                  Maintenance Requests
                </h4>
                <button
                  onClick={() => handleMaintenanceClick(selectedEquipment.id)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {getRequestsByEquipment(selectedEquipment.id).slice(0, 5).map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{req.subject}</p>
                      <p className="text-xs text-secondary-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={req.status} size="sm">{req.status}</Badge>
                  </div>
                ))}
                {getRequestsByEquipment(selectedEquipment.id).length === 0 && (
                  <p className="text-sm text-secondary-500 text-center py-4">
                    No maintenance requests
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Equipment;