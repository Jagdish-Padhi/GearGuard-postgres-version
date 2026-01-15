import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Search, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PageTransition from '../components/common/PageTransition';

const Billing = () => {
  const { payments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for now - will be replaced with actual API
  const mockPayments = [
    {
      id: 'PAY001',
      date: '2026-01-10',
      description: 'Equipment Rental - CNC Machine #1',
      amount: 500,
      status: 'completed',
      invoiceUrl: '#'
    },
    {
      id: 'PAY002',
      date: '2026-01-08',
      description: 'Maintenance Service - Hydraulic Press',
      amount: 250,
      status: 'completed',
      invoiceUrl: '#'
    },
    {
      id: 'PAY003',
      date: '2026-01-05',
      description: 'Equipment Rental - Lathe Machine',
      amount: 350,
      status: 'pending',
      invoiceUrl: '#'
    }
  ];

  const totalPaid = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { variant: 'success', icon: <CheckCircle2 size={14} /> },
      pending: { variant: 'warning', icon: <Clock size={14} /> },
      failed: { variant: 'danger', icon: <XCircle size={14} /> }
    };
    return badges[status] || badges.pending;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Billing & Payments
          </h1>
          <p className="text-secondary-600 mt-1">
            View your payment history and invoices
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <DollarSign size={24} className="text-success-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Total Paid</p>
                <p className="text-2xl font-bold text-secondary-900">${totalPaid}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Clock size={24} className="text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Pending</p>
                <p className="text-2xl font-bold text-secondary-900">${pendingAmount}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <CreditCard size={24} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Transactions</p>
                <p className="text-2xl font-bold text-secondary-900">{mockPayments.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </Card>

        {/* Payment History */}
        <Card title="Payment History">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Transaction ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4 text-sm font-medium text-secondary-900">
                      {payment.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-900">
                      {payment.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-secondary-900">
                      ${payment.amount}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={getStatusBadge(payment.status).variant}
                        icon={getStatusBadge(payment.status).icon}
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                      >
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Billing;