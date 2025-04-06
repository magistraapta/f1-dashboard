import React, {useState} from 'react'
import TeamStandings from './components/TeamStandings';
import DriverStandings from './components/DriverStandings';
import Races from './components/Races';

const App = () => {
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);
  const [selectedYear, setSelectedYear] = useState(years[4]); // Default to first year

  return (
    <div className='mt-4 flex flex-col items-center h-full mb-4'>
      <h1 className='text-5xl font-bold mb-4'>Formula 1 Dashboard</h1>
      <div className='flex items-center'>
        <p className='p-2'>Select season: </p>
        <select 
            className="mb-4 p-2 border border-gray-200 rounded-lg"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
            {years.map((year) => (
                <option key={year} value={year}>{year}</option>
            ))}
        </select>
      </div>
      

      <div className='grid grid-cols-2 gap-4 justify-center'>
        <TeamStandings year={selectedYear}/>
        <DriverStandings year={selectedYear}/>
        
      </div>

      <Races year={selectedYear}/>
    </div>
  );
};





export default App