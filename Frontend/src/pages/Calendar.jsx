import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';


const Calendar = () => {
  const { requests, equipment, teams, addRequest } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    equipmentId: '',
    scheduledDate: '',
  });


  // Get preventive maintenance requests
  const preventiveRequests = useMemo(() => {
    return requests.filter(req => req.type === 'PREVENTIVE');
  }, [requests]);


  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  // Get requests for a specific date
  const getRequestsForDate = (date) => {
    return preventiveRequests.filter(req => {
      if (!req.scheduledDate) return false;
      const reqDate = new Date(req.scheduledDate);
      return reqDate.getDate() === date &&
        reqDate.getMonth() === month &&
        reqDate.getFullYear() === year;
    });
  };


  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, requests: [] });
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        requests: getRequestsForDate(day),
        isToday: new Date().getDate() === day &&
          new Date().getMonth() === month &&
          new Date().getFullYear() === year,
      });
    }

    return days;
  }, [currentDate, preventiveRequests]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayData) => {
    if (!dayData.day) return;

    const clickedDate = new Date(year, month, dayData.day);
    setSelectedDate({ date: clickedDate, requests: dayData.requests });

    if (dayData.requests.length > 0) {
      setShowDayModal(true);
    } else {
      // Open create modal with pre-filled date
      const dateStr = clickedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
      setShowCreateModal(true);
    }
  };


  const handleCreateFromDay = () => {
    setShowDayModal(false);
    const dateStr = selectedDate.date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
    setShowCreateModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await addRequest({
      title: formData.title,
      description: formData.description,
      type: 'PREVENTIVE',
      priority: formData.priority,
      equipmentId: formData.equipmentId,
      scheduledDate: formData.scheduledDate,
    });

    setLoading(false);

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
    } else {
      alert(result.error || 'Failed to create preventive maintenance');
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
      title: '',
      description: '',
      priority: 'MEDIUM',
      equipmentId: '',
      scheduledDate: '',
    });
  };

  const getEquipmentName = (req) => {
    if (req.equipment?.name) return req.equipment.name;
    const eq = equipment.find(e => e._id === req.equipment);
    return eq?.name || 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'REPAIRED': return 'success';
      case 'SCRAP': return 'danger';
      default: return 'secondary';
    }
  };

  // Stats
  const thisMonthRequests = preventiveRequests.filter(req => {
    if (!req.scheduledDate) return false;
    const reqDate = new Date(req.scheduledDate);
    return reqDate.getMonth() === month && reqDate.getFullYear() === year;
  });


  const pendingThisMonth = thisMonthRequests.filter(req =>
    req.status === 'NEW' || req.status === 'IN_PROGRESS'
  ).length;


  const completedThisMonth = thisMonthRequests.filter(req =>
    req.status === 'REPAIRED'
  ).length;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Preventive Maintenance Calendar
          </h1>
          <p className="text-secondary-600 mt-1">
            Schedule and track preventive maintenance
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={() => setShowCreateModal(true)}
        >
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CalendarIcon size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">This Month</p>
              <p className="text-3xl font-bold text-secondary-900">{thisMonthRequests.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Wrench size={24} className="text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Pending</p>
              <p className="text-3xl font-bold text-secondary-900">{pendingThisMonth}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Wrench size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Completed</p>
              <p className="text-3xl font-bold text-secondary-900">{completedThisMonth}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-secondary-600" />
          </button>

          <h2 className="text-xl font-semibold text-secondary-900">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} className="text-secondary-600" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-secondary-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(dayData)}
              className={`
                                min-h-[100px] p-2 border border-secondary-200 rounded-lg
                                ${dayData.day ? 'cursor-pointer hover:bg-secondary-50' : 'bg-secondary-50'}
                                ${dayData.isToday ? 'border-primary-500 border-2' : ''}
                            `}
            >
              {dayData.day && (
                <>
                  <div className={`
                                        text-sm font-medium mb-1
                                        ${dayData.isToday ? 'text-primary-600' : 'text-secondary-700'}
                                    `}>
                    {dayData.day}
                  </div>

                  {/* Request indicators */}
                  <div className="space-y-1">
                    {dayData.requests.slice(0, 3).map((req, i) => (
                      <div
                        key={req._id || i}
                        className={`
                                                    text-xs p-1 rounded truncate
                                                    ${req.status === 'NEW' ? 'bg-primary-100 text-primary-700' : ''}
                                                    ${req.status === 'IN_PROGRESS' ? 'bg-warning-100 text-warning-700' : ''}
                                                    ${req.status === 'REPAIRED' ? 'bg-success-100 text-success-700' : ''}
                                                    ${req.status === 'SCRAP' ? 'bg-danger-100 text-danger-700' : ''}
                                                `}
                      >
                        {req.title}
                      </div>
                    ))}
                    {dayData.requests.length > 3 && (
                      <div className="text-xs text-secondary-500">
                        +{dayData.requests.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Create Preventive Maintenance Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Schedule Preventive Maintenance"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Monthly inspection"
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
              placeholder="Describe the maintenance task..."
              rows={3}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

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

          <Input
            label="Scheduled Date"
            name="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Day Detail Modal */}
      <Modal
        isOpen={showDayModal}
        onClose={() => { setShowDayModal(false); setSelectedDate(null); }}
        title={selectedDate ? `Maintenance - ${selectedDate.date.toLocaleDateString()}` : 'Maintenance'}
      >
        {selectedDate && (
          <div className="space-y-4">
            {selectedDate.requests.length > 0 ? (
              <div className="space-y-3">
                {selectedDate.requests.map((req) => (
                  <div key={req._id} className="p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-secondary-900">{req.title}</h4>
                      <Badge variant={getStatusColor(req.status)} size="sm">
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-600 mb-2">{req.description}</p>
                    <div className="flex items-center gap-4 text-sm text-secondary-500">
                      <span>📦 {getEquipmentName(req)}</span>
                      <Badge
                        variant={
                          req.priority === 'HIGH' ? 'danger' :
                            req.priority === 'MEDIUM' ? 'warning' : 'success'
                        }
                        size="sm"
                      >
                        {req.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-600">No maintenance scheduled for this day.</p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
              <Button variant="secondary" onClick={() => setShowDayModal(false)}>
                Close
              </Button>
              <Button variant="primary" icon={<Plus size={16} />} onClick={handleCreateFromDay}>
                Add Maintenance
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;