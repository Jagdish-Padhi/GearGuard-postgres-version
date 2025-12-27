import React, { useState } from 'react';
import { User, Bell, Lock, Save, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [notificationSettings, setNotificationSettings] = useState({
        emailAlerts: true,
        pushNotifications: true,
        weeklyReport: false,
        maintenanceReminders: true,
    });


    // Tabs Configuration
    const tabs = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    const handleNotificationToggle = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-secondary-900">
                    Settings
                </h1>
                <p className="text-secondary-600 mt-1">
                    Manage your account preferences and application settings
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <Card className="p-2">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <Card title="Profile Information">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <img
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
                                        />
                                        <button className="absolute bottom-0 right-0 p-1.5 bg-white border border-secondary-200 rounded-full shadow-sm text-secondary-600 hover:text-primary-600">
                                            <Upload size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-secondary-900">{user?.name}</h3>
                                        <p className="text-secondary-500">{user?.role} • {user?.email}</p>
                                        <div className="mt-3">
                                            <Badge variant="primary">Active</Badge>
                                        </div>
                                    </div>
                                </div>

                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Full Name" defaultValue={user?.name} />
                                        <Input label="Email Address" defaultValue={user?.email} disabled />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
                                        <Input label="Job Title" defaultValue={user?.role} />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button variant="primary" icon={<Save size={16} />}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <Card title="Notification Preferences">
                            <div className="space-y-6">
                                {Object.entries(notificationSettings).map(([key, enabled]) => (
                                    <div key={key} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-secondary-900 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className="text-sm text-secondary-500">
                                                Receive notifications about {key.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationToggle(key)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                        ${enabled ? 'bg-primary-600' : 'bg-secondary-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-end">
                                    <Button variant="primary" icon={<Save size={16} />}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}



                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <Card title="Security">
                            <form className="space-y-4">
                                <Input label="Current Password" type="password" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="New Password" type="password" />
                                    <Input label="Confirm New Password" type="password" />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button variant="primary" icon={<Save size={16} />}>
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
