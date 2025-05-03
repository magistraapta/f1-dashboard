import React, { useEffect, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from "recharts";

  const availableDrivers = ["VER", "HAM", "LEC", "NOR", "SAI", "ALO"]; // example drivers

const CompareSpeed = ({year, round}) => {

    const [driver1, setDriver1] = useState("HAM");
    const [driver2, setDriver2] = useState("LEC");
    const [telemetry, setTelemetry] = useState({ driver1: [], driver2: [] });

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/compare-speed?year=${year}&round=${round}&driver1=${driver1}&driver2=${driver2}`
        );
        const json = await res.json();
        setTelemetry(json); // expects: { driver1: [...], driver2: [...] }
      } catch (err) {
        console.error("Failed to fetch telemetry data", err);
      }
    };

    fetchTelemetry();
  }, [year, round, driver1, driver2]);

  return (
    <div className="w-full border border-gray-300 p-4 shadow-md rounded-xl">
      <h1 className="font-bold text-2xl mb-4">Compare Driver Speed Telemetry</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <label>Driver 1: </label>
          <select
            className="border rounded px-2 py-1"
            value={driver1}
            onChange={(e) => setDriver1(e.target.value)}
          >
            {availableDrivers.map((drv) => (
              <option key={drv} value={drv}>
                {drv}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Driver 2: </label>
          <select
            className="border rounded px-2 py-1"
            value={driver2}
            onChange={(e) => setDriver2(e.target.value)}
          >
            {availableDrivers.map((drv) => (
              <option key={drv} value={drv}>
                {drv}
              </option>
            ))}
          </select>
        </div>
      </div>

      {telemetry ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{
                    top:20,
                    left: 10
                }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
            dataKey="distance"
            type="number"
            tickFormatter={(v) => `${v.toFixed(0)}m`}
            domain={
                telemetry.driver1?.data && telemetry.driver2?.data
                ? [
                    0,
                    Math.max(
                        ...telemetry.driver1.data.map((d) => d.distance),
                        ...telemetry.driver2.data.map((d) => d.distance)
                    ),
                    ]
                : [0, 100] // fallback domain before data loads
            }
            />
            <YAxis
              domain={[0, 350]}
              tickFormatter={(v) => `${v} kph`}
            />
            <Tooltip
              formatter={(value) => [`${value} kph`, "Speed"]}
              labelFormatter={(label) => `Distance: ${label.toFixed(1)}m`}
            />
            <Line
              data={telemetry.driver1.data}
              type="monotone"
              dataKey="speed"
              stroke="#4f83ff"
              dot={false}
              name={telemetry.driver1.name}
              strokeWidth={4}
            />
            <Line
              data={telemetry.driver2.data}
              type="monotone"
              dataKey="speed"
              stroke="#f87171"
              dot={false}
              name={telemetry.driver2.name}
              strokeWidth={4}
            />
            <Legend/>
          </LineChart >
        </ResponsiveContainer>
      ) : (
        <p>Loading telemetry data...</p>
      )}
    </div>
  );
}

export default CompareSpeed