import React, {useState, useEffect} from 'react'
import { Link } from 'react-router';

const RaceList = () => {
    const years = Array.from({ length: 6 }, (_, i) => 2020 + i);
    const [selectedYear, setSelectedYear] = useState(years[4]);
    const [races, setRaces] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        const fetchRaces = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${selectedYear}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json()

                setRaces(data.races);
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        if (selectedYear) {
            fetchRaces()
        }
        
    }, [selectedYear]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
  return (
    <div className='w-full flex justify-center'>
        <div className="p-4 rounded-xl border border-gray-200 w-10/12 mt-4">
        <p className='underline text-red-500'>
            <Link to={"/"}>
                Back 
            </Link>
        </p>
            <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-semibold'>Races & Result Season 2024</h1>
                <select 
                    className="mb-4 p-2 border border-gray-600 rounded-lg"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            


            <div>
                {races.map((item) => (
                    <div className='mt-3' key={item.round}>
                        <Link to={`/races/${selectedYear}/${item.round}`}>
                            <RacesRow 
                                event_name={item.event_name} 
                                location={item.location}
                                date={item.date}
                            />
                        </Link>
                        
                    </div>
                ))}
            </div>
        </div>
    </div>
    
  )
}

const RacesRow = ({ event_name, location, date}) => {
    


    return (
        <div className='flex items-center gap-x-4 border  border-gray-300 hover:shadow-lg rounded-xl p-4 pb-3'>
            {/* Event Name */}
            
            {/* Event Details */}
            <div className='flex justify-between w-full items-center'>
                {/* Location & Date */}

                <h1 className='text-2xl font-bold'>{event_name}</h1>

                <div className='text-right'>
                    <p className='text-xl font-semibold'>{location}</p>
                    <p>{date}</p>
                </div>
            </div>
        </div>
    );
};

export default RaceList