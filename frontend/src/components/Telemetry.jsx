import React, { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
  } from "recharts";

const Telemetry = ({year, round}) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${year}/${round}/LEC`)

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await response.json()

                setData(data)
            } catch (error) {
                setError(error)
            }
        }

        const fetchPosition = async () => {
            try {
                
            } catch (error) {
                
            }
        }

        if (year) {
            fetchTelemetry()
        }

    }, [year, round]);


  return (
    <div className='grid grid-cols-2 gap-x-4'>
        <div className="w-full h-[400px] bg-gray-900 p-4 rounded-xl">
            <div>

            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                    dataKey="time"
                    tickFormatter={(v) => `${(v).toFixed(2)}s`}
                    stroke="#ccc"
                />
                <YAxis
                    domain={[65, 325]}
                    tickFormatter={(v) => `${v} kph`}
                    stroke="#ccc"
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#333" }}
                    labelFormatter={(label) => `Time: ${(label).toFixed(2)}s`}
                    formatter={(value) => [`${value} kph`, "Speed"]}
                />
                <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#4f83ff"
                    strokeWidth={2}
                    dot={false}
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        <div>

        </div>
    </div>
  );
}

export default Telemetry