import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1")

def load_json(filename: str):
    path = os.path.join("data", filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading {filename}: {e}")

@router.get("/conversations")
async def get_conversations():
    """Return a flat list of conversations with IDs for decision tracking."""
    data = load_json("elyx_conversations.json")
    conversations = data.get("conversations", []) if isinstance(data, dict) else data
    
    # Ensure each conversation has an ID
    for i, conv in enumerate(conversations):
        if 'id' not in conv:
            conv['id'] = f"conv_{i+1}"
    
    return conversations

@router.get("/journey")
async def get_journey():
    """Return the member's journey episodes as an array."""
    data = load_json("elyx_journey.json")
    return data.get("journey", []) if isinstance(data, dict) else data

@router.get("/member/profile")
async def get_member_profile():
    """Return only the member profile."""
    data = load_json("elyx_journey.json")
    if isinstance(data, dict) and "member" in data:
        return {"member": data["member"]}
    
    try:
        member_data = load_json("elyx_member.json")
        return member_data
    except:
        return {"member": None}

@router.get("/decisions")
async def get_decisions():
    """Return decision tracebacks with conversation linkage."""
    try:
        data = load_json("elyx_tracebacks.json")
        decisions = data.get("decisions", []) if isinstance(data, dict) else data
        
        # Ensure decisions have required fields
        for decision in decisions:
            if 'id' not in decision:
                decision['id'] = decision.get('decision', 'unknown')[:20]
            if 'timestamp' not in decision:
                decision['timestamp'] = '2025-01-01'
        
        return decisions
    except:
        return []

@router.get("/metrics")
async def get_metrics():
    """Return metrics object."""
    data = load_json("elyx_metrics.json")
    return data.get("metrics", data) if isinstance(data, dict) else data

@router.get("/health")
async def health_check():
    """Health check with dataset info."""
    return {
        "status": "healthy",
        "message": "Elyx Dashboard API is running",
        "datasets": [
            "elyx_conversations.json",
            "elyx_journey.json", 
            "elyx_member.json",
            "elyx_tracebacks.json",
            "elyx_metrics.json"
        ],
        "features": [
            "Decision traceability",
            "Journey visualization",
            "Conversation filtering",
            "Member profile display"
        ]
    }
