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
CURRENT_SEASON = "2026"

@app.route("/schedule", methods=["GET"])
def get_schedule():
    # Returns the upcoming matches
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "matches": []}), 500
        
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON,
        "next": "15" # Get next 15 matches
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        return jsonify(data)
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
        "season": CURRENT_SEASON,
        "last": "15" # Get last 15 matches
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        return jsonify(data)
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
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/team/<team_id>", methods=["GET"])
def get_team_updates(team_id):
    if not FOOTBALL_API_KEY:
        return jsonify({"error": "Missing API Key", "fixtures": []}), 500
        
    url = f"{FOOTBALL_API_URL}/fixtures"
    params = {
        "league": WORLD_CUP_LEAGUE_ID,
        "season": CURRENT_SEASON,
        "team": team_id
    }
    try:
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@https_fn.on_request(max_instances=10)
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
