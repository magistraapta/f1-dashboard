import React, {useState} from 'react'
import TeamStandings from './components/TeamStandings';
import DriverStandings from './components/DriverStandings';
import Races from './components/Races';
import './App.css';

const App = () => {
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);
  const [selectedYear, setSelectedYear] = useState(years[5]); // Default to first year

  return (
    <div className='flex flex-col items-center h-full mb-4 relative'>
      <div className='animated-line'></div>
      <div className='flex pb-4 w-11/12 justify-between'>
        <div className='text-left'>
          <h1 className='text-5xl font-bold mb-4'>Dashboard</h1>
          <p className='text-gray-400'>2025 Season Overview</p>
        </div>
        
        <div className='flex items-center mb-4'>
          {/* <p className='p-2'>Select season: </p> */}
          <select 
              className="p-2 border  border-gray-400 rounded-md"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
              {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
              ))}
          </select>
        </div>
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