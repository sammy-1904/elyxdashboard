import re
import json
from datetime import datetime
from collections import defaultdict

# ========================
# Helper Functions
# ========================

def map_role(sender: str) -> str:
    sender = sender.lower().strip()
    if "ruby" in sender:
        return "Concierge"
    elif "dr. warren" in sender or "warren" in sender:
        return "Medical Strategist"
    elif "advik" in sender:
        return "Performance Scientist"
    elif "carla" in sender:
        return "Nutritionist"
    elif "rachel" in sender:
        return "Physiotherapist"
    elif "neel" in sender:
        return "Relationship Manager"
    elif "sarah" in sender:
        return "Personal Assistant"
    elif "rohan" in sender:
        return "Member"
    else:
        return "Other"


def detect_topic(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ["sleep", "hrv", "caffeine", "nap", "latency", "wind-down"]):
        return "Sleep & Recovery"
    elif any(k in msg for k in ["protein", "diet", "nutrition", "breakfast", "lunch", "dinner", "supplement", "omega-3", "psyllium"]):
        return "Nutrition"
    elif any(k in msg for k in ["strength", "exercise", "workout", "squat", "zone 2", "push-up", "training", "intervals"]):
        return "Exercise"
    elif any(k in msg for k in ["bp", "blood", "lab", "test", "diagnostic", "cholesterol", "apob", "glucose", "statin"]):
        return "Labs/Diagnostics"
    elif any(k in msg for k in ["travel", "trip", "flight", "hotel", "timezone", "jakarta", "london", "seoul"]):
        return "Travel/Logistics"
    elif any(k in msg for k in ["knee", "pain", "mobility", "hip", "back"]):
        return "Physical Health"
    else:
        return "General/Other"


def detect_decision_type(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ["prescrib", "statin", "medication", "dose"]):
        return "Medication"
    elif any(k in msg for k in ["protocol", "plan", "program", "refresh"]):
        return "Treatment Plan"
    elif any(k in msg for k in ["test", "lab", "diagnostic", "panel"]):
        return "Diagnostic"
    elif any(k in msg for k in ["supplement", "add", "increase", "reduce"]):
        return "Supplement"
    else:
        return "Lifestyle"


def detect_action_decision(message: str, role: str) -> bool:
    """Role-aware decision detection based on Elyx team structure"""
    msg = message.lower()
    
    # Filter out greetings and questions
    greetings = ["good morning", "welcome", "hello", "hi", "thanks"]
    if any(greet in msg for greet in greetings):
        return False
    
    if "?" in message:  # Questions are usually not decisions
        return False
    
    # Ruby (Concierge): Only logistics decisions, not questions/requests
    if role == "Concierge":
        if any(k in msg for k in ["schedule", "confirm", "arrange", "reminder", "follow-up", "book"]):
            # Exclude permission requests and questions
            if any(q in msg for q in ["can i", "may i", "could i", "would you", "please"]):
                return False
            return True
        return False
    
    # All other roles: Use standard decision keywords
    decision_keywords = [
        "recommend", "suggest", "plan", "protocol", "add", "reduce", "swap", 
        "target", "start", "begin", "initiate", "prescribe", "order", 
        "schedule", "book", "change", "adjust", "increase", "decrease",
        "booked", "confirm", "let's", "we'll", "i'll"
    ]
    
    return any(k in msg for k in decision_keywords)


def extract_month_week_from_timestamp(timestamp_str: str):
    try:
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", timestamp_str)
        if date_match:
            dt = datetime.strptime(date_match.group(1), "%Y-%m-%d")
            month = dt.month
            week_in_month = ((dt.day - 1) // 7) + 1
            return dt, month, week_in_month
        else:
            return None, None, None
    except:
        return None, None, None


def determine_episode(month, week, message, sender, role):
    """Role-aware episode detection based on team member specialties"""
    msg = message.lower()
    
    # Role-based episode detection
    if role == "Medical Strategist" and any(k in msg for k in ["lab", "diagnostic", "recommend", "prescribe"]):
        return "Medical Review & Strategic Planning"
    
    if role == "Concierge" and any(k in msg for k in ["schedule", "confirm", "arrange", "reminder"]):
        return "Logistics & Coordination"
    
    if role == "Performance Scientist" and any(k in msg for k in ["experiment", "test", "hypothesis", "adjust", "monitor", "analyze"]):
        return "Performance & Data Analysis"
    
    if role == "Nutritionist" and any(k in msg for k in ["recommend", "brief", "swap", "add", "consolidate"]):
        return "Nutrition & Supplement Planning"
    
    if role == "Physiotherapist" and any(k in msg for k in ["routine", "plan", "regress", "progress", "mobility", "form"]):
        return "Exercise & Rehabilitation"
    
    if role == "Relationship Manager" and any(k in msg for k in ["align", "review", "connect", "qbr", "resolve"]):
        return "Strategic Review / QBR"
    
    # Fallback: Date-based episode detection
    if not month:
        return "Ongoing Management"
    
    if month == 9:
        return "Initial Onboarding & Setup" if week <= 2 else "Baseline Establishment"
    elif month == 10:
        return "Consistency Building & Travel"
    elif month == 11:
        return "First Quarter Assessment"
    elif month == 12:
        return "Holiday Period Adaptation"
    elif month == 1:
        return "New Year Reset & Intensification"
    elif month == 2:
        return "Medication Introduction & Strategy Update"
    elif month >= 3:
        return "Optimization & Long-term Management"
    else:
        return "Ongoing Management"


# ========================
# Parsing Functions
# ========================

def parse_conversation(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    lines = content.split('\n')
    conversations = []
    conv_id = 1
    
    conversation_pattern = r'^\[([\d\-\s:A-Z]+)\]\s+([^:]+?)(?:\s*\([^)]*\))?\s*:\s*(.+)$'
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('Note:') or line.startswith('***'):
            continue
            
        match = re.match(conversation_pattern, line)
        if match:
            timestamp_str = match.group(1).strip()
            sender_raw = match.group(2).strip()
            message = match.group(3).strip()
            
            # Clean sender name
            sender = re.sub(r'\s*\([^)]*\)$', '', sender_raw).strip()
            
            if not message or len(message) < 5:
                continue
                
            dt, month, week = extract_month_week_from_timestamp(timestamp_str)
            role = map_role(sender)
            action_decision = detect_action_decision(message, role)
            decision_type = detect_decision_type(message) if action_decision else None
            episode = determine_episode(month or 0, week or 0, message, sender, role)
            
            conversation = {
                'id': f'conv_{conv_id}',
                'timestamp': timestamp_str,
                'sender': sender,
                'role': role,
                'topic': detect_topic(message),
                'message': message,
                'action_decision': action_decision,
                'decision_type': decision_type,
                'month': month,
                'week': week,
                'episode': episode,
                'date': dt.isoformat() if dt else None
            }
            
            conversations.append(conversation)
            conv_id += 1
    
    return conversations


def build_datasets(conversations):
    if not conversations:
        print('❌ No conversations found to process!')
        return
    
    # 1. Conversations JSON
    with open('elyx_conversations.json', 'w', encoding='utf-8') as f:
        json.dump(conversations, f, indent=2)
    
    # 2. Journey Episodes JSON
    episodes_by_month = defaultdict(lambda: defaultdict(list))
    for conv in conversations:
        month = conv['month'] or 0
        episode = conv['episode']
        episodes_by_month[month][episode].append(conv)
    
    journey_episodes = []
    episode_id = 1
    
    for month in sorted(episodes_by_month.keys()):
        for episode_name, convs in episodes_by_month[month].items():
            decisions_count = sum(1 for c in convs if c['action_decision'])
            team_messages = sum(1 for c in convs if c['role'] != 'Member')
            member_messages = sum(1 for c in convs if c['role'] == 'Member')
            timestamps = [c['timestamp'] for c in convs if c['timestamp']]
            
            episode_data = {
                'id': f'episode_{episode_id}',
                'title': episode_name,
                'month': month,
                'date_range': {
                    'start': min(timestamps) if timestamps else None,
                    'end': max(timestamps) if timestamps else None
                },
                'summary': f'{episode_name} - {len(convs)} messages, {decisions_count} decisions',
                'conversations': convs,
                'metrics': {
                    'total_messages': len(convs),
                    'decisions': decisions_count,
                    'team_messages': team_messages,
                    'member_messages': member_messages,
                    'primary_topics': list(set(c['topic'] for c in convs))
                }
            }
            
            journey_episodes.append(episode_data)
            episode_id += 1
    
    journey_data = {
        'member': {
            'name': 'Rohan Patel',
            'member_id': 'rohan_patel_001'
        },
        'journey': journey_episodes
    }
    
    with open('elyx_journey.json', 'w', encoding='utf-8') as f:
        json.dump(journey_data, f, indent=2)
    
    # 3. Decision Tracebacks JSON
    decisions = []
    decision_id = 1
    
    for conv in conversations:
        if conv['action_decision']:
            reason = conv['message'][:200] + '...' if len(conv['message']) > 200 else conv['message']
            
            decision_data = {
                'id': f'decision_{decision_id}',
                'decision': conv['message'],
                'decision_type': conv['decision_type'],
                'reason': f'Clinical decision by {conv["role"]}: {reason}',
                'trigger_message': conv['message'],
                'trigger_message_id': conv['id'],
                'conversation_id': conv['id'],
                'timestamp': conv['timestamp'],
                'team_member': f"{conv['sender']} ({conv['role']})",
                'topic': conv['topic'],
                'linked_outcomes': [],
                'priority': 'high' if conv['decision_type'] in ['Medication', 'Diagnostic'] else 'medium'
            }
            
            decisions.append(decision_data)
            decision_id += 1
    
    tracebacks_data = {
        'decisions': decisions,
        'total_count': len(decisions)
    }
    
    with open('elyx_tracebacks.json', 'w', encoding='utf-8') as f:
        json.dump(tracebacks_data, f, indent=2)
    
    # 4. Member Profile JSON
    member_profile = {
        'member': {
            'name': 'Rohan Patel',
            'age': 46,
            'gender': 'Male',
            'residence': 'Singapore',
            'travel_hubs': ['UK', 'US', 'South Korea', 'Jakarta', 'Seoul'],
            'occupation': 'Regional Head of Sales for a FinTech company',
            'health_goals': [
                'Reduce risk of heart disease due to family history by December 2026',
                'Enhance cognitive function and focus for sustained mental performance by June 2026',
                'Implement annual full-body health screenings for early detection starting November 2025'
            ],
            'motivations': 'Family history of heart disease; wants to proactively manage health for long-term career performance and to be present for his young children',
            'wearables': ['Garmin watch', 'considering Oura ring'],
            'preferences': {
                'communication': 'WhatsApp, email coordination via PA Sarah Tan',
                'response_time': '24-48 hours for non-urgent inquiries',
                'reports': 'Monthly consolidated health report + quarterly deep-dive',
                'detail_level': 'Executive summaries with access to granular data upon request'
            }
        }
    }
    
    with open('elyx_member.json', 'w', encoding='utf-8') as f:
        json.dump(member_profile, f, indent=2)
    
    # 5. Internal Metrics JSON
    role_distribution = defaultdict(int)
    topic_distribution = defaultdict(int)
    monthly_activity = defaultdict(int)
    
    for conv in conversations:
        role_distribution[conv['role']] += 1
        topic_distribution[conv['topic']] += 1
        if conv['month']:
            monthly_activity[conv['month']] += 1
    
    metrics = {
        'metrics': {
            'team_utilization': {
                'medical_strategist_hours': 4.5,
                'physiotherapy_hours': 3.0,
                'nutrition_hours': 3.5,
                'concierge_hours': 6.0,
                'performance_scientist_hours': 2.5
            },
            'communication_stats': {
                'total_messages': len(conversations),
                'member_initiated_per_week': 5,
                'team_initiated_per_week': 12,
                'role_distribution': dict(role_distribution),
                'topic_distribution': dict(topic_distribution)
            },
            'adherence_tracking': {
                'overall_adherence': 0.55,
                'zone2_exercise': 0.78,
                'strength_training': 0.52,
                'nutrition_goals': 0.68,
                'sleep_targets': 0.58
            },
            'monthly_activity': dict(monthly_activity)
        }
    }
    
    with open('elyx_metrics.json', 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)


# ========================
# Main Execution
# ========================

if __name__ == "__main__":
    input_file = "Conversation.txt"  # Update path as needed
    
    try:
        convs = parse_conversation(input_file)
        
        if convs:
            build_datasets(convs)
            print("✅ All dataset JSON files created successfully!")
            print(f"📊 Total conversations parsed: {len(convs)}")
            print(f"📊 Total decisions tracked: {sum(1 for c in convs if c['action_decision'])}")
            print(f"📊 Date range: {convs[0]['timestamp']} to {convs[-1]['timestamp']}")
        else:
            print("❌ No conversations were parsed. Check the file format.")
            
    except Exception as e:
        print(f"❌ Error creating datasets: {e}")
        import traceback
        traceback.print_exc()
