from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

import matplotlib.pyplot as plt
import pandas as pd

import fastf1
from fastf1.ergast import Ergast
import os


app = FastAPI()
templates = Jinja2Templates(directory="views")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("views", exist_ok=True)

@app.on_event("startup")
async def startup_cache():
    fastf1.Cache.enable_cache("cache")


@app.get("/api/race-positons/{year}/{race_number}")
async def race_positions(year: int, race_number: int, lap_interval: int = 1):
    
    session = fastf1.get_session(year, race_number, 'R')
    session.load(telemetry=False, weather=False)
    
    total_laps = session.laps["LapNumber"].max()
    
    position_data = []
    
    target_laps = range(1, total_laps + 1, lap_interval)
    
    for lap_number in target_laps:
        
        lap_data = session.laps.pick_lap(lap_number)
        
        if lap_data.empty:
            continue
        
        lap_positions = []
        
        for _, lap in lap_data.iterrows():
            driver = session.get_driver(lap['DriverNumber'])
            
            if driver is None:
                continue
            
            lap_positions.append({
                "lap": lap_number,
                "position": lap['Positon'] if not pd.isna(lap['Positon']) else None,
                "driverNumber": driver["DriverNumber"],
                "driverCode": driver["Abbreviation"],
                "teamName": driver["TeamName"],
                "lapTime": lap['LapTime'].total_seconds() if lap['LapTime'] is not pd.NaT else None,
            })
            
        lap_positions.sort(key=lambda x: x["position"] if x["position"] is not None else float('inf'))
        position_data.append({
            "lap": lap_number,
            "positions": lap_positions
        })
    
    race_info = {
        "year": year,
        "raceName": session.event['EventName'],
        "raceDate": session.event['EventDate'].strftime('%Y-%m-%d'),
        "circuit": session.event['CircuitName'],
        "totalLaps": total_laps
    }
    
    # Final data structure
    result = {
        "raceInfo": race_info,
        "positionData": position_data
    }
    
    return result

# show list of race in season
@app.get("/api/races/{year}")
def get_races(year: int):
    """
    Fetch race based on year

    Args:
        year (int): year of the race

    Raises:
        HTTPException: return error

    Returns:
        races: list of race in JSON
    """
    try:
        schedule = fastf1.get_event_schedule(year)
        races = []
        
        for index, event in schedule.iterrows():
            races.append({
                "round": event['RoundNumber'],
                "name": event['EventName'],
                "date": event['EventDate'].strftime('%Y-%m-%d'),
                "country": event['Country'],
                "location": event['Location'],
                "event_name": event['EventName']
            })
        return {"races": races}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving race schedule: {str(e)}")

# show race result
@app.get("/api/races/{year}/{race_number}")
async def get_race_results(year: int, race_number: int):
    try:
        session = fastf1.get_session(year, race_number, 'R')
        session.load(telemetry=False, weather=False)
        
        # Use session.results which is a DataFrame
        race_results = []
        for _, driver in session.results.iterrows():
            race_results.append({
                "fullName": driver["FullName"],
                "team": driver["TeamName"],
                "position": driver["Position"],
                "gridPosition": driver["GridPosition"],
                "time": str(driver["Time"]) if not pd.isna(driver["Time"]) else None,
                "points": driver["Points"]
            })
            
        return {
            "race_results": race_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving race results: {str(e)}")
    
@app.get("/api/driver-standings/{year}")
def get_driver_standings(year: int):
    try:
        ergast = Ergast(result_type="raw")
        
        driver_standings = ergast.get_driver_standings(season=year)
        
        return driver_standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving race results: {str(e)}")
    
@app.get("/api/team-standings/{year}")
def get_driver_standings(year: int):
    try:
        ergast = Ergast(result_type="raw")
        
        team_standings = ergast.get_constructor_standings(season=year)
        
        return team_standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving race results: {str(e)}")
        




