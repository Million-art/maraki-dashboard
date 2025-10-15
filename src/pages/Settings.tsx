import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: User,
      items: [
        'Personal Information',
        'Password & Security',
        'Notification Preferences',
        'Language & Region'
      ]
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: SettingsIcon,
      items: [
        'General Settings',
        'Database Configuration',
        'Backup & Restore',
        'System Maintenance'
      ]
    },
    {
      title: 'Security Settings',
      description: 'Manage security policies and access controls',
      icon: Shield,
      items: [
        'User Permissions',
        'Role Management',
        'API Keys',
        'Audit Logs'
      ]
    },
    {
      title: 'Notifications',
      description: 'Configure notification settings and alerts',
      icon: Bell,
      items: [
        'Email Notifications',
        'Push Notifications',
        'Alert Settings',
        'Notification History'
      ]
    },
    {
      title: 'Data Management',
      description: 'Manage data storage and processing settings',
      icon: Database,
      items: [
        'Data Export',
        'Data Import',
        'Storage Settings',
        'Data Retention'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your application settings and preferences
          </p>
        </div>
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm">
                  <span className="text-indigo-600 hover:text-indigo-500 font-medium cursor-pointer">
                    Configure →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <SettingsIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Settings Coming Soon
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The settings panel is currently under development. Advanced configuration options will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
