import json

# Load conversations
with open("elyx_conversations.json", "r", encoding="utf-8") as f:
    conversations = json.load(f)

# Track current active thread
current_trigger_id = None
current_trigger_sender = None
current_topic = None

def is_new_thread(msg, last_topic):
    """
    Logic to decide if this msg starts a new trigger
    """
    # If Rohan introduces a new symptom, question, or health report → new thread
    if msg["sender"] == "Rohan":
        return True
    
    # If Elyx initiates (like new lab booking, reminders, logistics, new plan)
    # and it's clearly not just a follow-up to Rohan → new thread
    if msg["sender"] != "Rohan" and last_topic != msg["topic"]:
        return True
    
    return False


# Iterate chronologically
for msg in conversations:
    if current_trigger_id is None or is_new_thread(msg, current_topic):
        # Mark as trigger
        msg["is_trigger"] = True
        msg["trigger_id"] = msg["id"]
        msg["trigger_sender"] = "Rohan" if msg["sender"] == "Rohan" else "Elyx"
        
        # Reset thread state
        current_trigger_id = msg["id"]
        current_trigger_sender = msg["trigger_sender"]
        current_topic = msg["topic"]
    else:
        # Continuation of current thread
        msg["is_trigger"] = False
        msg["trigger_id"] = current_trigger_id
        msg["trigger_sender"] = current_trigger_sender

# Save updated file
with open("elyx_conversations_with_triggers.json", "w", encoding="utf-8") as f:
    json.dump(conversations, f, indent=2, ensure_ascii=False)

print("✅ Updated triggers written to elyx_conversations_with_triggers.json")
