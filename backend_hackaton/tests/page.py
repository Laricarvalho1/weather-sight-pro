# app.py
from flask import Flask, request, jsonify
import requests
from datetime import datetime
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
CORS(app)
# --- ANALYSIS FUNCTION ---
def analyze_data(weather_data, target_date_str):
    """
    Analyzes historical weather data to calculate probabilities and averages.
    """
    # --- 1. DEFINE YOUR THRESHOLDS ---
    THRESHOLDS = {
        "hot": 32.0,  # Celsius
        "cold": 10.0, # Celsius
        "windy": 36.0, # km/h
        "rainy": 1.0   # mm of precipitation for a "rainy day"
    }

    # --- 2. INITIALIZE COUNTERS AND LISTS FOR AVERAGES ---
    counters = {
        "matching_days": 0,
        "hot_days": 0,
        "cold_days": 0,
        "windy_days": 0,
        "rainy_days": 0,
        "any_rain_days": 0 # New counter for any precipitation > 0
    }
    
    # Lists to store values for calculating averages
    daily_temps = []
    daily_humidity = []
    daily_wind_speeds = []
    
    target_date = datetime.strptime(target_date_str, '%Y-%m-%d')
    target_month = target_date.month
    target_day = target_date.day

    # Extract the arrays from the JSON
    daily_data = weather_data['daily']
    time_list = daily_data['time']
    temp_max_list = daily_data['temperature_2m_max']
    temp_min_list = daily_data['temperature_2m_min']
    wind_max_list = daily_data['wind_speed_10m_max']
    precipitation_list = daily_data['precipitation_sum']
    humidity_list = daily_data['relative_humidity_2m_mean'] # New humidity data

    # --- 3. LOOP THROUGH ALL HISTORICAL DATA ---
    for i, date_entry in enumerate(time_list):
        historical_date = datetime.strptime(date_entry, '%Y-%m-%d')
        
        if historical_date.month == target_month and historical_date.day == target_day:
            counters["matching_days"] += 1
            
            # --- 4. CHECK THRESHOLDS AND COLLECT DATA FOR AVERAGES ---
            # For average temp, let's use the average of the min and max for that day
            if temp_max_list[i] is not None and temp_min_list[i] is not None:
                avg_day_temp = (temp_max_list[i] + temp_min_list[i]) / 2
                daily_temps.append(avg_day_temp)

            if humidity_list[i] is not None:
                daily_humidity.append(humidity_list[i])
            
            if wind_max_list[i] is not None:
                daily_wind_speeds.append(wind_max_list[i])

            # Check for hot/cold/windy conditions
            if temp_max_list[i] is not None and temp_max_list[i] > THRESHOLDS["hot"]:
                counters["hot_days"] += 1
            if temp_min_list[i] is not None and temp_min_list[i] < THRESHOLDS["cold"]:
                counters["cold_days"] += 1
            if wind_max_list[i] is not None and wind_max_list[i] > THRESHOLDS["windy"]:
                counters["windy_days"] += 1
                
            # Check for "rainy day" (>= 1.0mm)
            if precipitation_list[i] is not None and precipitation_list[i] >= THRESHOLDS["rainy"]:
                counters["rainy_days"] += 1
            
            # Check for "any rain" (> 0.0mm)
            if precipitation_list[i] is not None and precipitation_list[i] > 0.0:
                counters["any_rain_days"] += 1

    # --- 5. CALCULATE FINAL PROBABILITIES AND AVERAGES ---
    total_matching_days = counters["matching_days"]
    if total_matching_days == 0:
        return {"error": "No historical data found for this date."}

    # Helper to calculate average safely
    def calculate_average(data_list):
        return round(sum(data_list) / len(data_list), 1) if data_list else 0

    results = {
        # New average values
        "average_temperature_celsius": calculate_average(daily_temps),
        "average_humidity_percent": calculate_average(daily_humidity),
        "average_wind_speed_kmh": calculate_average(daily_wind_speeds),
        "chance_of_any_rain_percent": round((counters["any_rain_days"] / total_matching_days) * 100),
        
        # Original probability values
        "chance_of_hot_day_percent": round((counters["hot_days"] / total_matching_days) * 100),
        "chance_of_cold_day_percent": round((counters["cold_days"] / total_matching_days) * 100),
        "chance_of_windy_day_percent": round((counters["windy_days"] / total_matching_days) * 100),
        "chance_of_rainy_day_percent": round((counters["rainy_days"] / total_matching_days) * 100),
        "chance_of_unconfortable_day_percent": round(((counters["hot_days"] + counters["cold_days"] + counters["windy_days"] + counters["rainy_days"]) / total_matching_days) * 100),
        "analysis_based_on_years": total_matching_days
    }
    
    return results

# --- Helper functions ---
def get_nasa_image_url(latitude, longitude, date_str):
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d')
        formatted_date = target_date.strftime('%Y-%m-%d')
        base_url = "https://wvs.earthdata.nasa.gov/"
        params = {"v": f"{longitude},{latitude},11", "l": "MODIS_Terra_CorrectedReflectance_TrueColor", "t": formatted_date}
        req = requests.Request('GET', base_url, params=params)
        prepared_req = req.prepare()
        return prepared_req.url
    except Exception as e:
        print(f"Error generating NASA image URL: {e}")
        return None

def get_historical_weather(location_name, date_str):
    try:
        geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        geo_params = {"name": location_name, "count": 1, "language": "en", "format": "json"}
        geo_response = requests.get(geocoding_url, params=geo_params, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        if not geo_data.get("results"): return None, None, f"Could not find coordinates for '{location_name}'"
        result = geo_data["results"][0]
        latitude, longitude = result["latitude"], result["longitude"]
        historical_api_url = "https://archive-api.open-meteo.com/v1/archive"
        end_year = datetime.now().year - 1
        start_year = end_year - 20
        
        # --- ADDED relative_humidity_2m_mean TO THE API CALL ---
        daily_params = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"
        
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": f"{start_year}-01-01",
            "end_date": f"{end_year}-12-31",
            "daily": daily_params,
            "timezone": "auto"
        }
        response = requests.get(historical_api_url, params=params, timeout=30)
        response.raise_for_status()
        return response.json(), latitude, longitude, None
    except requests.exceptions.RequestException as e:
        return None, None, None, str(e)


@app.route('/analyze', methods=['POST'])
def analyze_weather():
    data = request.get_json()
    location = data.get('location')
    date_str = data.get('date')

    if not location or not date_str:
        return jsonify({"error": "Location and date are required"}), 400

    weather_data, lat, lon, error_message = get_historical_weather(location, date_str)
    if error_message: return jsonify({"error": error_message}), 500
    
    nasa_image_url = get_nasa_image_url(lat, lon, date_str)
    probabilities = analyze_data(weather_data, date_str)

    final_response = {
        "location": location,
        "requested_date": date_str,
        "weather_analysis": probabilities, # Renamed for clarity
        "nasa_satellite_view_url": nasa_image_url
    }
    
    return jsonify(final_response)

if __name__ == '__main__':
    app.run(debug=True)