# app.py
import json
import csv
import io
from flask import Flask, request, jsonify, Response
from datetime import datetime
import requests
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# --- (COMPLETE) ANALYSIS FUNCTION ---
# This function remains unchanged as its logic is used by both endpoints.
def analyze_data(weather_data, target_date_str):
    """
    Analyzes historical weather data to calculate overall probabilities, averages,
    and collects data from the last 10 years for trend graphing.
    """
    THRESHOLDS = {"hot": 32.0, "cold": 10.0, "windy": 35.0, "rainy": 1.0}
    counters = {"matching_days": 0, "hot_days": 0, "cold_days": 0, "windy_days": 0, "rainy_days": 0, "any_rain_days": 0}
    daily_temps, daily_humidity, daily_wind_speeds = [], [], []
    yearly_data = {} # To store data for the graph trends
    
    target_date = datetime.strptime(target_date_str, '%Y-%m-%d')
    target_month, target_day = target_date.month, target_date.day

    daily_data = weather_data['daily']
    time_list = daily_data.get('time', [])
    temp_max_list = daily_data.get('temperature_2m_max', [])
    temp_min_list = daily_data.get('temperature_2m_min', [])
    wind_max_list = daily_data.get('wind_speed_10m_max', [])
    precipitation_list = daily_data.get('precipitation_sum', [])
    humidity_list = daily_data.get('relative_humidity_2m_mean', [])

    for i, date_entry in enumerate(time_list):
        historical_date = datetime.strptime(date_entry, '%Y-%m-%d')
        if historical_date.month == target_month and historical_date.day == target_day:
            counters["matching_days"] += 1; avg_day_temp = None
            if temp_max_list[i] is not None and temp_min_list[i] is not None:
                avg_day_temp = (temp_max_list[i] + temp_min_list[i]) / 2; daily_temps.append(avg_day_temp)
            if humidity_list[i] is not None: daily_humidity.append(humidity_list[i])
            if wind_max_list[i] is not None: daily_wind_speeds.append(wind_max_list[i])
            if temp_max_list[i] is not None and temp_max_list[i] > THRESHOLDS["hot"]: counters["hot_days"] += 1
            if temp_min_list[i] is not None and temp_min_list[i] < THRESHOLDS["cold"]: counters["cold_days"] += 1
            if wind_max_list[i] is not None and wind_max_list[i] > THRESHOLDS["windy"]: counters["windy_days"] += 1
            if precipitation_list[i] is not None and precipitation_list[i] >= THRESHOLDS["rainy"]: counters["rainy_days"] += 1
            if precipitation_list[i] is not None and precipitation_list[i] > 0.0: counters["any_rain_days"] += 1
            current_year = historical_date.year
            yearly_data[current_year] = {
                "temperature": round(avg_day_temp, 1) if avg_day_temp is not None else None,
                "humidity": humidity_list[i], "wind_speed": wind_max_list[i],
                "rain_chance_percent": 100 if precipitation_list[i] is not None and precipitation_list[i] > 0.0 else 0
            }
    if counters["matching_days"] == 0: return {"error": "No historical data found for this date."}
    total_matching_days = counters["matching_days"]
    def calculate_average(data_list): return round(sum(data_list) / len(data_list), 1) if data_list else 0
    results = {
        "average_temperature_celsius": calculate_average(daily_temps), "average_humidity_percent": calculate_average(daily_humidity),
        "average_wind_speed_kmh": calculate_average(daily_wind_speeds),
        "chance_of_any_rain_percent": round((counters["any_rain_days"] / total_matching_days) * 100),
        "chance_of_hot_day_percent": round((counters["hot_days"] / total_matching_days) * 100),
        "chance_of_cold_day_percent": round((counters["cold_days"] / total_matching_days) * 100),
        "chance_of_windy_day_percent": round((counters["windy_days"] / total_matching_days) * 100),
        "chance_of_rainy_day_percent": round((counters["rainy_days"] / total_matching_days) * 100),
        "analysis_based_on_years": total_matching_days
    }
    sorted_years = sorted(yearly_data.keys(), reverse=True)[:10]
    results["historical_trends"] = {
        "years": sorted_years, "temperatures": [yearly_data[year]["temperature"] for year in sorted_years],
        "humidities": [yearly_data[year]["humidity"] for year in sorted_years],
        "wind_speeds": [yearly_data[year]["wind_speed"] for year in sorted_years],
        "rain_chances_percent": [yearly_data[year]["rain_chance_percent"] for year in sorted_years]
    }
    return results

# --- HELPER FUNCTIONS ---
"""
def get_nasa_image_url(latitude, longitude, date_str):
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d'); last_year = datetime.now().year - 1
        historical_date = target_date.replace(year=last_year); formatted_date = historical_date.strftime('%Y-%m-%d')
        lon_min, lon_max, lat_min, lat_max = longitude - 0.25, longitude + 0.25, latitude - 0.25, latitude + 0.25
        bbox = f"{lon_min},{lat_min},{lon_max},{lat_max}"; base_url = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/"
        return f"{base_url}{formatted_date}/250m/{bbox}?format=image/jpeg"
    except Exception: return None
"""
def get_historical_weather(location_name):
    try:
        geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location_name}&count=1&language=en&format=json"
        geo_response = requests.get(geocoding_url, timeout=10); geo_response.raise_for_status(); geo_data = geo_response.json()
        if not geo_data.get("results"): return None, None, None, f"Could not find coordinates for '{location_name}'"
        result = geo_data["results"][0]; latitude, longitude = result["latitude"], result["longitude"]
        historical_api_url = "https://archive-api.open-meteo.com/v1/archive"
        end_year = datetime.now().year - 1; start_year = end_year - 20
        daily_params = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"
        params = {"latitude": latitude, "longitude": longitude, "start_date": f"{start_year}-01-01", "end_date": f"{end_year}-12-31", "daily": daily_params, "timezone": "auto"}
        response = requests.get(historical_api_url, params=params, timeout=30); response.raise_for_status()
        return response.json(), latitude, longitude, None
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429: return None, None, None, "API rate limit exceeded."
        return None, None, None, f"HTTP Error: {e}"
    except requests.exceptions.RequestException as e: return None, None, None, f"Network error: {e}"

# --- FLASK ROUTE #1: Get analysis for web display ---
@app.route('/analyze', methods=['POST'])
def analyze_weather():
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON"}), 400
    location, date_str = data.get('location'), data.get('date')
    if not location or not date_str: return jsonify({"error": "Location and date are required"}), 400
    weather_data, lat, lon, error = get_historical_weather(location)
    if error: return jsonify({"error": error}), 503 if "rate limit" in error else 500
    analysis = analyze_data(weather_data, date_str)
    #nasa_url = get_nasa_image_url(lat, lon, date_str)
    return jsonify({"location": location, "requested_date": date_str, "weather_analysis": analysis, "nasa_satellite_view_url": nasa_url})

# --- (NEW) FLASK ROUTE #2: Get analysis as a downloadable CSV file ---
@app.route('/download_csv', methods=['POST'])
def download_csv():
    data = request.get_json()
    if not data: return jsonify({"error": "Invalid JSON"}), 400
    location, date_str = data.get('location'), data.get('date')
    if not location or not date_str: return jsonify({"error": "Location and date are required"}), 400
    
    weather_data, _, _, error = get_historical_weather(location)
    if error: return jsonify({"error": error}), 503 if "rate limit" in error else 500
    
    analysis = analyze_data(weather_data, date_str)
    if 'error' in analysis: return jsonify(analysis), 404

    # Create an in-memory text file
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write the summary data
    writer.writerow(['Analysis Summary for', location, 'on', date_str])
    writer.writerow([]) # Blank row for spacing
    writer.writerow(['Metric', 'Value'])
    for key, value in analysis.items():
        if not isinstance(value, dict): # Exclude the 'historical_trends' dict for now
            writer.writerow([key.replace('_', ' ').title(), value])
    
    # Write the historical trend data
    writer.writerow([]) # Blank row for spacing
    writer.writerow(['Historical Trend Data (Last 10 Years)'])
    trends = analysis['historical_trends']
    writer.writerow(trends.keys()) # Write headers: years, temperatures, etc.
    # Write rows of trend data
    for row in zip(*trends.values()):
        writer.writerow(row)
        
    output.seek(0) # Go back to the beginning of the in-memory file
    
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename=weather_analysis_{location.lower()}.csv"}
    )

if __name__ == '__main__':
    app.run(debug=True)

