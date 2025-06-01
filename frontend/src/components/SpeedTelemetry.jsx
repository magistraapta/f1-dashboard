import React, { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
  } from "recharts";


  const availableDrivers = ["VER", "HAM", "LEC", "NOR", "SAI", "ALO"]; // example drivers


const SpeedTelemetry = ({year, round}) => {
    const [telemetry, setTelemetry] = useState([])
    const [error, setError] = useState(null)
    const [selectedDriver, setSelectedDriver] = useState('VER')

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${year}/${round}/${selectedDriver}`)

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const telemetry = await response.json()
                setTelemetry(telemetry)
            } catch (error) {
                setError(error)
            }
        }

        if (year && selectedDriver) {
            fetchTelemetry()
        }

    }, [year, round, selectedDriver]);

    const handleDriverChange = (event) => {
        setSelectedDriver(event.target.value)
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="driver-select" className="mr-2 font-semibold">Select Driver:</label>
                <select
                    id="driver-select"
                    value={selectedDriver}
                    onChange={handleDriverChange}
                    className="px-3 py-2 border rounded-md bg-white"
                >
                    {availableDrivers.map((driver) => (
                        <option key={driver} value={driver}>
                            {driver}
                        </option>
                    ))}
                </select>
            </div>
            
            {telemetry.driverName ? <h1 className='font-bold text-2xl mb-4'>{telemetry.driverName}'s speed telemetry</h1> : <h1>Loading data...</h1>}
            
            <div style={{height: "400px"}}>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart  data={telemetry.data}
                    margin={{
                        top:20,
                        left: 10
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                    <XAxis
                        dataKey="distance"
                        tickFormatter={(v) => `${(v/1000).toFixed(1)}km`}
                        stroke="#000"
                    />
                    <YAxis
                        domain={[0, 325]}
                        tickFormatter={(v) => `${v} kph`}
                        stroke="#000"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#333" }}
                        labelFormatter={(label) => `Distance: ${(label/1000).toFixed(2)}km`}
                        formatter={(value) => [`${value} kph`, "Speed"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="speed"
                        stroke="#ff0000"
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

