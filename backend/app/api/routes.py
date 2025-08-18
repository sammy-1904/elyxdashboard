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
    try:
        # Try to load conversations with trigger data first
        data = load_json("elyx_conversations.json")
    except:
        # Fallback to original conversations file
        data = load_json("elyx_conversations.json")
    
    conversations = data.get("conversations", []) if isinstance(data, dict) else data
    
    # Ensure each conversation has an ID
    for i, conv in enumerate(conversations):
        if 'id' not in conv:
            conv['id'] = f"conv_{i+1}"
    
    return conversations

@router.get('/plans')
async def get_plans():
    """Return the member's plans."""
    data = load_json("elyx_plans.json")
    return data.get("plans", []) if isinstance(data, dict) else data

@router.get("/journey")
async def get_journey():
    """Return the member's journey episodes as an array."""
    data = load_json("elyx_journey.json")
    return data.get("journey", []) if isinstance(data, dict) else data

@router.get("/member/profile")
async def get_member_profile():
    """Return only the member profile."""
    data = load_json("elyx_member.json")
    if isinstance(data, dict) and "member" in data:
        return {"member": data["member"]}
    
    try:
        member_data = load_json("elyx_member.json")
        print(member_data)
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
    metrics = data.get("metrics", data) if isinstance(data, dict) else data
    
    # Add trigger counts to the metrics
    try:
        conversations_data = load_json("elyx_conversations_with_trigger.json")
        conversations = conversations_data.get("conversations", []) if isinstance(conversations_data, dict) else conversations_data
        
        # Count triggers
        elyx_triggers = sum(1 for conv in conversations if conv.get('trigger') == 'elyx')
        member_triggers = sum(1 for conv in conversations if conv.get('trigger') == 'member')
        
        # Add trigger counts to the metrics
        if 'communication_stats' not in metrics:
            metrics['communication_stats'] = {}
        
        metrics['communication_stats']['elyx_triggers'] = elyx_triggers
        metrics['communication_stats']['member_triggers'] = member_triggers
        
    except Exception as e:
        # If trigger data is not available, set default values
        if 'communication_stats' not in metrics:
            metrics['communication_stats'] = {}
        metrics['communication_stats']['elyx_triggers'] = 0
        metrics['communication_stats']['member_triggers'] = 0
    
    return metrics

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
