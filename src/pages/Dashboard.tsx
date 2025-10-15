import React, { useEffect, useMemo } from 'react';
import { Users, BookOpen, FileText, Activity, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchQuizzes } from '../store/slices/quizzesSlice';
import { fetchMaterials } from '../store/slices/materialsSlice';
import { DashboardSkeleton } from '../components/ui/Skeleton';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { users, isLoading: usersLoading } = useAppSelector((state) => state.users);
  const { quizzes, isLoading: quizzesLoading } = useAppSelector((state) => state.quizzes);
  const { materials, isLoading: materialsLoading } = useAppSelector((state) => state.materials);

  useEffect(() => {
    // Fetch data based on user role
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      dispatch(fetchUsers());
    }
    dispatch(fetchQuizzes());
    dispatch(fetchMaterials());
  }, [dispatch]);

  // Calculate real statistics with useMemo for performance
  const statistics = useMemo(() => {
    const totalUsers = users && Array.isArray(users) ? users.length : 0;
    const totalQuizzes = quizzes && Array.isArray(quizzes) ? quizzes.length : 0;
    const totalMaterials = materials && Array.isArray(materials) ? materials.length : 0;
    const activeQuizzes = quizzes && Array.isArray(quizzes) ? quizzes.filter(quiz => quiz.isActive).length : 0;
    const inactiveQuizzes = totalQuizzes - activeQuizzes;
    const activeUsers = users && Array.isArray(users) ? users.filter(user => user.isActive).length : 0;
    
    return {
      totalUsers,
      totalQuizzes,
      totalMaterials,
      activeQuizzes,
      inactiveQuizzes,
      activeUsers
    };
  }, [users, quizzes, materials]);
  
  // Show loading skeleton while data is being fetched
  const isLoading = (user && (user.role === 'admin' || user.role === 'superadmin') ? usersLoading : false) || quizzesLoading || materialsLoading;
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentUsers = statistics.totalUsers > 0 && users && Array.isArray(users) ? users.filter(user => new Date(user.createdAt) > sevenDaysAgo).length : 0;
  const recentQuizzes = statistics.totalQuizzes > 0 && quizzes && Array.isArray(quizzes) ? quizzes.filter(quiz => new Date(quiz.createdAt) > sevenDaysAgo).length : 0;
  const recentMaterials = statistics.totalMaterials > 0 && materials && Array.isArray(materials) ? materials.filter(material => new Date(material.createdAt) > sevenDaysAgo).length : 0;

  const allStats = [
    {
      name: 'Total Users',
      value: statistics.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${recentUsers} this week`,
      changeType: 'positive',
      loading: usersLoading,
      roles: ['admin', 'superadmin'],
    },
    {
      name: 'Total Quizzes',
      value: statistics.totalQuizzes,
      icon: BookOpen,
      color: 'bg-green-500',
      change: `+${recentQuizzes} this week`,
      changeType: 'positive',
      loading: quizzesLoading,
      roles: ['admin', 'moderator', 'superadmin'],
    },
    {
      name: 'Total Materials',
      value: statistics.totalMaterials,
      icon: FileText,
      color: 'bg-purple-500',
      change: `+${recentMaterials} this week`,
      changeType: 'positive',
      loading: materialsLoading,
      roles: ['admin', 'moderator', 'superadmin'],
    },
    {
      name: 'Active Quizzes',
      value: statistics.activeQuizzes,
      icon: Activity,
      color: 'bg-orange-500',
      change: `${statistics.inactiveQuizzes} inactive`,
      changeType: statistics.inactiveQuizzes > 0 ? 'warning' : 'positive',
      loading: quizzesLoading,
      roles: ['admin', 'moderator', 'superadmin'],
    },
  ];

  // Filter stats based on user role
  const stats = allStats.filter(stat => user && stat.roles.includes(user.role));

  // Generate real recent activity from actual data
  const generateRecentActivity = () => {
    const activities: Array<{
      id: string;
      type: string;
      action: string;
      entityName: string;
      timestamp: string;
      user: string;
    }> = [];
    
    // Add recent users (with null check) - only for admin/superadmin
    if (user && (user.role === 'admin' || user.role === 'superadmin') && users && Array.isArray(users)) {
      [...users]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            action: 'created',
            entityName: user.name,
            timestamp: new Date(user.createdAt).toLocaleString(),
            user: 'System',
          });
        });
    }
    
    // Add recent quizzes (with null check)
    if (quizzes && Array.isArray(quizzes)) {
      [...quizzes]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(quiz => {
          activities.push({
            id: `quiz-${quiz.id}`,
            type: 'quiz',
            action: quiz.isActive ? 'activated' : 'created',
            entityName: quiz.title,
            timestamp: new Date(quiz.createdAt).toLocaleString(),
            user: 'System',
          });
        });
    }
    
    // Add recent materials (with null check)
    if (materials && Array.isArray(materials)) {
      [...materials]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .forEach(material => {
          activities.push({
            id: `material-${material.id}`,
            type: 'material',
            action: 'uploaded',
            entityName: material.title,
            timestamp: new Date(material.createdAt).toLocaleString(),
            user: 'System',
          });
        });
    }
    
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const recentActivity = generateRecentActivity();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Motivational Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden shadow-xl rounded-lg">
        <div className="px-6 py-8 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                Welcome to Maraki Learning Platform! 🎓
              </h3>
              <p className="text-blue-100 text-lg mb-4">
                Empowering education through technology and innovation
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                  <span>Interactive Learning</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                  <span>Rich Content Library</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                  <span>Progress Tracking</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block ml-6">
              <div className="text-6xl opacity-20">
                📚
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                {stat.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Report Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.length === 0 ? (
                  <li className="text-center py-8 text-gray-500">
                    No recent activity
                  </li>
                ) : (
                  recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Activity className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{activity.user}</span>{' '}
                                {activity.action} {activity.entityName}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Data Analytics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Analytics</h3>
            <div className="space-y-4">
              {/* User Activity Rate - only for admin/superadmin */}
              {user && (user.role === 'admin' || user.role === 'superadmin') && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User Activity Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {statistics.totalUsers > 0 ? Math.round((statistics.activeUsers / statistics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${statistics.totalUsers > 0 ? (statistics.activeUsers / statistics.totalUsers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quiz Completion Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.totalQuizzes > 0 ? Math.round((statistics.activeQuizzes / statistics.totalQuizzes) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${statistics.totalQuizzes > 0 ? (statistics.activeQuizzes / statistics.totalQuizzes) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Content Distribution</span>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.totalMaterials > 0 && materials && Array.isArray(materials) ? Math.round((materials.filter(m => m.type === 'pdf').length / statistics.totalMaterials) * 100) : 0}% PDFs
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${statistics.totalMaterials > 0 && materials && Array.isArray(materials) ? (materials.filter(m => m.type === 'pdf').length / statistics.totalMaterials) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className={`grid gap-4 text-center ${user && (user.role === 'admin' || user.role === 'superadmin') ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* New Users - only for admin/superadmin */}
                  {user && (user.role === 'admin' || user.role === 'superadmin') && (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{recentUsers}</p>
                      <p className="text-sm text-gray-500">New Users (7d)</p>
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{recentQuizzes + recentMaterials}</p>
                    <p className="text-sm text-gray-500">New Content (7d)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
