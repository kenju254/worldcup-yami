import pytest
import responses
import os
import json

# Set mock API keys for testing before importing app
os.environ["FOOTBALL_API_KEY"] = "mock-football-key"
os.environ["YOUTUBE_API_KEY"] = "mock-youtube-key"

from main import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@responses.activate
def test_get_schedule(client):
    # Mock API-Sports schedule call
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/fixtures",
        json={
            "response": [
                {
                    "fixture": {"id": 1, "date": "2026-06-22T17:00:00Z", "status": {"short": "NS"}},
                    "teams": {
                        "home": {"name": "USA", "logo": "usa-logo.png"},
                        "away": {"name": "England", "logo": "england-logo.png"}
                    },
                    "league": {"group": "Group B"}
                },
                {
                    "fixture": {"id": 2, "date": "2026-06-22T21:00:00Z", "status": {"short": "FT"}},
                    "teams": {
                        "home": {"name": "Brazil", "logo": "brazil-logo.png"},
                        "away": {"name": "France", "logo": "france-logo.png"}
                    },
                    "league": {"group": "Group F"}
                }
            ]
        },
        status=200
    )

    res = client.get("/schedule")
    assert res.status_code == 200
    data = res.get_json()
    assert "matches" in data
    # Should only contain the unfinished match
    assert len(data["matches"]) == 1
    assert data["matches"][0]["home"] == "USA"
    assert data["matches"][0]["away"] == "England"
    assert data["matches"][0]["status"] == "NS"

@responses.activate
def test_get_results(client):
    # Mock API-Sports results call
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/fixtures",
        json={
            "response": [
                {
                    "fixture": {"id": 2, "date": "2026-06-21T21:00:00Z", "status": {"short": "FT"}},
                    "teams": {
                        "home": {"name": "Brazil", "logo": "brazil-logo.png"},
                        "away": {"name": "France", "logo": "france-logo.png"}
                    },
                    "goals": {"home": 2, "away": 0},
                    "league": {"group": "Group F"}
                },
                {
                    "fixture": {"id": 3, "date": "2026-06-21T18:00:00Z", "status": {"short": "NS"}},
                    "teams": {
                        "home": {"name": "Mexico", "logo": "mexico-logo.png"},
                        "away": {"name": "Canada", "logo": "canada-logo.png"}
                    },
                    "goals": {"home": None, "away": None},
                    "league": {"group": "Group A"}
                }
            ]
        },
        status=200
    )

    res = client.get("/results")
    assert res.status_code == 200
    data = res.get_json()
    assert "results" in data
    # Should only contain the completed match
    assert len(data["results"]) == 1
    assert data["results"][0]["home"] == "Brazil"
    assert data["results"][0]["away"] == "France"
    assert data["results"][0]["homeScore"] == 2
    assert data["results"][0]["awayScore"] == 0

@responses.activate
def test_get_standings(client):
    # Mock API-Sports standings call
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/standings",
        json={
            "response": [
                {
                    "league": {
                        "standings": [
                            [
                                {
                                    "team": {"name": "Argentina", "logo": "arg-logo.png"},
                                    "group": "Group C",
                                    "points": 9,
                                    "all": {"played": 3, "win": 3, "draw": 0, "lose": 0},
                                    "goalsDiff": 5
                                }
                            ]
                        ]
                    }
                }
            ]
        },
        status=200
    )

    res = client.get("/standings")
    assert res.status_code == 200
    data = res.get_json()
    assert "standings" in data
    assert len(data["standings"]) == 1
    assert data["standings"][0]["group"] == "Group C"
    assert data["standings"][0]["teams"][0]["name"] == "Argentina"
    assert data["standings"][0]["teams"][0]["points"] == 9

@responses.activate
def test_get_highlights(client):
    # Mock YouTube API search
    responses.add(
        responses.GET,
        "https://www.googleapis.com/youtube/v3/search",
        json={
            "items": [
                {
                    "id": {"videoId": "test-vid-123"},
                    "snippet": {
                        "title": "Argentina vs France Highlights",
                        "thumbnails": {
                            "medium": {"url": "https://img.youtube.com/test-vid-123.jpg"}
                        }
                    }
                }
            ]
        },
        status=200
    )

    res = client.get("/highlights?teams=Argentina,France")
    assert res.status_code == 200
    data = res.get_json()
    assert "highlights" in data
    assert len(data["highlights"]) == 1
    assert data["highlights"][0]["id"] == "test-vid-123"
    assert data["highlights"][0]["title"] == "Argentina vs France Highlights"

@responses.activate
def test_get_team_updates_numeric_id(client):
    # Mock API-Sports team fixtures call directly (since ID is numeric)
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/fixtures",
        json={
            "response": [
                {
                    "fixture": {"id": 10, "date": "2026-06-22T17:00:00Z", "status": {"short": "FT"}},
                    "teams": {
                        "home": {"id": 34, "name": "USA"},
                        "away": {"id": 12, "name": "England"}
                    },
                    "goals": {"home": 2, "away": 1}
                }
            ]
        },
        status=200
    )

    res = client.get("/team/34")
    assert res.status_code == 200
    data = res.get_json()
    assert "updates" in data
    assert len(data["updates"]) == 1
    assert data["updates"][0]["opponent"] == "England"
    assert data["updates"][0]["status"] == "Won 2-1"

@responses.activate
def test_get_team_updates_by_name(client):
    # 1. Mock team resolution endpoint
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/teams",
        json={
            "response": [
                {
                    "team": {"id": 34, "name": "USA", "national": True}
                }
            ]
        },
        status=200
    )
    
    # 2. Mock fixtures endpoint
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/fixtures",
        json={
            "response": [
                {
                    "fixture": {"id": 11, "date": "2026-06-22T17:00:00Z", "status": {"short": "NS"}},
                    "teams": {
                        "home": {"id": 34, "name": "USA"},
                        "away": {"id": 12, "name": "England"}
                    },
                    "goals": {"home": None, "away": None}
                }
            ]
        },
        status=200
    )

    res = client.get("/team/USA")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["updates"]) == 1
    assert data["updates"][0]["opponent"] == "England"
    assert data["updates"][0]["status"] == "Upcoming"

@responses.activate
def test_get_team_updates_invalid_format(client):
    # Tests that invalid formats or lengths > 50 return 400
    res = client.get("/team/USA$#%")
    assert res.status_code == 400
    assert "Invalid team ID or name format" in res.get_json()["error"]

    res = client.get("/team/" + ("A" * 51))
    assert res.status_code == 400
    assert "Invalid team ID or name format" in res.get_json()["error"]

@responses.activate
def test_caching(client):
    # Mock fixtures endpoint once
    responses.add(
        responses.GET,
        "https://v3.football.api-sports.io/fixtures",
        json={
            "response": [
                {
                    "fixture": {"id": 1, "date": "2026-06-22T17:00:00Z", "status": {"short": "NS"}},
                    "teams": {
                        "home": {"name": "USA", "logo": "usa-logo.png"},
                        "away": {"name": "England", "logo": "england-logo.png"}
                    },
                    "league": {"group": "Group B"}
                }
            ]
        },
        status=200
    )

    # First request - should call mock API
    res1 = client.get("/schedule")
    assert res1.status_code == 200
    
    # Second request - should hit schedule cache without requiring another mock API registration
    res2 = client.get("/schedule")
    assert res2.status_code == 200
    assert res1.get_json() == res2.get_json()

@responses.activate
def test_api_keys_missing(client):
    # Temporarily remove API keys
    import main
    orig_football_key = main.FOOTBALL_API_KEY
    orig_youtube_key = main.YOUTUBE_API_KEY
    main.FOOTBALL_API_KEY = ""
    main.YOUTUBE_API_KEY = ""

    # Clear caches to force API key check
    main.schedule_cache.clear()
    main.highlights_cache.clear()

    try:
        res = client.get("/schedule")
        assert res.status_code == 500
        assert "error" in res.get_json()

        res = client.get("/highlights")
        assert res.status_code == 500
        assert "error" in res.get_json()
    finally:
        main.FOOTBALL_API_KEY = orig_football_key
        main.YOUTUBE_API_KEY = orig_youtube_key
