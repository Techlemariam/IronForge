
import React from 'react';

// Mock data for the 7-day forecast
const forecastData = [
  { day: 'TDY', tsb: '+', value: 20, barPercentage: 80 },
  { day: '+1d', tsb: '+', value: 17, barPercentage: 75 },
  { day: '+2d', tsb: '+', value: 22, barPercentage: 85 },
  { day: '+3d', tsb: '+', value: 25, barPercentage: 90 },
  { day: '+4d', tsb: '+', value: 28, barPercentage: 95 },
  { day: '+5d', tsb: '+', value: 30, barPercentage: 100 },
  { day: '+6d', tsb: '+', value: 32, barPercentage: 100 },
];

const PredictivePRWindow: React.FC = () => {
  return (
    <div className="bg-stone-900 border-2 border-stone-700 p-4 rounded-lg shadow-lg">
      <h3 className="font-serif text-sm uppercase tracking-widest text-amber-400 mb-4">
        PREDICTIVE PR WINDOW (7-DAY FORECAST)
      </h3>
      <div className="space-y-2">
        {forecastData.map((item) => (
          <div key={item.day} className="flex items-center justify-between">
            <span className="font-mono text-xs text-stone-400 w-8">{item.day}</span>
            <div className="flex-1 bg-stone-800 rounded-full h-4 mx-2">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${item.barPercentage}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs text-stone-300 w-12 text-right">
              {item.tsb}{item.value} TSB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictivePRWindow;
