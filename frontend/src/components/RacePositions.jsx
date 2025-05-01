import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import driverColors from '../utils/driverColor';

const RacePositionChart = ({ year, round }) => {
  const [raceData, setRaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Official F1 team colors for drivers
  
  
  // Fallback colors for any drivers not in the official list
  const fallbackColors = [
    "#1e40af", "#dc2626", "#16a34a", "#9333ea", 
    "#ea580c", "#0891b2", "#4f46e5", "#db2777"
  ];

  useEffect(() => {
    const fetchRaceData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/race-positions/${year}/${round}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setRaceData(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch race data:", err);
        
        // Fallback to sample data if available
        if (typeof window !== 'undefined') {
          // Check if we have the sample data from the provided snippet
          const sampleData = {
            "VER": [
              {"lap":1,"position":1},{"lap":2,"position":1},
              // ... rest of VER data
            ],
            "PER": [
              {"lap":1,"position":4},{"lap":2,"position":2},
              // ... rest of PER data
            ]
          };
          
          if (Object.keys(sampleData).length > 0) {
            setRaceData(sampleData);
            setError("Using sample data for demonstration");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRaceData();
  }, [year, round]);

  // Function to prepare data for chart
  const prepareChartData = () => {
    if (!raceData) return [];
    
    // Find the highest lap number across all drivers
    const maxLap = Object.values(raceData).reduce((max, driverLaps) => {
      const driverMaxLap = Math.max(...driverLaps.map(lap => lap.lap));
      return Math.max(max, driverMaxLap);
    }, 0);
    
    // Get all drivers
    const allDrivers = Object.keys(raceData);
    
    // Prepare data for each lap
    const chartData = [];
    for (let lap = 1; lap <= maxLap; lap++) {
      const lapData = { lap };
      
      // Add position for each driver
      allDrivers.forEach(driver => {
        if (raceData[driver]) {
          const lapInfo = raceData[driver].find(l => l.lap === lap);
          lapData[driver] = lapInfo ? lapInfo.position : null;
        }
      });
      
      chartData.push(lapData);
    }
    
    return chartData;
  };

  // Function to get color for a driver (with fallback)
  const getDriverColor = (driver, index) => {
    if (driverColors[driver]) {
      // For Haas (white), use a light gray stroke with white fill for better visibility
      if (driver === 'HUL' || driver === 'MAG') {
        return "#CCCCCC"; // Light gray instead of white for better visibility
      }
      return driverColors[driver];
    }
    return fallbackColors[index % fallbackColors.length];
  };

  // Handle loading and error states
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading race data...</div>;
  }

  if (error && !raceData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="font-bold">Error loading race data</h3>
        <p>{error}</p>
      </div>
    );
  }

  // If no race data
  if (!raceData) {
    return <div className="text-center p-4">No race data available.</div>;
  }

  const chartData = prepareChartData();
  const maxLap = chartData.length > 0 ? chartData[chartData.length - 1].lap : 0;
  const allDrivers = Object.keys(raceData);
  
  // Find highest position number for y-axis domain
  let maxPosition = 1;
  if (chartData.length > 0) {
    allDrivers.forEach(driver => {
      const positions = chartData
        .filter(lap => lap[driver] !== null && lap[driver] !== undefined)
        .map(lap => lap[driver]);
      
      if (positions.length > 0) {
        const driverMaxPos = Math.max(...positions);
        maxPosition = Math.max(maxPosition, driverMaxPos);
      }
    });
  }
  
  // Add buffer for better visualization
  maxPosition = Math.min(Math.max(maxPosition + 1, 10), 20);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
      
      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-2 text-sm">
          Note: {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {allDrivers.map((driver, index) => (
            <div 
              key={driver}
              className="flex items-center px-2 py-1 rounded-md text-sm"
            >
              <div 
                className="w-3 h-3 mr-1 rounded-full" 
                style={{ backgroundColor: getDriverColor(driver, index) }}
              ></div>
              {driver}
            </div>
          ))}
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="lap" 
              label={{ value: 'Lap', position: 'insideBottomRight', offset: -5 }}
              ticks={[1, ...Array.from({length: Math.floor(maxLap/10)}, (_, i) => (i+1)*10), maxLap]}
            />
            <YAxis 
              domain={[1, maxPosition]} 
              reversed={true}
              label={{ value: 'Position', angle: -90, position: 'insideLeft' }}
              ticks={Array.from({length: maxPosition}, (_, i) => i + 1)}
            />
            <Tooltip 
              formatter={(value, name) => [value !== null ? `P${value}` : 'No data', name]}
              labelFormatter={(label) => `Lap ${label}`}
            />
            <Legend />
            
            {allDrivers.map((driver, index) => (
              <Line 
                key={driver}
                type="stepAfter" 
                dataKey={driver} 
                stroke={getDriverColor(driver, index)} 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6 }}
                name={driver}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-center text-gray-600">
        <div>Showing race position data for all {allDrivers.length} drivers over {maxLap} laps</div>
        <div className="mt-1">Drivers are colored by team according to official F1 team colors</div>
      </div>
    </div>
  );
};

export default RacePositionChart;