import os
import requests
from firebase_functions import https_fn
from firebase_admin import initialize_app
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

initialize_app()
app = Flask(__name__)
CORS(app)

FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# We'll use API-Football. Base URL:
FOOTBALL_API_URL = "https://v3.football.api-sports.io"
HEADERS = {
    "x-apisports-key": FOOTBALL_API_KEY
}

# The World Cup 2026 League ID in API-Football. 
# (You might need to query the leagues endpoint to find the exact ID for 2026, 
# typically it's 1 for World Cup, but seasons change).
WORLD_CUP_LEAGUE_ID = "1" 
CURRENT_SEASON = "2022"

@app.route("/schedule", methods=["GET"])
def get_schedule():
    # Returns the upcoming matches
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "matches": []}), 500
        
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        matches = []
        # Free plan doesn't support 'next', so we slice the first 15 fixtures
        for item in data.get("response", [])[:15]:
            matches.append({
                "id": item.get("fixture", {}).get("id"),
                "home": item.get("teams", {}).get("home", {}).get("name"),
                "away": item.get("teams", {}).get("away", {}).get("name"),
                "time": item.get("fixture", {}).get("date"),
                "group": item.get("league", {}).get("group", "Group Stage")
            })
        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/results", methods=["GET"])
def get_results():
    # Returns the past matches
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "matches": []}), 500
        
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        results = []
        # Free plan doesn't support 'last', so we slice the last 15 fixtures
        for item in data.get("response", [])[-15:]:
            results.append({
                "id": item.get("fixture", {}).get("id"),
                "home": item.get("teams", {}).get("home", {}).get("name"),
                "away": item.get("teams", {}).get("away", {}).get("name"),
                "homeScore": item.get("goals", {}).get("home", 0),
                "awayScore": item.get("goals", {}).get("away", 0)
            })
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/highlights", methods=["GET"])
def get_highlights():
    # Uses YouTube API to search for Fox Sports highlights
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "Missing YouTube API Key", "items": []}), 500
    
    query = request.args.get("q", "World Cup 2026 highlights Fox Sports")
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "key": YOUTUBE_API_KEY,
        "maxResults": 5,
        "type": "video"
    }
    
    try:
        res = requests.get(url, params=params)
        data = res.json()
        videos = []
        for item in data.get("items", []):
            if item.get("id", {}).get("videoId"):
                videos.append({
                    "id": item["id"]["videoId"],
                    "title": item.get("snippet", {}).get("title"),
                    "thumbnail": item.get("snippet", {}).get("thumbnails", {}).get("medium", {}).get("url")
                })
        return jsonify({"highlights": videos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/team/<team_id>", methods=["GET"])
def get_team_updates(team_id):
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "updates": []}), 500
        
    # Check if team_id is numeric
    resolved_team_id = team_id
    if not team_id.isdigit():
        # Resolve team name to ID
        teams_url = f"{FOOTBALL_API_URL}/teams"
        
        # Try by name
        try:
            res = requests.get(teams_url, headers=HEADERS, params={"name": team_id})
            teams_data = res.json()
            
            found_id = None
            for item in teams_data.get("response", []):
                t = item.get("team", {})
                if t.get("national"):
                    found_id = t.get("id")
                    break
            
            # If not found national, look for any matching name
            if not found_id and teams_data.get("response"):
                found_id = teams_data.get("response")[0].get("team", {}).get("id")
                
            # If still not found, try search parameter
            if not found_id:
                res = requests.get(teams_url, headers=HEADERS, params={"search": team_id})
                teams_data = res.json()
                for item in teams_data.get("response", []):
                    t = item.get("team", {})
                    if t.get("national"):
                        found_id = t.get("id")
                        break
                if not found_id and teams_data.get("response"):
                    found_id = teams_data.get("response")[0].get("team", {}).get("id")
                    
            if found_id:
                resolved_team_id = str(found_id)
            else:
                return jsonify({"error": f"Team '{team_id}' not found", "updates": []}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to resolve team name: {str(e)}", "updates": []}), 500
            
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON,
        "team": resolved_team_id
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        updates = []
        for item in data.get("response", []):
            fixture_id = item.get("fixture", {}).get("id")
            date_str = item.get("fixture", {}).get("date")
            status_short = item.get("fixture", {}).get("status", {}).get("short")
            
            home_team = item.get("teams", {}).get("home", {})
            away_team = item.get("teams", {}).get("away", {})
            
            is_home = str(home_team.get("id")) == resolved_team_id
            opponent = away_team.get("name") if is_home else home_team.get("name")
            
            goals_home = item.get("goals", {}).get("home")
            goals_away = item.get("goals", {}).get("away")
            
            status_str = "Upcoming"
            if status_short in ["FT", "AET", "PEN"]:
                if goals_home is not None and goals_away is not None:
                    if goals_home == goals_away:
                        status_str = f"Draw {goals_home}-{goals_away}"
                    elif (goals_home > goals_away and is_home) or (goals_away > goals_home and not is_home):
                        status_str = f"Won {goals_home}-{goals_away}" if is_home else f"Won {goals_away}-{goals_home}"
                    else:
                        status_str = f"Lost {goals_home}-{goals_away}" if is_home else f"Lost {goals_away}-{goals_home}"
            elif status_short == "HT":
                status_str = f"Live (HT) {goals_home}-{goals_away}"
            elif status_short in ["1H", "2H", "ET"]:
                status_str = f"Live {goals_home}-{goals_away}"
                
            updates.append({
                "id": fixture_id,
                "opponent": opponent,
                "date": date_str,
                "status": status_str
            })
        return jsonify({"updates": updates})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@https_fn.on_request(max_instances=10)
def api(req: https_fn.Request) -> https_fn.Response:
    import re
    environ = req.environ.copy()
    path = environ.get('PATH_INFO', '')
    # Remove Firebase Emulator function URL path prefix (e.g., /<project-id>/us-central1/api)
    path = re.sub(r'^/[^/]+/us-central1/api', '', path)
    environ['PATH_INFO'] = path or '/'
    
    with app.request_context(environ):
        return app.full_dispatch_request()

