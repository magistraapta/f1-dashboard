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

                if (Array.isArray(data.races)) {
                    const currentDate = new Date();
                    const sortedRaces = data.races.sort((a, b) => new Date(a.date) - new Date(b.date));
                    
                    const ongoingRace = sortedRaces.find(race => new Date(race.date) >= currentDate);
                    const finishedRaces = sortedRaces.filter(race => new Date(race.date) < currentDate);
                    const lastFinishedRace = finishedRaces[finishedRaces.length - 1];

                    const racesToShow = [];
                    if (lastFinishedRace) racesToShow.push(lastFinishedRace);
                    if (ongoingRace) racesToShow.push(ongoingRace);

                    setRaces(racesToShow);
                } else {
                    setRaces([]);
                }
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
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-lg min-w-[1220px] mt-4">
            <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-semibold'>Upcoming Races</h1>
                <p className='text-red-500 underline'>
                    <Link to={"/races"}>See all</Link>
                </p>
            </div>
            <div>
                {races.map((item) => (
                    <div className='mt-3' key={item.round}>
                        <Link to={`/races/${year}/${item.round}`}>
                            <RacesRow 
                                event_name={item.event_name} 
                                location={item.location}
                                date={item.date}
                                race_status={item.race_status}
                            />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RacesRow = ({ event_name, location, date, race_status}) => {

    const raceStatus = ["Finished", "Upcoming", "Race Day",]

    const getStatusBgColor = (status) => {
        switch (status) {
            case "Finished":
                return "bg-green-600";
            case "Race Day":
                return "bg-purple-600";
            case "Upcoming":
                return "bg-yellow-500";
            default:
                return "bg-gray-400";
        }
    };

    const bgColor = getStatusBgColor(race_status);

    return (
        <div className='flex items-center gap-x-4 border  border-gray-300 hover:shadow-lg rounded-xl p-4 pb-3'>
            {/* Event Name */}
            
            {/* Event Details */}
            <div className='flex justify-between w-full items-center'>
                {/* Location & Date */}
                <div>
                    <h1 className='text-2xl font-bold'>{event_name}</h1>
                    <div className='text-center mt-3 w-[100px]'>
                        <p className={` rounded-md text-white ${bgColor}`}>
                                {race_status}
                        </p>
                    </div>
                </div>

                <div>
                    <p className='text-xl font-semibold'>{location}</p>
                    <p>{date}</p>
                </div>
            </div>
        </div>
    );
};

export default Races