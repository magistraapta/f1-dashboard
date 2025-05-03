import React from 'react'

import GearShift from './GearShift';
import SpeedTelemetry from './SpeedTelemetry';
import CompareSpeed from './CompareSpeed';

const Telemetry = ({year, round}) => {

  return (
    <div className=' grid gap-y-6'>
        <div className='space-x-4 flex'>
            <div className='w-full border border-gray-300 p-4 rounded-xl shadow-md'>
                <GearShift year={year} round={round}/>
            </div>
            <div className="w-full  border  border-gray-300 p-4 rounded-xl shadow-md">
                <SpeedTelemetry year={year} round={round}/>
            </div>
        </div>

        <CompareSpeed year={year} round={round}/>
    </div>
    
  );
}

export default Telemetry