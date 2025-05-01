from fastapi import FastAPI, Request, Form, HTTPException, Query
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import matplotlib.pyplot as plt
import pandas as pd

import fastf1
from fastf1.ergast import Ergast
import os

import math

def safe_float(val):
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None  # or use a default like 0
    return val

app = FastAPI()

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
async def get_race_detail(year: int, race_number: int):
    try:
        session = fastf1.get_session(year, race_number, 'R')
        session.load(telemetry=False, weather=False)
        
        # get race detail
        race = fastf1.get_event(year,race_number)
        event_name = race["EventName"]
        
        # Use session.results which is a DataFrame
        race_results = []
        for _, driver in session.results.iterrows():
            race_results.append({
                "fullName": driver["FullName"],
                "driver_number": driver["DriverNumber"],
                "team": driver["TeamName"],
                "position": driver["Position"],
                "gridPosition": driver["GridPosition"],
                "time": str(driver["Time"]) if not pd.isna(driver["Time"]) else None,
                "points": driver["Points"],
                "abbreviation": driver["Abbreviation"],
                "status": driver["Status"]
            })
            
        return {
            "event_name": event_name,
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
async def get_driver_standings(year: int):
    try:
        ergast = Ergast(result_type="raw")
        
        team_standings = ergast.get_constructor_standings(season=year)
        
        return team_standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving race results: {str(e)}")

@app.get("/api/races/tire-strategy/{year}/{round}")
async def get_tyre_strategy(year: int, round: int):
    try:
        # Load the race session
        session = fastf1.get_session(year, round, 'R')
        session.load()
        
        # Create a dictionary to store tire strategies for all drivers
        tire_strategies = {}
        
        # Get all drivers from the session
        drivers = session.drivers
        total_laps = session.laps["LapNumber"].max()
        
        for driver in drivers:
            # Get driver info for display
            driver_info = session.get_driver(driver)
            driver_name = f"{driver_info['FirstName']} {driver_info['LastName']}"
            
            # Get all laps for the driver
            driver_laps = session.laps.pick_driver(driver)
            
            # Group laps by stint number
            stints = []
            stint_numbers = driver_laps['Stint'].unique()
            
            for stint_number in sorted(stint_numbers):
                stint_laps = driver_laps[driver_laps['Stint'] == stint_number]
                
                # Get the first lap of the stint to identify the compound
                if len(stint_laps) > 0:
                    first_lap = stint_laps.iloc[0]
                    compound = first_lap['Compound']
                    lap_start = first_lap['LapNumber']
                    lap_end = stint_laps.iloc[-1]['LapNumber']
                    lap_count = len(stint_laps)
                    
                    stints.append({
                        "stint": int(stint_number),
                        "compound": compound,
                        "lap_start": int(lap_start),
                        "lap_end": int(lap_end),
                        "lap_count": int(lap_count)
                    })
            
            # Add driver strategy to the result
            tire_strategies[driver] = {
                "driver_number": driver,
                "driver_name": driver_name,
                "team": driver_info['TeamName'],
                "stints": stints
            }
        
        return {
            "event": f"{session.event['EventName']} {year}",
            "total_laps": total_laps,
            "strategies": tire_strategies
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tire strategy data: {str(e)}")

@app.get("/api/races/{year}/{round}/{driver}")
def get_driver_speed(year: int, round: int, driver: str):
    try:
        session = fastf1.get_session(year, round, "R")
        session.load(weather=False)
        driver_data = session.laps.pick_drivers(driver).pick_fastest()
        car_data = driver_data.get_car_data()
        
        telemetry = []
        for i in range(len(car_data["Time"])):
            telemetry.append({
                "time": car_data["Time"][i].total_seconds(),  # or use lap_distance if you want
                "speed": car_data["Speed"][i]
            })
        
        return {
            "driverName": session.get_driver(driver)["FullName"],
            "data": telemetry
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/race-positions/{year}/{round}")
def get_race_positions(year: int, round: int):
    try:
        session = fastf1.get_session(year, round, "R")
        session.load(weather=False)

        laps = session.laps
        drivers = session.drivers  # List of driver abbreviations

        race_data = {}

        for drv in drivers:
            drv_laps = laps.pick_driver(drv)
            drv_info = session.get_driver(drv)
            abbrev = drv_info["Abbreviation"]

            positions = []
            for _, lap in drv_laps.iterlaps():
                positions.append({
                    "lap": safe_float(lap["LapNumber"]),
                    "position": safe_float(lap["Position"])
                })
            race_data[abbrev] = positions

        return JSONResponse(content=race_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/gear-shift/{year}/{round}/{driver}")
async def get_gear_shift(year: int, round: int, driver: str):
    try:
        # Enable cache to improve performance
        
        # Get session - using race name instead of round number for better clarity
        session = fastf1.get_session(year, round, 'R')
        session.load(weather=False)
        
        # Get the driver's fastest lap
        driver_laps = session.laps.pick_driver(driver)  # pick_driver not pick_drivers
        
        if driver_laps.empty:
            raise HTTPException(status_code=404, detail=f"No data found for driver {driver}")
            
        fastest_lap = driver_laps.pick_fastest()
        
        # Get telemetry data
        telemetry = fastest_lap.get_telemetry()
        
        # Convert to list format for JSON serialization
        x_list = telemetry['X'].tolist()
        y_list = telemetry['Y'].tolist()
        gear_list = telemetry['nGear'].tolist()
        
        # Normalize track coordinates for visualization
        # Calculate center and scale factor
        x_mean = sum(x_list) / len(x_list)
        y_mean = sum(y_list) / len(y_list)
        
        x_centered = [x - x_mean for x in x_list]
        y_centered = [y - y_mean for y in y_list]
        
        max_dimension = max(max(abs(x) for x in x_centered), max(abs(y) for y in y_centered))
        scale_factor = 100 / max_dimension if max_dimension > 0 else 1
        
        x_normalized = [x * scale_factor for x in x_centered]
        y_normalized = [y * scale_factor for y in y_centered]
        
        # Build data points in the format needed for the chart
        telemetry_data = []
        for i in range(len(x_list)):
            telemetry_data.append({
                "x": x_normalized[i],
                "y": y_normalized[i], 
                "gear": gear_list[i]
            })
            
        # Group data by gear for easier frontend processing
        gear_groups = {}
        for point in telemetry_data:
            gear = point["gear"]
            if gear not in gear_groups:
                gear_groups[gear] = []
            gear_groups[gear].append(point)
        
        return {
            "driver_code": driver,
            "driver_name": session.get_driver(driver)["FullName"],
            "lap_number": fastest_lap["LapNumber"],
            "lap_time": str(fastest_lap["LapTime"]),
            "gear_distribution": {str(gear): len(points) for gear, points in gear_groups.items()},
            "telemetry_data": telemetry_data,
            "gear_groups": gear_groups
        }
        
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/compare-speed")
async def compare_driver_speed(
    year: int = Query(..., description="Season year, e.g., 2024"),
    round: int = Query(..., description="Round number, e.g., 5"),
    driver1: str = Query(..., description="Driver abbreviation, e.g., VER"),
    driver2: str = Query(..., description="Another driver abbreviation, e.g., LEC")
    
):
    
    try:
        
        session = fastf1.get_session(year, round, "R")
        session.load()
        
        driver_lap1 = session.laps.pick_drivers(driver1.upper()).pick_fastest()
        driver_lap2 = session.laps.pick_drivers(driver2.upper()).pick_fastest()
        
        tel_1 = driver_lap1.get_car_data().add_distance()
        tel_2 = driver_lap2.get_car_data().add_distance()
        
        
        telemetry = {
                "driver1": {
                    "name": driver1.upper(),
                    "data": [
                        {"distance": float(d), "speed": float(s)}
                        for d, s in zip(tel_1["Distance"], tel_1["Speed"])
                    ]
                },
                "driver2": {
                    "name": driver2.upper(),
                    "data": [
                        {"distance": float(d), "speed": float(s)}
                        for d, s in zip(tel_2["Distance"], tel_2["Speed"])
                    ]
                }
            }
        return JSONResponse(content=telemetry)
    except Exception as e:
        return JSONResponse(status_code=500, content={f"error: {e}"})

