import React, { useEffect, useState } from 'react'
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Label
  } from "recharts";


const GearShift = ({year, round}) => {
    const [data, setData] = useState({});
    const gearColors = {
        1: '#cfe2f3', // Light blue
        2: '#9fc5e8', // Medium-light blue
        3: '#6fa8dc', // Medium blue
        4: '#4d8b31', // Green
        5: '#ff9900', // Orange
        6: '#e06666', // Red
        7: '#f6b26b', // Light orange
        8: '#ff7300'  // Bright orange
      };

    const allGears = [1, 2, 3, 4, 5, 6, 7, 8]; // show all gear levels

    

    useEffect(() => {
        const fetchGearData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/gear-shift/${year}/${round}/VER`)
                if (!response.ok) {
                    throw new Error("Failed to fetch gear data")
                }
                const data = await response.json()
                setData(data)
            } catch (error) {
                throw new Error(err)
            }
        }

        if (year) {
          fetchGearData()
        }
        
    }, [year, round]);

    const telemetryByGear = data.telemetry_data?.reduce((acc, point) => {
        const gear = point.gear;
        if (!acc[gear]) acc[gear] = [];
        acc[gear].push(point);
        return acc;
    }, {}) || {};

    return (
        <div className=" space-y-6">
            {data.driver_name ? <h1 className='text-2xl font-bold'>{data.driver_name}'s Gear Shift Distribution</h1> : <h1>Loading data...</h1>}
           
            <div className="flex flex-wrap gap-4 mb-4">
            {allGears.map(gear => (
                <div key={gear} className="grid grid-cols-2">
                  <div className='flex items-center gap-2'>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gearColors[gear] || '#000' }}></div>
                    <p>Gear {gear}</p>
                  </div>
                  
                  
                </div>
            ))}
            </div>

          {/* Gear Shifts on Track (Scatter Chart) */}
          <div className="w-full h-[450px]">
            <ResponsiveContainer>
              <ScatterChart>
                <XAxis type="number" dataKey="x" name="X" hide />
                <YAxis type="number" dataKey="y" name="Y" hide />
                {Object.entries(telemetryByGear).map(([gear, points]) => (
                  <Scatter
                    key={gear}
                    name={`Gear ${gear}`}
                    data={points}
                    fill={gearColors[gear] || "#000"}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
}

export default GearShift

