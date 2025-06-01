# F1 Race Visualization

A powerful Formula 1 race visualization and analysis tool that provides real-time and historical race data visualization through an interactive web interface.

## Features

- **Race Position Tracking**: Visualize driver positions throughout the race with lap-by-lap updates
- **Race Schedule**: View upcoming, current, and past races for any season
- **Driver Standings**: Track driver championship standings
- **Team Standings**: Monitor constructor championship standings
- **Tire Strategy Analysis**: Analyze tire usage and strategy during races
- **Speed Analysis**: Compare driver speeds and performance metrics
- **Gear Shift Analysis**: Detailed gear shift patterns for individual drivers
- **Driver Comparison**: Compare performance metrics between two drivers

## Tech Stack

- **Backend**: FastAPI (Python)
- **Data Source**: FastF1 API
- **Caching**: Redis
- **Data Processing**: Pandas
- **Visualization**: Matplotlib
- **Frontend**: Modern web interface with Tailwind CSS

## Prerequisites

- Python 3.7+
- Redis Server
- FastF1 API access

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd f1-visual
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start Redis server:
```bash
redis-server
```

4. Run the application:
```bash
uvicorn main:app --reload
```

## API Endpoints

- `/api/races/{year}` - Get race schedule for a specific year
- `/api/races/{year}/{race_number}` - Get detailed race information
- `/api/race-positions/{year}/{race_number}` - Get lap-by-lap position data
- `/api/driver-standings/{year}` - Get driver championship standings
- `/api/team-standings/{year}` - Get constructor championship standings
- `/api/races/tire-strategy/{year}/{round}` - Get tire strategy analysis
- `/api/compare-speed` - Compare speed data between two drivers

## Caching

The application uses Redis for caching to improve performance and reduce API calls to the FastF1 service. Cache duration is set to 1 hour by default.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license information here]
