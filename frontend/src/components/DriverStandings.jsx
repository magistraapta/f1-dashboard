import React, {useState, useEffect} from 'react'

const DriverStandings = ({ year }) => {
    const [driverStandings, setDriverStandings] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
            const fetchDriver = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/driver-standings/${year}`)
                    if (!response.ok) {
                        throw new Error("Failed to fetch data");
                    }
                    const data = await response.json()
                    console.log(data[0].DriverStandings)
                    setDriverStandings(Array.isArray(data[0].DriverStandings) ? data[0].DriverStandings.slice(0, 5) : []);
                } catch (error) {
                    setError(error)
                } finally {
                    setLoading(false)
                }
            }
            if (year) {
                fetchDriver()
            }
        }, [year]);

    return (
        <div className="p-4 rounded-xl border border-gray-200 min-w-[600px]">
            <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-semibold'>Driver Standings</h1>
                <p className='text-red-500 underline'>See all</p>
            </div>
            <div>
                {driverStandings.map((item, index) => (
                    <div className='mt-3' key={index}>
                        <DriverStandingsRow 
                            name={item.Driver.familyName}
                            position={item.position}
                            points={item.points} 
                            isFirst={index === 0}  // Mark first item
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const DriverStandingsRow = ({ name, position, points, isFirst }) => {
    return (
        <div className='flex items-center gap-x-4 justify-between'>
            <div className={`flex gap-x-3 ${isFirst ? "text-yellow-500" : "text-black"}`}>
                <p className='text-3xl font-bold'>#{position}</p>
                
                <h3 className='text-3xl font-bold'>{name}</h3>
            </div>
            <p className={`font-bold text-xl ${isFirst ? "text-yellow-500" : "text-black"}`}>
                {points}
            </p>
        </div>
    );
};



export default DriverStandings