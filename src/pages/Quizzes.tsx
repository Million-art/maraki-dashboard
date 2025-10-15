import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Play, Pause } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchQuizzes, setFilters, setSelectedQuiz, activateQuiz, deactivateQuiz } from '../store/slices/quizzesSlice';
import { openModal } from '../store/slices/uiSlice';
import type { Quiz } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import CreateQuizModal from '../components/modals/CreateQuizModal';
import EditQuizModal from '../components/modals/EditQuizModal';
import DeleteQuizModal from '../components/modals/DeleteQuizModal';

const Quizzes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { quizzes, isLoading, filters } = useAppSelector((state) => state.quizzes);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleCreateQuiz = () => {
    dispatch(openModal('createQuiz'));
  };

  const handleEditQuiz = (quiz: Quiz) => {
    dispatch(setSelectedQuiz(quiz));
    dispatch(openModal('editQuiz'));
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    dispatch(setSelectedQuiz(quiz));
    dispatch(openModal('deleteConfirm'));
  };

  const handleActivateQuiz = async (quiz: Quiz) => {
    try {
      await dispatch(activateQuiz(quiz.id)).unwrap();
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleDeactivateQuiz = async (quiz: Quiz) => {
    try {
      await dispatch(deactivateQuiz(quiz.id)).unwrap();
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Quiz',
      render: (_value: string, quiz: Quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
          <div className="text-sm text-gray-500">{quiz.description || 'No description'}</div>
        </div>
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
      key: 'totalQuestions',
      title: 'Questions',
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value} min</span>
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
      render: (_value: any, quiz: Quiz) => (
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleEditQuiz(quiz)}
            icon={<Edit className="h-4 w-4" />}
            title="Edit Quiz"
          />
          {quiz.isActive ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeactivateQuiz(quiz)}
              icon={<Pause className="h-4 w-4" />}
              title="Deactivate Quiz"
            />
          ) : (
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => handleActivateQuiz(quiz)}
              icon={<Play className="h-4 w-4" />}
              title="Activate Quiz"
            />
          )}
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => handleDeleteQuiz(quiz)}
            icon={<Trash2 className="h-4 w-4" />}
            title="Delete Quiz"
          />
        </div>
      ),
    },
  ];

  const filteredQuizzes = quizzes && Array.isArray(quizzes) ? quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filters.category || quiz.category === filters.category;
    const matchesDifficulty = !filters.difficulty || quiz.difficulty === filters.difficulty;
    const matchesStatus = !filters.status || 
                         (filters.status === 'active' && quiz.isActive) ||
                         (filters.status === 'inactive' && !quiz.isActive);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  }) : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage quizzes and assessments
          </p>
        </div>
        <Button 
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreateQuiz}
        >
          Create Quiz
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search quizzes..."
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
            value={filters.difficulty}
            onChange={(e) => dispatch(setFilters({ difficulty: e.target.value }))}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
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

      {/* Quizzes table */}
      <Table
        data={filteredQuizzes}
        columns={columns}
        loading={isLoading}
        emptyMessage="No quizzes found"
      />

      {/* Modals */}
      <CreateQuizModal />
      <EditQuizModal />
      <DeleteQuizModal />
    </div>
  );
};

export default Quizzes;
