import React, { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
  } from "recharts";

const SpeedTelemetry = ({year, round}) => {
    const [telemetry, setTelemetry] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${year}/${round}/VER`)

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }


                const telemetry = await response.json()

                setTelemetry(telemetry)
            } catch (error) {
                setError(error)
            }
        }

        if (year) {
            fetchTelemetry()
        }

    }, [year, round]);

  return (
    <div>
        <h1 className='font-bold text-2xl mb-4'>{telemetry.driverName}'s speed telemetry</h1>
        <div style={{height: "400px"}}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart  data={telemetry.data}
                margin={{
                    top:20,
                    left: 10
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                    dataKey="time"
                    tickFormatter={(v) => `${(v).toFixed(2)}s`}
                    stroke="#ccc"
                />
                <YAxis
                    domain={[0, 325]}
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
    </div>
    
  )
}

export default SpeedTelemetry

