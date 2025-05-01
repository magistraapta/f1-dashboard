import { useEffect, useState } from 'react';

const COMPOUND_COLORS = {
  SOFT: '#ea4c4c',
  MEDIUM: '#f6c12b',
  HARD: '#e5e5e5',
  INTERMEDIATE: '#4ce371',
  WET: '#2b65ec',
};


export default function TyreStrategy({ year, round }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/races/tire-strategy/${year}/${round}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching tire strategy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, round]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available.</p>;

  const sortedDrivers = Object.values(data.strategies).sort((a, b) =>
    parseInt(a.driver_number) - parseInt(b.driver_number)
  );

  return (
    <div className="p-6 bg-black text-white rounded-2xl mb-6">
        
      <h2 className="text-3xl font-bold mb-4">{data.event} Tire Strategy</h2>
      <div className="flex gap-4 my-6 text-xs">
        {Object.entries(COMPOUND_COLORS).map(([compound, color]) => (
          <div key={compound} className="flex items-center gap-1">
            <div className="w-4 h-4" style={{ backgroundColor: color }}></div>
            <span>{compound.charAt(0) + compound.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>
      {sortedDrivers.map((driver, i) => {
        const driverLastLap = driver.stints[driver.stints.length - 1]?.lap_end || 0;
        const didNotFinish = driverLastLap < data.total_laps;
        const remainingLaps = data.total_laps - driverLastLap;

        return (
            <div key={i} className="flex items-center gap-x-6 mb-2">
            <div className="w-32 text-sm">{`${driver.driver_name.split(' ')[1].toUpperCase()}`}</div>
            <div className="flex-1 flex h-4 overflow-hidden rounded">
                {driver.stints.map((stint, index) => {
                const width = (stint.lap_count / driverLastLap) * 100;
                return (
                    <div
                    key={index}
                    style={{
                        width: `${width}%`,
                        backgroundColor: COMPOUND_COLORS[stint.compound] || '#ccc',
                    }}
                    title={`${stint.compound} — ${stint.lap_count} laps`}
                    />
                );
                })}

                {/* Gray block if DNF */}
                {didNotFinish && (
                <div
                    style={{
                    width: `${(remainingLaps / data.total_laps) * 100}%`,
                    backgroundColor: '#999',
                    opacity: 0.4,
                    }}
                    title={`DNF — missed ${remainingLaps} laps`}
                />
                )}
            </div>
            </div>
        );
        })}
    </div>
  );
}
