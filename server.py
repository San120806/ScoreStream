"""
ScoreStream — Python WebSocket Server
Simulates a live cricket match and broadcasts events to all connected clients.

Requirements:
    pip install websockets

Run:
    python server.py

The server listens on ws://localhost:8000/live
"""

import asyncio
import json
import random
import websockets
from datetime import datetime, timezone

# ── Connected clients ─────────────────────────────────────────────────────────
clients = set()

async def register(websocket):
    clients.add(websocket)
    print(f"[+] Client connected  | Total: {len(clients)}")

async def unregister(websocket):
    clients.discard(websocket)
    print(f"[-] Client disconnected | Total: {len(clients)}")

async def broadcast(payload: dict):
    """Send JSON payload to all connected clients."""
    if not clients:
        return
    message = json.dumps(payload)
    results = await asyncio.gather(
        *[client.send(message) for client in clients],
        return_exceptions=True,
    )
    # Remove clients that errored
    for client, result in zip(list(clients), results):
        if isinstance(result, Exception):
            clients.discard(client)

# ── WebSocket handler ─────────────────────────────────────────────────────────
async def handler(websocket):
    await register(websocket)
    try:
        async for message in websocket:
            pass  # Frontend doesn't send commands yet
    finally:
        await unregister(websocket)

# ── Match simulation ──────────────────────────────────────────────────────────
# Probability weights for each event type
EVENT_WEIGHTS = {
    "RUN":     40,
    "DOT":     25,
    "FOUR":     8,
    "SIX":      4,
    "WIDE":     5,
    "NO_BALL":  3,
    "WICKET":   5,
    "MILESTONE":1,
}

MATCHES = [
    {
        "matchId": "IND-AUS",
        "teams": ["India", "Australia"],
        "score": [100, 0],   # [runs, wickets]
        "ball": 0,           # balls in current over
        "over": 15,
    },
    {
        "matchId": "ENG-PAK",
        "teams": ["England", "Pakistan"],
        "score": [126, 3],
        "ball": 3,
        "over": 15,
    },
]

def pick_event():
    pool = []
    for event, weight in EVENT_WEIGHTS.items():
        pool.extend([event] * weight)
    return random.choice(pool)

def runs_for(event_type: str) -> int:
    return {"FOUR": 4, "SIX": 6, "WIDE": 1, "NO_BALL": 1}.get(event_type, 0)

def fmt_score(runs, wickets):
    return f"{runs}/{wickets}"

def fmt_over(over, ball):
    return f"{over}.{ball}"

async def simulate_match(match: dict, interval: float = 2.5):
    """Continuously generate cricket events for one match and broadcast them."""
    while True:
        event_type = pick_event()
        extra_runs = runs_for(event_type)

        # Update score
        if event_type == "WICKET":
            match["score"][1] = min(match["score"][1] + 1, 10)
        elif event_type not in ("WIDE", "NO_BALL", "DOT", "MILESTONE"):
            match["score"][0] += random.randint(1, 3)
        match["score"][0] += extra_runs

        # Advance ball counter (wides/no-balls don't count as a legal delivery)
        if event_type not in ("WIDE", "NO_BALL"):
            match["ball"] += 1
        if match["ball"] >= 6:
            match["ball"] = 0
            match["over"] += 1

        # Milestone check
        if event_type == "MILESTONE":
            milestone_msg = f"Player reaches {random.choice([50, 100])}!"
        else:
            milestone_msg = None

        payload = {
            "matchId":   match["matchId"],
            "eventType": event_type,
            "score":     fmt_score(*match["score"]),
            "over":      fmt_over(match["over"], match["ball"]),
            "runs":      extra_runs,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "player":    milestone_msg,
        }

        print(f"  [{match['matchId']}] {event_type:10s}  {payload['score']:>8s}  over {payload['over']}")
        await broadcast(payload)

        # Add jitter so matches feel independent
        await asyncio.sleep(interval + random.uniform(-0.5, 0.8))

# ── Entry point ───────────────────────────────────────────────────────────────
async def main():
    print("=" * 55)
    print("  ScoreStream WebSocket Server")
    print("  Listening on  ws://localhost:8000")
    print("  Path          /live")
    print("  Simulating    2 matches simultaneously")
    print("=" * 55)

    server = await websockets.serve(handler, "localhost", 8000)

    # Run match simulations and the server concurrently
    await asyncio.gather(
        server.wait_closed(),
        simulate_match(MATCHES[0], interval=2.5),
        simulate_match(MATCHES[1], interval=3.1),
    )

asyncio.run(main())
