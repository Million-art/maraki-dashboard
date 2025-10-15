import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchMaterials, setFilters, setSelectedMaterial } from '../store/slices/materialsSlice';
import { openModal } from '../store/slices/uiSlice';
import type { Material } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { formatDate, formatFileSize } from '../lib/utils';
import CreateMaterialModal from '../components/modals/CreateMaterialModal';
import EditMaterialModal from '../components/modals/EditMaterialModal';
import DeleteMaterialModal from '../components/modals/DeleteMaterialModal';

const Materials: React.FC = () => {
  const dispatch = useAppDispatch();
  const { materials, isLoading, filters } = useAppSelector((state) => state.materials);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handleCreateMaterial = () => {
    dispatch(openModal('createMaterial'));
  };

  const handleEditMaterial = (material: Material) => {
    dispatch(setSelectedMaterial(material));
    dispatch(openModal('editMaterial'));
  };

  const handleDeleteMaterial = (material: Material) => {
    dispatch(setSelectedMaterial(material));
    dispatch(openModal('deleteConfirm'));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'document':
        return '📝';
      case 'link':
        return '🔗';
      case 'presentation':
        return '📊';
      default:
        return '📁';
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Material',
      render: (_value: string, material: Material) => (
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getTypeIcon(material.type)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{material.title}</div>
            <div className="text-sm text-gray-500">{material.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <Badge variant="info" size="sm">
          {value.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      render: (value: string) => (
        <Badge 
          variant={value === 'easy' ? 'success' : value === 'medium' ? 'warning' : 'error'} 
          size="sm"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value || 'None'}</span>
      ),
    },
    {
      key: 'fileSize',
      title: 'Size',
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value ? formatFileSize(value) : '-'}</span>
      ),
    },
    {
      key: 'downloadCount',
      title: 'Downloads',
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value}</span>
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
      render: (_value: any, material: Material) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditMaterial(material)}
            icon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          {material.url && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(material.url, '_blank')}
              icon={<Eye className="h-4 w-4" />}
            >
              View
            </Button>
          )}
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => handleDeleteMaterial(material)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredMaterials = materials && Array.isArray(materials) ? materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filters.category || material.category === filters.category;
    const matchesType = !filters.type || material.type === filters.type;
    const matchesDifficulty = !filters.difficulty || material.difficulty === filters.difficulty;
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  }) : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage educational materials and resources
          </p>
        </div>
        <Button 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreateMaterial}
        >
          Add Material
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={handleSearch}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.category}
            onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
          >
            <option value="">All Categories</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="language">Language</option>
          </select>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.type}
            onChange={(e) => dispatch(setFilters({ type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="link">Link</option>
            <option value="presentation">Presentation</option>
          </select>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.difficulty}
            onChange={(e) => dispatch(setFilters({ difficulty: e.target.value }))}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Materials table */}
      <Table
        data={filteredMaterials}
        columns={columns}
        loading={isLoading}
        emptyMessage="No materials found"
      />

      {/* Modals */}
      <CreateMaterialModal />
      <EditMaterialModal />
      <DeleteMaterialModal />
    </div>
  );
};

export default Materials;
