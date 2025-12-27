import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { equipment, teams, requests, loading } = useApp();

  // Calculate stats
  const stats = useMemo(() => {
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter(eq => eq.status === 'ACTIVE').length;
    const scrappedEquipment = equipment.filter(eq => eq.status === 'SCRAPPED').length;

    const totalTeams = teams.length;
    const totalMembers = teams.reduce((acc, team) => acc + (team.technicians?.length || 0), 0);

    const totalRequests = requests.length;
    const newRequests = requests.filter(r => r.status === 'NEW').length;
    const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS').length;
    const repairedRequests = requests.filter(r => r.status === 'REPAIRED').length;
    const scrappedRequests = requests.filter(r => r.status === 'SCRAP').length;

    const correctiveRequests = requests.filter(r => r.type === 'CORRECTIVE').length;
    const preventiveRequests = requests.filter(r => r.type === 'PREVENTIVE').length;

    // Overdue requests
    const overdueRequests = requests.filter(r => {
      if (r.status === 'REPAIRED' || r.status === 'SCRAP') return false;
      if (!r.scheduledDate) return false;
      return new Date(r.scheduledDate) < new Date();
    }).length;

    return {
      totalEquipment,
      activeEquipment,
      scrappedEquipment,
      totalTeams,
      totalMembers,
      totalRequests,
      newRequests,
      inProgressRequests,
      repairedRequests,
      scrappedRequests,
      correctiveRequests,
      preventiveRequests,
      overdueRequests,
    };
  }, [equipment, teams, requests]);

  // Recent requests
  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [requests]);

  // Upcoming preventive maintenance
  const upcomingMaintenance = useMemo(() => {
    const now = new Date();
    return requests
      .filter(r => r.type === 'PREVENTIVE' && r.scheduledDate && new Date(r.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
      .slice(0, 5);
  }, [requests]);

  const getEquipmentName = (req) => {
    if (req.equipment?.name) return req.equipment.name;
    const eq = equipment.find(e => e._id === req.equipment);
    return eq?.name || 'Unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'NEW': return <AlertCircle size={16} className="text-primary-500" />;
      case 'IN_PROGRESS': return <Clock size={16} className="text-warning-500" />;
      case 'REPAIRED': return <CheckCircle2 size={16} className="text-success-500" />;
      case 'SCRAP': return <Trash2 size={16} className="text-danger-500" />;
      default: return null;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome back, {user?.fullName || user?.username || 'User'}! 👋
        </h1>
        <p className="text-primary-100">
          Here's an overview of your maintenance operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/equipment')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Equipment</p>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalEquipment}</p>
              <p className="text-xs text-success-600">{stats.activeEquipment} active</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/teams')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Users size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Teams</p>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalTeams}</p>
              <p className="text-xs text-secondary-500">{stats.totalMembers} members</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/requests')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Wrench size={24} className="text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Active Requests</p>
              <p className="text-3xl font-bold text-secondary-900">
                {stats.newRequests + stats.inProgressRequests}
              </p>
              <p className="text-xs text-warning-600">{stats.newRequests} new</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/calendar')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertCircle size={24} className="text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Overdue</p>
              <p className="text-3xl font-bold text-secondary-900">{stats.overdueRequests}</p>
              <p className="text-xs text-danger-600">needs attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Request Status Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Request Status Overview</h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/requests')}>
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg text-center">
            <AlertCircle size={24} className="mx-auto text-primary-600 mb-2" />
            <p className="text-2xl font-bold text-primary-600">{stats.newRequests}</p>
            <p className="text-sm text-primary-700">New</p>
          </div>

          <div className="p-4 bg-warning-50 rounded-lg text-center">
            <Clock size={24} className="mx-auto text-warning-600 mb-2" />
            <p className="text-2xl font-bold text-warning-600">{stats.inProgressRequests}</p>
            <p className="text-sm text-warning-700">In Progress</p>
          </div>

          <div className="p-4 bg-success-50 rounded-lg text-center">
            <CheckCircle2 size={24} className="mx-auto text-success-600 mb-2" />
            <p className="text-2xl font-bold text-success-600">{stats.repairedRequests}</p>
            <p className="text-sm text-success-700">Repaired</p>
          </div>

          <div className="p-4 bg-danger-50 rounded-lg text-center">
            <Trash2 size={24} className="mx-auto text-danger-600 mb-2" />
            <p className="text-2xl font-bold text-danger-600">{stats.scrappedRequests}</p>
            <p className="text-sm text-danger-700">Scrapped</p>
          </div>
        </div>

        {/* Request Types */}
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger-500"></div>
              <span className="text-sm text-secondary-600">
                Corrective: <strong>{stats.correctiveRequests}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-secondary-600">
                Preventive: <strong>{stats.preventiveRequests}</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Requests</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate('/requests')}>
              View All
            </Button>
          </div>

          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(req.status)}
                    <div>
                      <p className="font-medium text-secondary-900">{req.title}</p>
                      <p className="text-sm text-secondary-500">{getEquipmentName(req)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(req.status)} size="sm">
                      {req.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Wrench size={32} className="mx-auto mb-2 opacity-50" />
              <p>No requests yet</p>
            </div>
          )}
        </Card>

        {/* Upcoming Preventive Maintenance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Upcoming Maintenance</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate('/calendar')}>
              View Calendar
            </Button>
          </div>

          {upcomingMaintenance.length > 0 ? (
            <div className="space-y-3">
              {upcomingMaintenance.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Calendar size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{req.title}</p>
                      <p className="text-sm text-secondary-500">{getEquipmentName(req)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">
                      {new Date(req.scheduledDate).toLocaleDateString()}
                    </p>
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
            <div className="text-center py-8 text-secondary-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p>No upcoming maintenance scheduled</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/requests')}>
            <Wrench size={16} className="mr-2" /> New Request
          </Button>
          <Button variant="secondary" onClick={() => navigate('/equipment')}>
            <Package size={16} className="mr-2" /> Add Equipment
          </Button>
          <Button variant="secondary" onClick={() => navigate('/teams')}>
            <Users size={16} className="mr-2" /> Manage Teams
          </Button>
          <Button variant="secondary" onClick={() => navigate('/calendar')}>
            <Calendar size={16} className="mr-2" /> Schedule Maintenance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
