# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import feedparser
import requests
import json
import time
from dotenv import load_dotenv
import os
from groq import Groq
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
load_dotenv()
app = Flask(__name__)
CORS(app)  # Allow React Native to access this API

# ============ CONFIGURATION ============
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Initialize Groq client
if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in environment variables. Please check your .env file.")
groq_client = Groq(api_key=GROQ_API_KEY)
geolocator = Nominatim(user_agent="danger_zone_mapper_v2")
#comit
# ======================================================
# STEP 1 — Find the Nearest City from Coordinates
# ======================================================
def get_nearest_city(lat, lon):
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location and "address" in location.raw:
            address = location.raw["address"]
            city = address.get("city") or address.get("town") or address.get("village") or address.get("state")
            return city
    except Exception as e:
        print(f"⚠️ Reverse geocoding error: {e}")
    return "Unknown"

# ======================================================
# STEP 2 — Fetch News for that City
# ======================================================
def fetch_news_from_rss(city):
    search_queries = [
        f"{city} accident",
        f"{city} fire",
        f"{city} flood",
        f"{city} crime",
        f"{city} protest",
        f"{city} emergency",
        f"{city} weather alert",
        f"{city} disaster"
    ]

    all_headlines = []
    for query in search_queries:
        encoded_query = query.replace(' ', '%20')
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        
        try:
            feed = feedparser.parse(rss_url)
            for entry in feed.entries[:5]:
                title = entry.title.split(" - ")[0]
                all_headlines.append({
                    "title": title,
                    "link": entry.link,
                    "published": entry.get("published", ""),
                })
            time.sleep(0.3)
        except Exception as e:
            print(f"⚠️ Error fetching {query}: {e}")

    # Remove duplicates
    seen = set()
    unique = [h for h in all_headlines if not (h["title"].lower() in seen or seen.add(h["title"].lower()))]
    return unique

# ======================================================
# STEP 3 — Analyze News for Danger Zones
# ======================================================
def analyze_danger_zones(headlines, city):
    if not headlines:
        return []

    headlines_text = "\n".join([f"{i+1}. {h['title']}" for i, h in enumerate(headlines)])

    prompt = f"""
You are a safety analyst. Based on the following news headlines from {city}, identify danger or alert locations.

Headlines:
{headlines_text}

Return ONLY valid JSON with this structure:
[
  {{
    "location": "specific area name, {city}",
    "risk_type": "Flood/Fire/Crime/Accident/Protest/Weather",
    "severity": "High/Medium/Low",
    "description": "brief summary",
    "headline_number": [1, 2]
  }}
]
If no threats found, return [].
"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        result = completion.choices[0].message.content.strip()
        if result.startswith("```"):
            result = result.split("```")[-2] if "```" in result else result
            result = result.replace("json", "").strip()

        zones = json.loads(result)

        # Map headlines
        for z in zones:
            related = []
            for num in z.get("headline_number", []):
                if 0 < num <= len(headlines):
                    related.append(headlines[num - 1]["title"])
            z["related_headlines"] = related
            z.pop("headline_number", None)

        return zones

    except Exception as e:
        print(f"⚠️ Error analyzing: {e}")
        return []

# ======================================================
# STEP 4 — Geocode danger zones
# ======================================================
def geocode_danger_zones(zones):
    geocoded = []
    for z in zones:
        try:
            loc = geolocator.geocode(z["location"])
            if loc:
                z["latitude"] = loc.latitude
                z["longitude"] = loc.longitude
                geocoded.append(z)
            time.sleep(1)
        except Exception as e:
            print(f"⚠️ Failed: {z['location']} - {e}")
    return geocoded

# ======================================================
# MAIN API ENDPOINT
# ======================================================
@app.route('/danger-zones', methods=['GET'])
def get_danger_zones():
    """
    Receives user coordinates and returns nearby danger zones
    Query params: ?lat=19.0760&lon=72.8777
    """
    try:
        # Get coordinates from React Native
        user_lat = float(request.args.get('lat'))
        user_lon = float(request.args.get('lon'))

        print(f"📍 Received coordinates: {user_lat}, {user_lon}")

        # Get city name
        city = get_nearest_city(user_lat, user_lon)
        print(f"📍 City: {city}")

        # Fetch news
        headlines = fetch_news_from_rss(city)
        print(f"✅ Found {len(headlines)} headlines")

        if not headlines:
            return jsonify({
                "city": city,
                "danger_zones": [],
                "message": "No news found"
            })

        # Analyze danger zones
        danger_zones = analyze_danger_zones(headlines, city)
        print(f"✅ Identified {len(danger_zones)} danger zones")

        # Geocode zones
        geocoded_zones = geocode_danger_zones(danger_zones)

        # Calculate distance from user for each zone
        for zone in geocoded_zones:
            distance = geodesic((user_lat, user_lon), 
                              (zone["latitude"], zone["longitude"])).km
            zone["distance_km"] = round(distance, 2)
            zone["radius"] = 500  # Default radius in meters for map visualization

        return jsonify({
            "city": city,
            "user_lat": user_lat,
            "user_lon": user_lon,
            "danger_zones": geocoded_zones,
            "total_zones": len(geocoded_zones)
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            "error": str(e),
            "danger_zones": []
        }), 400

# ======================================================
# ALERTS API ENDPOINT
# ======================================================
@app.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Returns safety alerts based on user location
    Query params: ?lat=19.0760&lon=72.8777
    """
    try:
        # Get coordinates from query params
        user_lat = float(request.args.get('lat', 0))
        user_lon = float(request.args.get('lon', 0))
        
        print(f"📍 Fetching alerts for coordinates: {user_lat}, {user_lon}")
        
        # Get city name
        city = get_nearest_city(user_lat, user_lon) if user_lat and user_lon else "Unknown"
        
        # Fetch news headlines
        headlines = fetch_news_from_rss(city) if city != "Unknown" else []
        
        # Analyze and create alerts from headlines
        alerts_list = []
        
        if headlines:
            # Analyze danger zones to get structured data
            danger_zones = analyze_danger_zones(headlines, city)
            
            # Geocode the zones to get coordinates
            geocoded_zones = geocode_danger_zones(danger_zones)
            
            # Convert danger zones to alerts with coordinates
            for idx, zone in enumerate(geocoded_zones):
                alert_type = 'urgent' if zone.get('severity') == 'High' else 'warning' if zone.get('severity') == 'Medium' else 'info'
                
                alerts_list.append({
                    'id': idx + 1,
                    'type': alert_type,
                    'title': f"{zone.get('risk_type', 'Safety Alert')} - {zone.get('severity', 'Medium')} Risk",
                    'location': zone.get('location', city),
                    'latitude': zone.get('latitude'),
                    'longitude': zone.get('longitude'),
                    'time': 'Just now',
                    'message': zone.get('description', 'Stay alert in this area.'),
                    'severity': zone.get('severity', 'Medium'),
                    'risk_type': zone.get('risk_type', 'General'),
                    'dismissed': False
                })
        
        # Add default alerts if no news found
        if not alerts_list:
            alerts_list = [
                {
                    'id': 1,
                    'type': 'info',
                    'title': 'All Clear',
                    'location': city,
                    'time': 'Just now',
                    'message': f'No immediate safety concerns detected in {city}. Stay vigilant and enjoy your visit!',
                    'severity': 'Low',
                    'risk_type': 'General',
                    'dismissed': False
                }
            ]
        
        # Count alerts by type
        alert_counts = {
            'urgent': sum(1 for a in alerts_list if a['type'] == 'urgent'),
            'warning': sum(1 for a in alerts_list if a['type'] == 'warning'),
            'info': sum(1 for a in alerts_list if a['type'] == 'info')
        }
        
        return jsonify({
            'city': city,
            'alerts': alerts_list,
            'alert_counts': alert_counts,
            'total_alerts': len(alerts_list)
        })
        
    except Exception as e:
        print(f"❌ Error fetching alerts: {e}")
        return jsonify({
            'error': str(e),
            'alerts': [],
            'alert_counts': {'urgent': 0, 'warning': 0, 'info': 0}
        }), 400

# ======================================================
# HOME DASHBOARD API ENDPOINT
# ======================================================
@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    """
    Returns home dashboard data: safety score, crowd level, nearby alerts
    Query params: ?lat=19.0760&lon=72.8777
    """
    try:
        user_lat = float(request.args.get('lat', 0))
        user_lon = float(request.args.get('lon', 0))
        
        print(f"📊 Dashboard request for: {user_lat}, {user_lon}")
        
        # Get city name
        city = get_nearest_city(user_lat, user_lon) if user_lat and user_lon else "Unknown"
        
        # Fetch news for safety analysis
        headlines = fetch_news_from_rss(city) if city != "Unknown" else []
        danger_zones = analyze_danger_zones(headlines, city) if headlines else []
        
        # Calculate safety score based on danger zones
        safety_score = 95  # Base score
        urgent_count = sum(1 for z in danger_zones if z.get('severity') == 'High')
        warning_count = sum(1 for z in danger_zones if z.get('severity') == 'Medium')
        
        safety_score -= (urgent_count * 7)  # -7 per high risk
        safety_score -= (warning_count * 3)   # -3 per medium risk
        safety_score = max(20, min(100, safety_score))  # Keep between 20-100
        
        # Determine crowd level based on time and alerts
        import datetime
        hour = datetime.datetime.now().hour
        if 9 <= hour <= 11 or 17 <= hour <= 20:
            crowd_level = "Heavy Crowd"
        elif 12 <= hour <= 16:
            crowd_level = "Moderate Crowd"
        else:
            crowd_level = "Light Crowd"
        
        # Get nearby alerts count
        nearby_alerts = len([z for z in danger_zones if z.get('severity') in ['High', 'Medium']])
        
        return jsonify({
            'city': city,
            'safety_score': safety_score,
            'crowd_level': crowd_level,
            'nearby_alerts': nearby_alerts,
            'danger_zones_count': len(danger_zones),
            'urgent_alerts': urgent_count,
            'warning_alerts': warning_count,
            'last_updated': datetime.datetime.now().strftime('%H:%M')
        })
        
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
        return jsonify({
            'city': 'Unknown',
            'safety_score': 85,
            'crowd_level': 'Moderate Crowd',
            'nearby_alerts': 0,
            'danger_zones_count': 0,
            'urgent_alerts': 0,
            'warning_alerts': 0,
            'last_updated': '00:00'
        }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)