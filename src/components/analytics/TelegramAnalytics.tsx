import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, Globe, Share2, Crown } from 'lucide-react';
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

  const talkData = (analytics as any).talkWithMaraki || {};
  const dailyData = (analytics as any).dailyChallenge || {};
  const subBreakdown = (analytics.subscriptionBreakdown as any) || {};
  const referralData = (analytics as any).referrals || {};
  const topReferrersList: Array<any> = referralData.topReferrers || [];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Telegram Bot & Mini App Analytics</h2>
        <p className="text-gray-600">Real-time performance insights for Talk with Maraki (Voice), Daily Challenges, and Notifications</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={analytics.totalUsers ?? 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Daily Notification Users"
          value={dailyData.subscribedNotificationUsers ?? analytics.totalUsers ?? 0}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Talk with Maraki (Voice)"
          value={talkData.totalSessions ?? 0}
          icon={Globe}
          color="purple"
        />
        <StatCard
          title="Daily Challenge Participants"
          value={dailyData.todayAttempts ?? 0}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Talk with Maraki (Voice) Section */}
      <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">🎙️ Talk with Maraki (Voice AI Analytics)</h3>
            <p className="text-xs text-gray-500">Real-time Gemini voice conversation metrics from the Mini App</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Voice Calls</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{(talkData.totalSessions ?? 0).toLocaleString()}</p>
            <p className="text-xs text-indigo-500 mt-1">+{talkData.todaySessions ?? 0} today</p>
          </div>
          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Talk Duration</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{(talkData.totalMinutes ?? 0).toLocaleString()} mins</p>
            <p className="text-xs text-purple-500 mt-1">{talkData.totalSeconds ?? 0} seconds total</p>
          </div>
          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Voice Users</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{(talkData.activeVoiceUsers ?? 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-500 mt-1">Students using Voice AI</p>
          </div>
          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Avg Session Duration</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{talkData.avgSessionDurationSeconds ?? 0} sec</p>
            <p className="text-xs text-amber-500 mt-1">per voice session</p>
          </div>
        </div>
      </div>

      {/* Daily Challenge & Notifications Section */}
      <div className="bg-white rounded-xl border border-emerald-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">🔔 Daily Challenge & Notification Analytics</h3>
            <p className="text-xs text-gray-500">Student engagement with automated daily notifications and challenge quizzes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Users Receiving Daily Notifications</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{(dailyData.subscribedNotificationUsers ?? analytics.totalUsers ?? 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1">100% active Telegram subscribers</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Today's Daily Challenge Solvers</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{(dailyData.todayAttempts ?? 0).toLocaleString()}</p>
            <p className="text-xs text-blue-500 mt-1">Completed today's challenge</p>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Challenge Attempts</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{(dailyData.totalAttempts ?? 0).toLocaleString()}</p>
            <p className="text-xs text-indigo-500 mt-1">All time attempts</p>
          </div>
        </div>
      </div>

      {/* Revenue & Retention Metrics */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">💵 Financial Revenue & User Retention Analytics</h3>
            <p className="text-xs text-gray-500">Subscription revenue (ETB), customer lifetime value (LTV), and cohort retention rates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {((analytics as any).revenue?.totalETB ?? 0).toLocaleString()} ETB
            </p>
            <p className="text-xs text-amber-600 mt-1">{(analytics as any).revenue?.payingUsers ?? 0} paying subscribers</p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Average LTV</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {((analytics as any).revenue?.avgLTV ?? 0).toLocaleString()} ETB
            </p>
            <p className="text-xs text-emerald-600 mt-1">Lifetime value per student</p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">7-Day Retention</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {(analytics as any).retention?.retention7d ?? 100}%
            </p>
            <p className="text-xs text-blue-600 mt-1">Active 7d after sign-up</p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">30-Day Retention</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {(analytics as any).retention?.retention30d ?? 100}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Active 30d after sign-up</p>
          </div>
        </div>
      </div>

      {/* Referral & Viral Growth Analytics Section */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">🎁 Referral & Viral Growth Analytics</h3>
            <p className="text-xs text-gray-500">Track organic student invitations, referral conversion rates, and top referrers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Referred Students</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {(referralData.totalReferredUsers ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-purple-500 mt-1">Joined via referral links</p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Referral Share Rate</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {referralData.referralConversionRate ?? 0}%
            </p>
            <p className="text-xs text-emerald-600 mt-1">of total student base</p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Top Referrer Champion</p>
            <p className="text-2xl font-bold text-amber-900 mt-1 truncate">
              {topReferrersList[0] ? topReferrersList[0].name : 'N/A'}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {topReferrersList[0] ? `${topReferrersList[0].totalReferred} invites` : 'No referrals yet'}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              Top Referrers Leaderboard
            </h4>
            <span className="text-[11px] text-slate-500">Top 10 Inviters</span>
          </div>

          {topReferrersList.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No referral activity recorded yet. Students can share their referral link in Telegram!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topReferrersList.map((ref, idx) => (
                <div key={ref.telegramId} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-slate-200 text-slate-700" :
                      idx === 2 ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-500"
                    )}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-900">{ref.name}</p>
                        {ref.isPremium && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {ref.telegramId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                      {ref.totalReferred} {ref.totalReferred === 1 ? 'Friend' : 'Friends'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Level Breakdown & Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Level Distribution</h3>
          <div className="space-y-4">
            <ProgressBar
              label="Beginner"
              value={analytics.levelBreakdown?.beginner ?? 0}
              total={analytics.totalUsers ?? 0}
              color="blue"
            />
            <ProgressBar
              label="Intermediate"
              value={analytics.levelBreakdown?.intermediate ?? 0}
              total={analytics.totalUsers ?? 0}
              color="green"
            />
            <ProgressBar
              label="Advanced"
              value={analytics.levelBreakdown?.advanced ?? 0}
              total={analytics.totalUsers ?? 0}
              color="purple"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Tier Breakdown</h3>
          <div className="space-y-4">
            <ProgressBar
              label="Free Tier"
              value={subBreakdown.free ?? 0}
              total={analytics.totalUsers ?? 0}
              color="blue"
            />
            <ProgressBar
              label="1 Month Subscription"
              value={subBreakdown.monthly ?? 0}
              total={analytics.totalUsers ?? 0}
              color="green"
            />
            <ProgressBar
              label="3 Months Subscription"
              value={subBreakdown.daily ?? 0}
              total={analytics.totalUsers ?? 0}
              color="purple"
            />
            <ProgressBar
              label="1 Year Subscription"
              value={subBreakdown.yearly ?? 0}
              total={analytics.totalUsers ?? 0}
              color="orange"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramAnalytics;
