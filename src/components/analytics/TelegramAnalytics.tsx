import React, { useEffect, useState } from 'react';
import { Users, Crown, TrendingUp, Activity, BookOpen, Clock, MessageSquare, Globe } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import type { TelegramUserAnalytics } from '../../types';
import { cn } from '../../lib/utils';

interface TelegramAnalyticsProps {
  className?: string;
}

const TelegramAnalytics: React.FC<TelegramAnalyticsProps> = ({ className }) => {
  const [analytics, setAnalytics] = useState<TelegramUserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.getTelegramUserAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={cn("p-6", className)}>
        <div className="text-center text-red-600">
          <p>{error || 'No analytics data available'}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = "blue" }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color?: "blue" | "green" | "purple" | "orange" | "red";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      red: "bg-red-50 text-red-600 border-red-200",
    };

    return (
      <div className={cn("rounded-lg border p-4", colorClasses[color])}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
          <Icon className="h-8 w-8 opacity-75" />
        </div>
      </div>
    );
  };

  const ProgressBar = ({ label, value, total, color = "blue" }: {
    label: string;
    value: number;
    total: number;
    color?: "blue" | "green" | "purple" | "orange";
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-gray-600">{value} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-300", colorClasses[color])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Telegram Bot Analytics</h2>
        <p className="text-gray-600">Real-time insights about your Telegram bot users</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Premium Users"
          value={analytics.premiumUsers}
          icon={Crown}
          color="purple"
        />
        <StatCard
          title="Recent Users (30d)"
          value={analytics.recentUsers}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Level Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Level Distribution</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Beginner"
            value={analytics.levelBreakdown.beginner}
            total={analytics.totalUsers}
            color="blue"
          />
          <ProgressBar
            label="Intermediate"
            value={analytics.levelBreakdown.intermediate}
            total={analytics.totalUsers}
            color="green"
          />
          <ProgressBar
            label="Advanced"
            value={analytics.levelBreakdown.advanced}
            total={analytics.totalUsers}
            color="purple"
          />
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Free"
            value={analytics.subscriptionBreakdown.free}
            total={analytics.totalUsers}
            color="blue"
          />
          <ProgressBar
            label="Premium"
            value={analytics.subscriptionBreakdown.premium}
            total={analytics.totalUsers}
            color="green"
          />
          <ProgressBar
            label="Pro"
            value={analytics.subscriptionBreakdown.pro}
            total={analytics.totalUsers}
            color="purple"
          />
        </div>
      </div>

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Daily Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Grammar</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.averageUsage.dailyGrammarUsage}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Lessons</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.averageUsage.weeklyLessonUsage}/week</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Chat</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.averageUsage.dailyChatUsage}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Translation</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.averageUsage.dailyTranslationUsage}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Quizzes Completed</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.engagement.totalQuizzesCompleted.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Materials Accessed</span>
              </div>
              <span className="text-sm text-gray-600">{analytics.engagement.totalMaterialsAccessed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Total Time Spent</span>
              </div>
              <span className="text-sm text-gray-600">{Math.round(analytics.engagement.totalTimeSpent / 60)}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramAnalytics;
