import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import SurveyBroadcastModal from '../components/modals/SurveyBroadcastModal';
import SurveyResultsChart from '../components/analytics/SurveyResultsChart';
import { surveyApi } from '../services/api';

const Surveys: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [surveyData, setSurveyData] = useState({
    totalResponses: 0,
    primaryChartData: [],
    followUpChartData: []
  });

  const fetchSurveyResults = async () => {
    setIsLoading(true);
    try {
      const data = await surveyApi.getResults();
      setSurveyData(data);
    } catch (error) {
      console.error('Error fetching survey data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyResults();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">User Surveys & Feedback</h1>
          <p className="mt-2 text-sm text-gray-700">
            Send targeted Telegram surveys to your users and view the real-time aggregated results here.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3 flex">
          <button
            onClick={fetchSurveyResults}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Voice Survey
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-gray-900/5">
          <dt className="truncate text-sm font-medium text-gray-500">Total Survey Responses</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {surveyData.totalResponses}
          </dd>
        </div>
      </div>

      {/* Charts */}
      {!isLoading && (
        <SurveyResultsChart 
          primaryData={surveyData.primaryChartData} 
          followUpData={surveyData.followUpChartData}
          totalResponses={surveyData.totalResponses}
        />
      )}

      {/* Modal */}
      <SurveyBroadcastModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSurveyResults}
      />
    </div>
  );
};

export default Surveys;
