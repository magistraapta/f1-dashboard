import React, { useState, useEffect } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
  } from "recharts";

import GearShift from './GearShift';
import SpeedTelemetry from './SpeedTelemetry';

const Telemetry = ({year, round}) => {
    const [data, setData] = useState([])
     const [error, setError] = useState(null)

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

        if (year) {
            fetchTelemetry()
        }

    }, [year, round]);

    const driver = ["HAM", "VER", "LEC"]

  return (
    <div className='space-x-4 flex'>
        <div className='w-full bg-gray-100 border border-gray-300 p-4 rounded-xl '>
            <GearShift year={year} round={round}/>
        </div>
        <div className="w-full bg-gray-100 border  border-gray-300 p-4 rounded-xl">
            <SpeedTelemetry year={year} round={round}/>
        </div>
    </div>
  );
}

export default Telemetry