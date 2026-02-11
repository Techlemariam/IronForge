import React from "react";

// Mock data for the 7-day forecast
const forecastData = [
  { day: "TDY", tsb: "+", value: 20, barPercentage: 80 },
  { day: "+1d", tsb: "+", value: 17, barPercentage: 75 },
  { day: "+2d", tsb: "+", value: 22, barPercentage: 85 },
  { day: "+3d", tsb: "+", value: 25, barPercentage: 90 },
  { day: "+4d", tsb: "+", value: 28, barPercentage: 95 },
  { day: "+5d", tsb: "+", value: 30, barPercentage: 100 },
  { day: "+6d", tsb: "+", value: 32, barPercentage: 100 },
];

const PredictivePRWindow: React.FC = () => {
  return (
    <div className="bg-armor border-2 border-clay/30 rounded-lg shadow-2xl relative overflow-hidden group p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
      <div className="relative z-10">
        <h3 className="font-serif text-sm uppercase tracking-widest text-clay mb-4">
          PREDICTIVE PR WINDOW (7-DAY FORECAST)
        </h3>
        <div className="space-y-2">
          {forecastData.map((item) => (
            <div key={item.day} className="flex items-center justify-between">
              <span className="font-mono text-xs text-steel w-8 text-[10px] uppercase">
                {item.day}
              </span>
              <div className="flex-1 bg-void rounded-full h-2 mx-2 border border-steel/20">
                <div
                  className="bg-plasma h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all duration-1000"
                  style={{ width: `${item.barPercentage}%` }}
                ></div>
              </div>
              <span className="font-mono text-xs text-clay w-12 text-right text-[10px]">
                {item.tsb}
                {item.value} TSB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictivePRWindow;
