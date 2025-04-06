import React, { useState, useEffect } from 'react'
import { Link } from 'react-router';

const Races = ({year}) => {
    const [races, setRaces] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchRaces = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${year}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json()

                setRaces(Array.isArray(data.races) ? data.races.slice(0, 5) : []);
            } catch (error) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        if (year) {
            fetchRaces()
        }
    }, [year]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className="p-4 rounded-xl border border-gray-200 min-w-[1220px] mt-4">
            <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-semibold'>Races Result Season {year}</h1>
                <p className='text-red-500 underline'>
                    <Link to={"/races"}>See all</Link>
                </p>
            </div>
            <div>
                {races.map((item) => (
                    <div className='mt-3' key={item.round}>
                        <RacesRow 
                            event_name={item.event_name} 
                            location={item.location}
                            date={item.date}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const RacesRow = ({ event_name, location, date}) => {
    return (
        <div className='flex items-center gap-x-4 border  border-gray-300 hover:shadow-lg rounded-xl p-4 pb-3'>
            {/* Event Name */}
            
            {/* Event Details */}
            <div className='flex justify-between w-full items-center'>
                {/* Location & Date */}

                <h1 className='text-2xl font-bold'>{event_name}</h1>

                <div>
                    <p className='text-xl font-semibold'>{location}</p>
                    <p>{date}</p>
                </div>
            </div>
        </div>
    );
};

export default Races