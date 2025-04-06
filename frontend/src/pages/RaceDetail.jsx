import React, {useState, useEffect} from 'react'
import { Link } from 'react-router';
import { useParams } from 'react-router'
import TireStrategy from '../components/TyreStrategy';
import Telemetry from '../components/Telemetry';
import RacePositions from '../components/RacePositions';

const RaceDetail = () => {
    const {year, round} = useParams()
    const [raceDetail, setRaceDetail] = useState([]);
    const [eventName, setEventName] = useState(""); // ← NEW STATE
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState("results");
    const tabs = ["results", "positions", "strategy", "telemetry"];

    useEffect(() => {
        const fetchRaceDetail = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/races/${year}/${round}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
    
                const data = await response.json();
                setRaceDetail(data.race_results);
                setEventName(data.event_name)
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchRaceDetail();
    }, [year, round]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className='w-full flex justify-center mt-6'>
            <div className='w-11/12'>
                <div className='flex gap-x-6 items-center mb-6'>
                    <p className=' underline text-red-500'>
                        <Link to={"/races"}>
                            Back
                        </Link>
                    </p>
                    <div>
                        <h1 className='text-3xl font-bold mb-2'>{eventName}</h1>
                        <p className='text-lg text-gray-500'>{year} Season</p>
                    </div>
                    
                    
                </div>
                <div>
                    <div>
                        <div className="flex space-x-2 mb-4">
                        {tabs.map((tab) => (
                            <button
                            key={tab}
                            className={`px-4 py-2 rounded-full border transition ${
                                selectedTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            onClick={() => setSelectedTab(tab)}
                            >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                        </div>
                    </div>
                    {/* Tab selection */}
                    {selectedTab === "results" && <RaceResultTable results={raceDetail} />}
                    {selectedTab === "positions" && <RacePositions year={year} round={round}/>}
                    {selectedTab === "strategy" && <TireStrategy year={year} round={round}/> }
                    {selectedTab === "telemetry" && <Telemetry year={year} round={round}/>}
                </div>
            </div>
        </div>
    );
}

const RaceResultTable = ({ results }) => {

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-950">
                    <tr className='text-center text-gray-200'>
                        <th className="px-4 py-2 text-sm font-semibold ">Position</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Driver</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Team</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Points</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 text-gray-300 divide-y divide-gray-700">
                    {results.map((result, index) => (
                        <tr key={index} className='text-center'>
                            <td className="px-4 py-2">{result.position}</td>
                            <td className="px-4 py-2">{result.fullName}</td>
                            <td className="px-4 py-2">{result.team}</td>
                            <td className="px-4 py-2">{result.points}</td>
                            <td className="px-4 py-2">{result.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RaceDetail