import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Search, Filter, Crown, GraduationCap, BookOpen, TrendingUp,
  ChevronLeft, ChevronRight, Zap, Star, Calendar, RefreshCw, X, Eye
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchStudents, fetchStudentAnalytics, updateStudentSubscription } from '../store/slices/studentsSlice';
import type { StudentUser } from '../services/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  MONTHLY: 'bg-purple-100 text-purple-700',
  DAILY: 'bg-blue-100 text-blue-700', // Used for 3 Months tier
  YEARLY: 'bg-amber-100 text-amber-700',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-orange-100 text-orange-700',
  advanced: 'bg-red-100 text-red-700',
};

const TIER_LABEL: Record<string, string> = {
  FREE: 'Free',
  MONTHLY: '1 Month',
  DAILY: 'Weekly / Quarterly',
  YEARLY: '1 Year',
};

function getDisplayName(student: StudentUser): string {
  const parts = [student.firstName, student.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  if (student.username) return `@${student.username}`;
  return `User ${student.telegramId.slice(-6)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ─── Student Detail Drawer ───────────────────────────────────────────────────

interface DrawerProps {
  student: StudentUser | null;
  onClose: () => void;
  onUpdateTier: (telegramId: string, tier: string) => Promise<void>;
  isUpdating: boolean;
}

const StudentDrawer: React.FC<DrawerProps> = ({ student, onClose, onUpdateTier, isUpdating }) => {
  const [selectedTier, setSelectedTier] = useState('');

  useEffect(() => {
    if (student) setSelectedTier(student.subscriptionTier.toLowerCase());
  }, [student]);

  if (!student) return null;

  const isPremiumActive =
    student.isMarakiPremium &&
    (!student.subscriptionExpiresAt || new Date(student.subscriptionExpiresAt) > new Date());

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {getDisplayName(student).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{getDisplayName(student)}</h2>
              {student.username && <p className="text-indigo-200 text-sm">@{student.username}</p>}
              <p className="text-indigo-200 text-xs mt-1">Telegram ID: {student.telegramId}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPremiumActive ? 'bg-amber-400/30 text-amber-100' : 'bg-white/20 text-white/80'}`}>
              {isPremiumActive ? '⭐ Premium Active' : '🔒 Free Tier'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white/80 capitalize">
              {student.level}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-2xl font-bold text-indigo-700">{student.totalQuizzesCompleted}</p>
            <p className="text-xs text-indigo-500 mt-1">Quizzes Done</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-700">{student.totalMaterialsAccessed}</p>
            <p className="text-xs text-purple-500 mt-1">Lessons Accessed</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4 flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subscription</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[student.subscriptionTier]}`}>
                {TIER_LABEL[student.subscriptionTier]}
              </span>
            </div>
            {student.subscriptionExpiresAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expires</span>
                <span className={`font-medium ${new Date(student.subscriptionExpiresAt) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                  {new Date(student.subscriptionExpiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {student.referredBy && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Referred by</span>
                <span className="font-medium text-indigo-600">{student.referredBy}</span>
              </div>
            )}
          </div>

          {/* Update Subscription */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Subscription</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { id: 'free', label: 'Free' },
                { id: 'weekly', label: '1 Week' },
                { id: 'monthly', label: '1 Month' },
                { id: 'daily', label: '3 Months' },
                { id: 'yearly', label: '1 Year' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTier(id)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all
                    ${selectedTier === id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => onUpdateTier(student.telegramId, selectedTier)}
              disabled={isUpdating || selectedTier === student.subscriptionTier.toLowerCase()}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                <><Zap className="h-4 w-4" /> Apply Subscription</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Students Page ──────────────────────────────────────────────────────

const Students: React.FC = () => {
  const dispatch = useAppDispatch();
  const { students = [], analytics = null, total = 0, page = 1, totalPages = 1, isLoading = false, analyticsLoading = false } = useAppSelector((s) => s.students) ?? {};

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    dispatch(fetchStudents({
      page: currentPage,
      limit: 20,
      search: debouncedSearch || undefined,
      level: levelFilter || undefined,
      subscription: subFilter || undefined,
    }));
  }, [dispatch, currentPage, debouncedSearch, levelFilter, subFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { dispatch(fetchStudentAnalytics()); }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, levelFilter, subFilter]);

  const handleUpdateTier = async (telegramId: string, tier: string) => {
    setIsUpdating(true);
    await dispatch(updateStudentSubscription({ telegramId, tier }));
    setIsUpdating(false);
    load();
  };

  const statCards = [
    {
      label: 'Total Students',
      value: analytics?.totalUsers ?? 0,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      sub: `+${analytics?.recentUsers ?? 0} this week`,
    },
    {
      label: 'Premium Users',
      value: analytics?.marakiPremiumUsers ?? 0,
      icon: Crown,
      color: 'from-amber-500 to-amber-600',
      sub: `${analytics?.subscriptionBreakdown.monthly ?? 0} monthly · ${analytics?.subscriptionBreakdown.yearly ?? 0} yearly`,
    },
    {
      label: 'Total Referrals',
      value: (analytics as any)?.referrals?.totalReferredUsers ?? 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      sub: `${(analytics as any)?.referrals?.referralConversionRate ?? 0}% viral join rate`,
    },
    {
      label: 'Quizzes Completed',
      value: analytics?.engagement.totalQuizzesCompleted ?? 0,
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      sub: 'All time',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Telegram bot learners — the heart of the platform</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {analyticsLoading ? '...' : card.value.toLocaleString()}
                </p>
                <p className="text-white/70 text-xs mt-2">{card.sub}</p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-xl">
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level & Subscription Breakdown */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              Level Distribution
            </h3>
            {[
              { label: 'Beginner', value: analytics.levelBreakdown.beginner, color: 'bg-emerald-500' },
              { label: 'Intermediate', value: analytics.levelBreakdown.intermediate, color: 'bg-orange-500' },
              { label: 'Advanced', value: analytics.levelBreakdown.advanced, color: 'bg-red-500' },
            ].map(({ label, value, color }) => {
              const pct = analytics.totalUsers > 0 ? Math.round((value / analytics.totalUsers) * 100) : 0;
              return (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Subscription Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Subscription Tiers
            </h3>
            {[
              { label: 'Free', value: analytics.subscriptionBreakdown.free, color: 'bg-gray-400' },
              { label: '1 Month', value: analytics.subscriptionBreakdown.monthly, color: 'bg-purple-500' },
              { label: 'Weekly / Qtrly', value: analytics.subscriptionBreakdown.daily, color: 'bg-blue-500' },
              { label: '1 Year', value: analytics.subscriptionBreakdown.yearly, color: 'bg-amber-500' },
            ].map(({ label, value, color }) => {
              const pct = analytics.totalUsers > 0 ? Math.round((value / analytics.totalUsers) * 100) : 0;
              return (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="">All Subscriptions</option>
            <option value="free">Free Tier</option>
            <option value="monthly">1 Month</option>
            <option value="daily">Weekly / Quarterly</option>
            <option value="yearly">1 Year</option>
          </select>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {isLoading ? 'Loading…' : `${total.toLocaleString()} students found`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Student</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Level</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Subscription</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Quizzes</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Lessons</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Joined</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-gray-200" /><div className="space-y-1"><div className="h-3.5 bg-gray-200 rounded w-32" /><div className="h-3 bg-gray-100 rounded w-20" /></div></div></td>
                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-8 ml-auto" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-8 ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-4" />
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No students found</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const name = getDisplayName(student);
                  const isPremium = student.isMarakiPremium && (!student.subscriptionExpiresAt || new Date(student.subscriptionExpiresAt) > new Date());
                  return (
                    <tr
                      key={student.telegramId}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${isPremium ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              {name}
                              {isPremium && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                            </p>
                            <p className="text-xs text-gray-400">
                              {student.username ? `@${student.username} · ` : ''}{student.telegramId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${LEVEL_COLORS[student.level] || 'bg-gray-100 text-gray-600'}`}>
                          {student.level}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TIER_COLORS[student.subscriptionTier]}`}>
                          {TIER_LABEL[student.subscriptionTier]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        {student.totalQuizzesCompleted.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        {student.totalMaterialsAccessed.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-300" />
                          {timeAgo(student.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total.toLocaleString()} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-9 h-9 text-sm rounded-lg font-medium transition ${pg === currentPage ? 'bg-indigo-600 text-white shadow-sm' : 'border border-gray-200 hover:bg-white text-gray-600'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Drawer */}
      {selectedStudent && (
        <StudentDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdateTier={handleUpdateTier}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};

export default Students;
