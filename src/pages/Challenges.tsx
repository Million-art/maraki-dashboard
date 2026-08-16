import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { challengesApi, type DailyChallenge, type ChallengeStats, type CreateChallengeDto } from '../services/api';

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  intermediate: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  advanced: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const Challenges: React.FC = () => {
  // State
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<DailyChallenge | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateChallengeDto>({
    level: 'intermediate',
    dayNumber: 1,
    word: '',
    wordPartOfSpeech: 'noun',
    wordDefinition: '',
    wordExample: '',
    idiom: '',
    idiomMeaning: '',
    idiomExample: '',
  });

  // Fetch Stats & Today Preview
  const fetchStats = useCallback(async () => {
    try {
      const [statsData, todayData] = await Promise.all([
        challengesApi.getStats(),
        challengesApi.getToday('intermediate'),
      ]);
      setStats(statsData);
      setTodayChallenge(todayData.data);
    } catch (err: any) {
      console.error('Failed to load challenge stats:', err);
    }
  }, []);

  // Fetch Paginated Challenges
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await challengesApi.getAll({
        page,
        limit,
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        search: searchQuery.trim() || undefined,
      });
      setChallenges(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load daily challenges');
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedLevel, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleLevelTabChange = (level: string) => {
    setSelectedLevel(level);
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData({
      level: selectedLevel !== 'all' ? selectedLevel : 'intermediate',
      dayNumber: totalCount + 1,
      word: '',
      wordPartOfSpeech: 'noun',
      wordDefinition: '',
      wordExample: '',
      idiom: '',
      idiomMeaning: '',
      idiomExample: '',
    });
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (challenge: DailyChallenge) => {
    setEditingChallenge(challenge);
    setFormData({
      level: challenge.level,
      dayNumber: challenge.dayNumber,
      word: challenge.word,
      wordPartOfSpeech: challenge.wordPartOfSpeech,
      wordDefinition: challenge.wordDefinition,
      wordExample: challenge.wordExample,
      idiom: challenge.idiom,
      idiomMeaning: challenge.idiomMeaning,
      idiomExample: challenge.idiomExample,
    });
    setIsFormOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingChallenge) {
        await challengesApi.update(editingChallenge.id, formData);
        setSuccessMessage('Challenge updated successfully!');
      } else {
        await challengesApi.create(formData);
        setSuccessMessage('New daily challenge created successfully!');
      }
      setIsFormOpen(false);
      fetchChallenges();
      fetchStats();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save challenge');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Challenge
  const handleDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await challengesApi.delete(deletingId);
      setSuccessMessage('Challenge deleted successfully!');
      setDeletingId(null);
      fetchChallenges();
      fetchStats();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete challenge');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" />
            Daily Challenge Engine
          </h1>
          <p className="text-sm text-gray-500">
            Manage daily English vocabulary & idiom challenges served to Telegram bot users
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Challenge
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Challenges</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Beginner</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.beginner ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Intermediate</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.intermediate ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Advanced</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.advanced ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Today's Challenge Feature Preview */}
      {todayChallenge && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
              Today's Live Challenge Preview
            </span>
            <span className="text-xs opacity-80 font-medium">Day #{todayChallenge.dayNumber}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-white/10 p-3.5 rounded-lg backdrop-blur-md border border-white/10">
              <p className="text-xs text-blue-200 font-medium uppercase">Word of the Day</p>
              <p className="text-lg font-bold text-white mt-0.5">{todayChallenge.word} <span className="text-xs font-normal text-blue-200">({todayChallenge.wordPartOfSpeech})</span></p>
              <p className="text-xs text-blue-100 mt-1 italic">"{todayChallenge.wordDefinition}"</p>
            </div>
            <div className="bg-white/10 p-3.5 rounded-lg backdrop-blur-md border border-white/10">
              <p className="text-xs text-purple-200 font-medium uppercase">Idiom of the Day</p>
              <p className="text-lg font-bold text-white mt-0.5">"{todayChallenge.idiom}"</p>
              <p className="text-xs text-purple-100 mt-1 italic">"{todayChallenge.idiomMeaning}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Level Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelTabChange(lvl)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                selectedLevel === lvl
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search word or idiom..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Challenge Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-sm">Loading daily challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-gray-700">No challenges found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or level filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Day #</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Word & POS</th>
                  <th className="py-3 px-4">Definition & Example</th>
                  <th className="py-3 px-4">Idiom & Meaning</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {challenges.map((c) => {
                  const color = LEVEL_COLORS[c.level] || LEVEL_COLORS.intermediate;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        #{c.dayNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${color.bg} ${color.text} ${color.border}`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{c.word}</div>
                        <div className="text-xs text-gray-400 italic">({c.wordPartOfSpeech})</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-gray-800 font-medium line-clamp-1">{c.wordDefinition}</div>
                        <div className="text-xs text-gray-500 italic mt-0.5 line-clamp-1">"{c.wordExample}"</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-indigo-950 line-clamp-1">"{c.idiom}"</div>
                        <div className="text-xs text-gray-600 line-clamp-1">{c.idiomMeaning}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                          title="Edit Challenge"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Challenge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && challenges.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(page * limit, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> challenges
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingChallenge ? 'Edit Daily Challenge' : 'Add Daily Challenge'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Day Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.dayNumber}
                    onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Word Section */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Vocabulary Word</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Word (e.g. Eloquent)"
                      required
                      value={formData.word}
                      onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="POS (adj, verb)"
                      required
                      value={formData.wordPartOfSpeech}
                      onChange={(e) => setFormData({ ...formData, wordPartOfSpeech: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Word Definition"
                  required
                  value={formData.wordDefinition}
                  onChange={(e) => setFormData({ ...formData, wordDefinition: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <textarea
                  placeholder="Word Example Sentence"
                  rows={2}
                  required
                  value={formData.wordExample}
                  onChange={(e) => setFormData({ ...formData, wordExample: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Idiom Section */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Idiom & Phrase</p>
                <input
                  type="text"
                  placeholder="Idiom (e.g. Cut to the chase)"
                  required
                  value={formData.idiom}
                  onChange={(e) => setFormData({ ...formData, idiom: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 mb-3"
                />
                <input
                  type="text"
                  placeholder="Idiom Meaning"
                  required
                  value={formData.idiomMeaning}
                  onChange={(e) => setFormData({ ...formData, idiomMeaning: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 mb-3"
                />
                <textarea
                  placeholder="Idiom Example Sentence"
                  rows={2}
                  required
                  value={formData.idiomExample}
                  onChange={(e) => setFormData({ ...formData, idiomExample: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
            <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Daily Challenge?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to delete this challenge? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
