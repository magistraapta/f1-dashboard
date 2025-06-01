import React, {useState, useEffect} from 'react'
import { Link } from 'react-router';
import { useParams } from 'react-router'
import TireStrategy from '../components/TyreStrategy';
import Telemetry from '../components/Telemetry';
import RacePositions from '../components/RacePositions';
import Shimmer from '../components/Shimmer';

const RaceDetail = () => {
    const {year, round} = useParams()
    const [raceDetail, setRaceDetail] = useState([]);
    const [eventName, setEventName] = useState(""); // ← NEW STATE
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState(() => {
        // Get the stored tab from localStorage, default to "results" if none exists
        return localStorage.getItem(`raceTab-${year}-${round}`) || "results";
    });
    const tabs = ["results", "positions", "strategy", "telemetry"];

    // Update localStorage when selectedTab changes
    useEffect(() => {
        localStorage.setItem(`raceTab-${year}-${round}`, selectedTab);
    }, [selectedTab, year, round]);

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

    if (loading) {
        return <Shimmer/>
      }
    
      if (error && !raceData) {
        return (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <h3 className="font-bold">Error loading race data</h3>
            <p>{error}</p>
          </div>
        );
      }
    return (
        <div className='flex justify-center my-6'>
            <div className='w-full'>
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
                            className={`px-4 py-2 rounded-full border border-gray-300 transition ${
                                selectedTab === tab
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="">
                    <tr className='text-center'>
                        <th className="px-4 py-2 text-sm font-semibold ">Position</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Driver</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Team</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Points</th>
                        <th className="px-4 py-2 text-sm font-semibold ">Status</th>
                    </tr>
                </thead>
                <tbody className=" text-black divide-y divide-gray-300">
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