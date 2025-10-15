import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUsers, setFilters, setSelectedUser } from '../store/slices/usersSlice';
import { openModal } from '../store/slices/uiSlice';
import type { User } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { formatDate, getInitials } from '../lib/utils';
import CreateUserModal from '../components/modals/CreateUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import DeleteUserModal from '../components/modals/DeleteUserModal';

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading, filters } = useAppSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreateUser = () => {
    dispatch(openModal('createUser'));
  };

  const handleEditUser = (user: User) => {
    dispatch(setSelectedUser(user));
    dispatch(openModal('editUser'));
  };

  const handleDeleteUser = (user: User) => {
    dispatch(setSelectedUser(user));
    dispatch(openModal('deleteConfirm'));
  };

  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (_value: string, user: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-gray-600 text-sm font-medium">
              {getInitials(user.name)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (value: string) => (
        <Badge variant="info" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'error'} size="sm">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: any, user: User) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditUser(user)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => handleDeleteUser(user)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = users && Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
                         (filters.status === 'active' && user.isActive) ||
                         (filters.status === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <Button 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreateUser}
        >
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.role}
            onChange={(e) => dispatch(setFilters({ role: e.target.value }))}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.status}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <Table
        data={filteredUsers}
        columns={columns}
        loading={isLoading}
        emptyMessage="No users found"
      />

      {/* Modals */}
      <CreateUserModal />
      <EditUserModal />
      <DeleteUserModal />
    </div>
  );
};

export default Users;
