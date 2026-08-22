import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface SurveyResultsChartProps {
  primaryData: ChartData[];
  followUpData: ChartData[];
  totalResponses: number;
}

const COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-500'];

const SurveyResultsChart: React.FC<SurveyResultsChartProps> = ({ primaryData, followUpData, totalResponses }) => {
  if (totalResponses === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
        <div className="text-center">
          <p className="mt-1 text-sm text-gray-500">No survey responses yet.</p>
        </div>
      </div>
    );
  }

  // Calculate max values for bar scaling
  const maxPrimary = Math.max(...primaryData.map(d => d.value), 1);
  const maxFollowUp = Math.max(...followUpData.map(d => d.value), 1);

  return (
    <div className="space-y-8">
      {/* Primary Choice Chart */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
          Q1: What would make you want to use Maraki every day?
        </h3>
        <div className="space-y-4">
          {primaryData.map((item, index) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-500">{item.value} responses ({(item.value / totalResponses * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-4 rounded-full ${COLORS[index % COLORS.length]}`} 
                  style={{ width: `${(item.value / maxPrimary) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow Up Choice Chart */}
      {followUpData.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
            Q2: Follow-up Responses
          </h3>
          <div className="space-y-4">
            {followUpData.map((item, index) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.value} responses ({(item.value / totalResponses * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full ${COLORS[(index + 3) % COLORS.length]}`} 
                    style={{ width: `${(item.value / maxFollowUp) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyResultsChart;
