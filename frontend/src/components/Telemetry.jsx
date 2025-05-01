import React, { useState, useEffect } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
  } from "recharts";

import GearShift from './GearShift';
import SpeedTelemetry from './SpeedTelemetry';
import CompareSpeed from './CompareSpeed';

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
    <div className=' grid gap-y-6'>
        <div className='space-x-4 flex'>
            <div className='w-full border border-gray-300 p-4 rounded-xl shadow-md'>
                <GearShift year={year} round={round}/>
            </div>
            <div className="w-full  border  border-gray-300 p-4 rounded-xl shadow-md">
                <SpeedTelemetry year={year} round={round}/>
            </div>
        </div>

        <CompareSpeed year={year} round={round}/>
    </div>
    
  );
}

export default Telemetry