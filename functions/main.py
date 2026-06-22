import os
import requests
import re
from datetime import datetime, timedelta
from firebase_functions import https_fn
from firebase_admin import initialize_app
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from cachetools import TTLCache

load_dotenv()

initialize_app()
app = Flask(__name__)

# Restrict CORS to production domain, allow all in development
if os.getenv("FLASK_ENV") == "development" or os.getenv("FUNCTIONS_EMULATOR") == "true":
    CORS(app)
else:
    CORS(app, origins=["https://worldcup26-ioextended.web.app"])

FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# We'll use API-Football. Base URL:
FOOTBALL_API_URL = "https://v3.football.api-sports.io"
HEADERS = {
    "x-apisports-key": FOOTBALL_API_KEY
}

# The World Cup 2026 League ID in API-Football. 
WORLD_CUP_LEAGUE_ID = "1" 
CURRENT_SEASON = os.getenv("CURRENT_SEASON", "2022")

FINISHED_STATUSES = ["FT", "AET", "PEN"]

# In-memory TTL caches
schedule_cache = TTLCache(maxsize=1, ttl=60)      # 1 minute cache for schedule
results_cache = TTLCache(maxsize=1, ttl=300)      # 5 minutes cache for results
standings_cache = TTLCache(maxsize=1, ttl=300)    # 5 minutes cache for standings
highlights_cache = TTLCache(maxsize=50, ttl=600)  # 10 minutes cache for highlights query
team_cache = TTLCache(maxsize=100, ttl=120)       # 2 minutes cache for team specific updates


@app.route("/schedule", methods=["GET"])
def get_schedule():
    """Returns today's unplayed matches."""
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "matches": []}), 500
        
    cache_key = "schedule"
    if cache_key in schedule_cache:
        return jsonify(schedule_cache[cache_key])

    today = datetime.utcnow().strftime("%Y-%m-%d")
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON,
        "date": today
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        matches = []
        for item in data.get("response", []):
            status_short = item.get("fixture", {}).get("status", {}).get("short", "")
            # Only include matches that haven't finished
            if status_short not in FINISHED_STATUSES:
                matches.append({
                    "id": item.get("fixture", {}).get("id"),
                    "home": item.get("teams", {}).get("home", {}).get("name"),
                    "away": item.get("teams", {}).get("away", {}).get("name"),
                    "homeLogo": item.get("teams", {}).get("home", {}).get("logo"),
                    "awayLogo": item.get("teams", {}).get("away", {}).get("logo"),
                    "time": item.get("fixture", {}).get("date"),
                    "group": item.get("league", {}).get("group", "Group Stage"),
                    "status": status_short
                })
        
        response_data = {"matches": matches}
        schedule_cache[cache_key] = response_data
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/results", methods=["GET"])
def get_results():
    """Returns yesterday's finished matches."""
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "results": []}), 500
        
    cache_key = "results"
    if cache_key in results_cache:
        return jsonify(results_cache[cache_key])

    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON,
        "date": yesterday
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        results = []
        for item in data.get("response", []):
            status_short = item.get("fixture", {}).get("status", {}).get("short", "")
            # Only include completed matches
            if status_short in FINISHED_STATUSES:
                results.append({
                    "id": item.get("fixture", {}).get("id"),
                    "home": item.get("teams", {}).get("home", {}).get("name"),
                    "away": item.get("teams", {}).get("away", {}).get("name"),
                    "homeLogo": item.get("teams", {}).get("home", {}).get("logo"),
                    "awayLogo": item.get("teams", {}).get("away", {}).get("logo"),
                    "homeScore": item.get("goals", {}).get("home", 0),
                    "awayScore": item.get("goals", {}).get("away", 0),
                    "group": item.get("league", {}).get("group", "Group Stage")
                })
        
        response_data = {"results": results}
        results_cache[cache_key] = response_data
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/standings", methods=["GET"])
def get_standings():
    """Returns group standings for the World Cup."""
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "standings": []}), 500

    cache_key = "standings"
    if cache_key in standings_cache:
        return jsonify(standings_cache[cache_key])

    url = f"{FOOTBALL_API_URL}/standings"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        groups = []
        response_list = data.get("response", [])
        if response_list:
            standings_data = response_list[0].get("league", {}).get("standings", [])
            for group_teams in standings_data:
                if not group_teams:
                    continue
                group_name = group_teams[0].get("group", "Unknown Group")
                teams = []
                for team_entry in group_teams:
                    team_info = team_entry.get("team", {})
                    all_stats = team_entry.get("all", {})
                    teams.append({
                        "name": team_info.get("name"),
                        "logo": team_info.get("logo", ""),
                        "points": team_entry.get("points", 0),
                        "played": all_stats.get("played", 0),
                        "won": all_stats.get("win", 0),
                        "drawn": all_stats.get("draw", 0),
                        "lost": all_stats.get("lose", 0),
                        "goalDiff": team_entry.get("goalsDiff", 0)
                    })
                groups.append({
                    "group": group_name,
                    "teams": teams
                })
        
        response_data = {"standings": groups}
        standings_cache[cache_key] = response_data
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/highlights", methods=["GET"])
def get_highlights():
    """Uses YouTube API to search for highlights. Accepts optional 'teams' param for targeted queries."""
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "Missing YouTube API Key", "items": []}), 500
    
    # Check for teams parameter (comma-separated match descriptions)
    teams_param = request.args.get("teams", "")
    if teams_param:
        # Build query from the first match pair
        match_pairs = teams_param.split(",")
        query = f"{match_pairs[0].strip()} World Cup 2026 highlights"
    else:
        query = request.args.get("q", "World Cup 2026 highlights Fox Sports")

    cache_key = f"{teams_param}:{query}"
    if cache_key in highlights_cache:
        return jsonify(highlights_cache[cache_key])

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
        
        response_data = {"highlights": videos}
        highlights_cache[cache_key] = response_data
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/team/<team_id>", methods=["GET"])
def get_team_updates(team_id):
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "updates": []}), 500

    # Input Validation: Allow only alphanumeric characters, spaces, and hyphens, max 50 chars
    if not team_id or len(team_id) > 50 or not re.match(r"^[a-zA-Z0-9\s\-]+$", team_id):
        return jsonify({"error": "Invalid team ID or name format", "updates": []}), 400

    # Check cache
    cache_key = team_id
    if cache_key in team_cache:
        return jsonify(team_cache[cache_key])
        
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
            
        response_data = {"updates": updates}
        team_cache[cache_key] = response_data
        return jsonify(response_data)
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
