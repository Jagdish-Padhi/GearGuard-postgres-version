// src/pages/Reports.jsx
import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { useApp } from '../context/AppContext';

const Reports = () => {
    const { requests, equipment } = useApp();
    const [timeRange, setTimeRange] = useState('month');

    // Stats Calculation
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'repaired').length;
    const openRequests = requests.filter(r => r.status !== 'repaired' && r.status !== 'scrap').length;
    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

    // Mock Cost Data
    const totalCost = 12500;
    const costChange = 12; // +12%

    // Category Distribution
    const categoryStats = equipment.reduce((acc, eq) => {
        acc[eq.category] = (acc[eq.category] || 0) + 1;
        return acc;
    }, {});

    const maxCategoryCount = Math.max(...Object.values(categoryStats), 1);

    // Status Distribution
    const statusStats = {
        new: requests.filter(r => r.status === 'new').length,
        inProgress: requests.filter(r => r.status === 'in-progress').length,
        repaired: requests.filter(r => r.status === 'repaired').length,
        scrap: requests.filter(r => r.status === 'scrap').length,
    };

    const maxStatusCount = Math.max(...Object.values(statusStats), 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-secondary-900">
                        Reports & Analytics
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        Overview of maintenance performance and costs
                    </p>
                </div>
                <div className="w-48">
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        options={[
                            { value: 'week', label: 'Last 7 Days' },
                            { value: 'month', label: 'Last 30 Days' },
                            { value: 'quarter', label: 'Last Quarter' },
                            { value: 'year', label: 'Last Year' },
                        ]}
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Total Requests</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{totalRequests}</h3>
                        </div>
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center text-success-600 font-medium bg-success-50 px-1.5 py-0.5 rounded">
                            <TrendingUp size={14} className="mr-1" /> +5.2%
                        </span>
                        <span className="text-secondary-500">vs last period</span>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Completion Rate</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{completionRate}%</h3>
                        </div>
                        <div className="p-2 bg-success-50 rounded-lg text-success-600">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <div className="w-full bg-secondary-100 rounded-full h-2">
                            <div
                                className="bg-success-500 h-2 rounded-full"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Avg Repair Time</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">4.2 Days</h3>
                        </div>
                        <div className="p-2 bg-warning-50 rounded-lg text-warning-600">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center text-danger-600 font-medium bg-danger-50 px-1.5 py-0.5 rounded">
                            <TrendingDown size={14} className="mr-1" /> +0.8
                        </span>
                        <span className="text-secondary-500">vs last period</span>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Est. Maintenance Cost</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">${totalCost.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-secondary-100 rounded-lg text-secondary-600">
                            <span className="font-bold">$</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="flex items-center text-danger-600 font-medium bg-danger-50 px-1.5 py-0.5 rounded">
                            <TrendingUp size={14} className="mr-1" /> +{costChange}%
                        </span>
                        <span className="text-secondary-500">vs last period</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Category Chart (Simple CSS Bar Chart) */}
                <Card title="Equipment Distribution">
                    <div className="space-y-4 pt-2">
                        {Object.entries(categoryStats).map(([category, count]) => {
                            const percentage = Math.round((count / maxCategoryCount) * 100);
                            return (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-secondary-700">{category}</span>
                                        <span className="text-secondary-500">{count} units</span>
                                    </div>
                                    <div className="w-full bg-secondary-100 rounded-full h-2.5">
                                        <div
                                            className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Request Status Chart (Simple CSS Bar Chart) */}
                <Card title="Request Status">
                    <div className="space-y-4 pt-2">
                        <div className="space-y-4">
                            {Object.entries(statusStats).map(([status, count]) => {
                                const percentage = Math.round((count / maxStatusCount) * 100);
                                const colors = {
                                    new: 'bg-primary-500',
                                    inProgress: 'bg-warning-500',
                                    repaired: 'bg-success-500',
                                    scrap: 'bg-danger-500'
                                };
                                const labels = {
                                    new: 'New',
                                    inProgress: 'In Progress',
                                    repaired: 'Repaired',
                                    scrap: 'Scrap'
                                };

                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-secondary-700">{labels[status]}</span>
                                            <span className="text-secondary-500">{count}</span>
                                        </div>
                                        <div className="w-full bg-secondary-100 rounded-full h-2.5">
                                            <div
                                                className={`${colors[status]} h-2.5 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card title="Recent Activity">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider border-b border-secondary-200">
                                <th className="pb-3 pl-2">Subject</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {requests.slice(0, 5).map((req) => (
                                <tr key={req.id} className="text-sm group hover:bg-secondary-50">
                                    <td className="py-3 pl-2 font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">
                                        {req.subject}
                                    </td>
                                    <td className="py-3 text-secondary-600 capitalize">{req.type}</td>
                                    <td className="py-3 text-secondary-600">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3">
                                        <Badge variant={req.status} size="sm">{req.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-secondary-500">
                                        No recent activity
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
