import React from 'react'

const Shimmer = () => {
    return (
        <div className="w-full min-h-screen p-4">
          <div className="animate-pulse space-y-6">
            {/* Title shimmer */}
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
    
            {/* Dropdown shimmer */}
            <div className="h-10 bg-gray-300 rounded w-40"></div>
    
            {/* Repeated shimmer cards */}
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border border-gray-200 rounded-xl p-4"
              >
                <div>
                  <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
}

export default Shimmer