import React, { useEffect, useState } from 'react'

const TeamStandings = ({ year }) => {
    const [teamsStandings, setTeamStandings] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchRaces = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/team-standings/${year}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json()
                setTeamStandings(Array.isArray(data[0].ConstructorStandings) ? data[0].ConstructorStandings.slice(0, 5) : []);
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

    if (loading) return <p>Fetching Data...</p>;
    if (error) return <p>Error: {error}</p>;
  return (
    <div className="p-4 rounded-xl border border-gray-300 hover:shadow-lg min-w-[600px]">
        <div className='flex justify-between items-center'>
            <h1 className='text-4xl font-semibold'>Team Standings</h1>
            <p className='text-red-500 underline'>See all</p>
        </div>
        {teamsStandings.length > 0 ? (
            <div>
            {teamsStandings.map((item) => (
                <div className='mt-3' key={item.position}>
                    <TeamStandingsRow
                    position={item.position}
                    team={item.Constructor.name}
                    points={item.points}
                    isFirst={item.position == "1"}/>
                </div>
            ))}
        </div>
        ): (
            <p>No team standings data available</p>
        )}

        
        
    </div>
  )
}

const TeamStandingsRow = ({ position, team, points, isFirst}) => {
    return (
        <div className='flex items-center gap-x-4'>
            {/* Round Number */}
            <h1 className='text-3xl font-bold'>#{position}</h1>
            
            {/* Circuit & Winner Info Container */}
            <div className='flex justify-between w-full'>
                {/* Circuit & Country */}
                    <p className={`font-bold text-3xl ${isFirst ? "text-yellow-500" : "text-black"}`}>{team}</p>

                {/* Winner & Time */}
                <div className='text-right'>
                    <h3 className={`font-bold text-xl ${isFirst ? "text-yellow-500" : "text-black"}`}>{points}</h3>
                </div>
            </div>
        </div>
    );
};


export default TeamStandings