import json
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import defaultdict
from app.models.schemas import Event

class DataService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), "../../data")
        self.events_data = self._load_events()
        self.journey_data = self._load_journey()

        print(f"Loaded {len(self.events_data)} events")
        if self.events_data:
            print(f"Sample event keys: {list(self.events_data[0].keys())}")
        decisions_count = len([e for e in self.events_data if e.get('decision', {}).get('taken') is True])
        print(f"Found {decisions_count} decisions in dataset")

    def _load_events(self) -> List[Dict[str, Any]]:
        events_path = os.path.join(self.data_dir, "events.json")
        try:
            with open(events_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Ensure all required fields exist
                for event in data:
                    event.setdefault('travel', {'flag': False, 'region': None, 'location': None})
                    event.setdefault('actor', {'sender': 'Unknown', 'role': 'Unknown'})
                    event.setdefault('topic', {'category': 'unknown', 'subtype': None, 'biomarkers': []})
                    event.setdefault('metrics', {'bp': None, 'sleep_hours': None, 'hrv_flag': False, 'adherence_pct': None})
                    event.setdefault('training_flags', {'zone2': False, 'strength': False, 'intervals': False, 'exercise_refresh': False, 'diagnostic_event': False})
                    event.setdefault('nutrition_flags', {'note': False, 'supplements': False, 'medication': False})
                    event.setdefault('issues', {'msk': False, 'sleep_travel': False})
                    event.setdefault('content', {'summary': [], 'details': '', 'recommendations': ''})
                    event.setdefault('decision', {'taken': False, 'followup_date': None})
                    event.setdefault('why', {'rationale': None, 'expected_outcome': None, 'priority': None, 'confidence': 'Medium'})
                
                # Sort by timestamp
                data.sort(key=lambda x: x.get('timestamp', ''))
                return data
        except FileNotFoundError:
            print(f"Events file not found at {events_path}")
            return []
        except json.JSONDecodeError as e:
            print(f"Error parsing events.json: {e}")
            return []

    def _load_journey(self) -> Dict[str, Any]:
        journey_path = os.path.join(self.data_dir, "journey.json")
        try:
            with open(journey_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Journey file not found at {journey_path}")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing journey.json: {e}")
            return {}

    def _parse_sleep_hours(self, sleep_value) -> Optional[float]:
        """Parse sleep hours from various formats to decimal hours"""
        if sleep_value is None:
            return None
        
        if isinstance(sleep_value, (int, float)):
            return float(sleep_value)
        
        if isinstance(sleep_value, str):
            sleep_value = sleep_value.lower().strip()
            
            # Format: "6h45m"
            if 'h' in sleep_value:
                try:
                    h_match = re.search(r'(\d+(?:\.\d+)?)h', sleep_value)
                    m_match = re.search(r'(\d+(?:\.\d+)?)m', sleep_value)
                    hours = float(h_match.group(1)) if h_match else 0
                    minutes = float(m_match.group(1)) if m_match else 0
                    return hours + (minutes / 60)
                except:
                    pass
            
            # Format: "6:45" or "6.75"
            try:
                if ':' in sleep_value:
                    parts = sleep_value.split(':')
                    hours = float(parts[0])
                    minutes = float(parts[1]) if len(parts) > 1 else 0
                    return hours + (minutes / 60)
                else:
                    return float(sleep_value)
            except:
                pass
        
        return None

    def get_all_events(self) -> List[Event]:
        try:
            return [Event(**event) for event in self.events_data]
        except Exception as e:
            print(f"Error creating Event objects: {e}")
            return []

    def get_events_by_month(self, month: int) -> List[Event]:
        try:
            filtered_events = [event for event in self.events_data if event.get('month') == month]
            return [Event(**event) for event in filtered_events]
        except Exception as e:
            print(f"Error filtering events by month {month}: {e}")
            return []

    def get_events_by_actor(self, actor: str) -> List[Event]:
        try:
            filtered_events = [
                event for event in self.events_data
                if event.get('actor', {}).get('sender', '').lower() == actor.lower()
            ]
            return [Event(**event) for event in filtered_events]
        except Exception as e:
            print(f"Error filtering events by actor {actor}: {e}")
            return []

    def get_decisions_with_context(self) -> List[Dict[str, Any]]:
        decisions = []
        try:
            for event in self.events_data:
                decision = event.get('decision', {})
                if decision.get('taken') is True:
                    why = event.get('why', {})
                    decisions.append({
                        'event_id': event.get('id'),
                        'timestamp': event.get('timestamp'),
                        'actor': event.get('actor', {}),
                        'decision': decision,
                        'rationale': why.get('rationale'),
                        'expected_outcome': why.get('expected_outcome'),
                        'priority': why.get('priority'),
                        'confidence': why.get('confidence'),
                        'context': event.get('content', {}).get('details', ''),
                        'biomarkers': event.get('topic', {}).get('biomarkers', []),
                        'category': event.get('topic', {}).get('category')
                    })
        except Exception as e:
            print(f"Error processing decisions: {e}")
        
        return decisions

    def get_travel_periods(self) -> List[Dict[str, Any]]:
        try:
            travel_events = [
                event for event in self.events_data
                if event.get('travel', {}).get('flag') is True
            ]
            
            travel_events.sort(key=lambda x: x.get('timestamp', ''))
            
            travel_periods = []
            current_period = None
            
            for event in travel_events:
                travel_info = event.get('travel', {})
                region = travel_info.get('region')
                location = travel_info.get('location')
                
                if (current_period is None or 
                    current_period['region'] != region):
                    
                    if current_period:
                        travel_periods.append(current_period)
                    
                    current_period = {
                        'region': region,
                        'location': location,
                        'start_date': event.get('timestamp'),
                        'end_date': event.get('timestamp'),
                        'events': [event.get('id')]
                    }
                else:
                    current_period['end_date'] = event.get('timestamp')
                    current_period['events'].append(event.get('id'))
            
            if current_period:
                travel_periods.append(current_period)
            
            return travel_periods
        except Exception as e:
            print(f"Error processing travel periods: {e}")
            return []

    def get_exercise_refreshes(self) -> List[Dict[str, Any]]:
        try:
            refresh_events = [
                event for event in self.events_data
                if event.get('training_flags', {}).get('exercise_refresh') is True
            ]
            
            return [
                {
                    'timestamp': event.get('timestamp'),
                    'event_id': event.get('id'),
                    'actor': event.get('actor', {}).get('sender'),
                    'details': event.get('content', {}).get('details', ''),
                    'week': event.get('week'),
                    'month': event.get('month')
                }
                for event in refresh_events
            ]
        except Exception as e:
            print(f"Error processing exercise refreshes: {e}")
            return []

    def get_diagnostic_events(self) -> List[Dict[str, Any]]:
        try:
            diagnostic_events = [
                event for event in self.events_data
                if event.get('training_flags', {}).get('diagnostic_event') is True
            ]
            
            return [
                {
                    'timestamp': event.get('timestamp'),
                    'event_id': event.get('id'),
                    'actor': event.get('actor', {}).get('sender'),
                    'biomarkers': event.get('topic', {}).get('biomarkers', []),
                    'details': event.get('content', {}).get('details', ''),
                    'month': event.get('month')
                }
                for event in diagnostic_events
            ]
        except Exception as e:
            print(f"Error processing diagnostic events: {e}")
            return []

    def get_member_progress_summary(self) -> Dict[str, Any]:
        try:
            # Process sleep data
            sleep_events = []
            for event in self.events_data:
                sleep_hours = event.get('metrics', {}).get('sleep_hours')
                parsed_sleep = self._parse_sleep_hours(sleep_hours)
                if parsed_sleep is not None and 0 < parsed_sleep < 24:
                    sleep_events.append({
                        'timestamp': event.get('timestamp'),
                        'value': round(parsed_sleep, 2)
                    })

            # Process adherence data
            adherence_events = []
            for event in self.events_data:
                adherence = event.get('metrics', {}).get('adherence_pct')
                if adherence is not None and isinstance(adherence, (int, float)):
                    adherence_events.append({
                        'timestamp': event.get('timestamp'),
                        'value': int(adherence)
                    })

            # Count HRV flags
            hrv_flags = [
                event for event in self.events_data
                if event.get('metrics', {}).get('hrv_flag') is True
            ]

            # Count decisions
            total_decisions = len([
                event for event in self.events_data
                if event.get('decision', {}).get('taken') is True
            ])

            # Get travel periods count
            travel_periods_count = len(self.get_travel_periods())

            # Debug output
            print(f"Sleep events found: {len(sleep_events)}")
            print(f"Adherence events found: {len(adherence_events)}")
            print(f"HRV flags: {len(hrv_flags)}")
            print(f"Total decisions: {total_decisions}")
            print(f"Travel periods: {travel_periods_count}")

            return {
                'total_events': len(self.events_data),
                'total_decisions': total_decisions,
                'adherence_data': adherence_events[-20:] if adherence_events else [],
                'sleep_data': sleep_events[-20:] if sleep_events else [],
                'hrv_issues': len(hrv_flags),
                'travel_periods': travel_periods_count,
                'exercise_refreshes': len(self.get_exercise_refreshes()),
                'diagnostic_events': len(self.get_diagnostic_events())
            }

        except Exception as e:
            print(f"Error in get_member_progress_summary: {e}")
            return {
                'total_events': len(self.events_data),
                'total_decisions': 0,
                'adherence_data': [],
                'sleep_data': [],
                'hrv_issues': 0,
                'travel_periods': 0,
                'exercise_refreshes': 0,
                'diagnostic_events': 0
            }

    def search_events(self, query: str) -> List[Event]:
        try:
            query_lower = query.lower()
            filtered_events = []
            
            for event in self.events_data:
                content = event.get('content', {})
                details = content.get('details', '').lower()
                summary = str(content.get('summary', [])).lower()
                actor_name = event.get('actor', {}).get('sender', '').lower()
                category = event.get('topic', {}).get('category', '').lower()
                
                if (query_lower in details or
                    query_lower in summary or
                    query_lower in actor_name or
                    query_lower in category):
                    filtered_events.append(event)
            
            return [Event(**event) for event in filtered_events[:50]]
        except Exception as e:
            print(f"Error searching events: {e}")
            return []

    def get_biomarker_trends(self) -> Dict[str, List[Dict[str, Any]]]:
        try:
            biomarker_data = {}
            
            for event in self.events_data:
                biomarkers = event.get('topic', {}).get('biomarkers', [])
                timestamp = event.get('timestamp')
                metrics = event.get('metrics', {})
                
                # Track BP readings
                if 'BP' in biomarkers and metrics.get('bp'):
                    if 'BP' not in biomarker_data:
                        biomarker_data['BP'] = []
                    biomarker_data['BP'].append({
                        'timestamp': timestamp,
                        'value': metrics.get('bp'),
                        'event_id': event.get('id')
                    })

                # Track HRV events
                if 'HRV' in biomarkers or metrics.get('hrv_flag'):
                    if 'HRV' not in biomarker_data:
                        biomarker_data['HRV'] = []
                    biomarker_data['HRV'].append({
                        'timestamp': timestamp,
                        'flag': metrics.get('hrv_flag', False),
                        'event_id': event.get('id')
                    })
                
                # Track other biomarkers mentioned
                for marker in ['ApoB', 'LDL-C', 'Lp(a)', 'hs-CRP']:
                    if marker in biomarkers:
                        if marker not in biomarker_data:
                            biomarker_data[marker] = []
                        biomarker_data[marker].append({
                            'timestamp': timestamp,
                            'event_id': event.get('id'),
                            'mentioned': True
                        })
            
            return biomarker_data
        except Exception as e:
            print(f"Error processing biomarker trends: {e}")
            return {}

    def get_actor_activity_summary(self) -> Dict[str, Dict[str, Any]]:
        try:
            actor_stats = {}
            
            for event in self.events_data:
                actor = event.get('actor', {})
                sender = actor.get('sender')
                role = actor.get('role')
                
                if sender not in actor_stats:
                    actor_stats[sender] = {
                        'role': role,
                        'total_messages': 0,
                        'decisions_made': 0,
                        'categories': {},
                        'months_active': set(),
                        'avg_response_time': 0,
                        'key_interventions': []
                    }
                
                actor_stats[sender]['total_messages'] += 1
                
                if event.get('decision', {}).get('taken'):
                    actor_stats[sender]['decisions_made'] += 1
                    # Track key interventions
                    if event.get('why', {}).get('rationale'):
                        actor_stats[sender]['key_interventions'].append({
                            'timestamp': event.get('timestamp'),
                            'rationale': event.get('why', {}).get('rationale'),
                            'category': event.get('topic', {}).get('category')
                        })
                
                category = event.get('topic', {}).get('category')
                if category:
                    if category not in actor_stats[sender]['categories']:
                        actor_stats[sender]['categories'][category] = 0
                    actor_stats[sender]['categories'][category] += 1
                
                month = event.get('month')
                if month:
                    actor_stats[sender]['months_active'].add(month)
            
            # Convert sets to lists for JSON serialization
            for actor in actor_stats:
                actor_stats[actor]['months_active'] = sorted(list(actor_stats[actor]['months_active']))
                actor_stats[actor]['key_interventions'] = actor_stats[actor]['key_interventions'][-3:]  # Last 3
            
            return actor_stats
        except Exception as e:
            print(f"Error processing actor activity: {e}")
            return {}

    def get_member_profile(self) -> Dict[str, Any]:
        """Get member profile based on conversation data"""
        return {
            'name': 'Rohan Patel',
            'age': 46,
            'location': 'Singapore',
            'occupation': 'Regional Head of Sales - FinTech',
            'primary_goals': [
                'Reduce cardiovascular risk (family history)',
                'Enhance cognitive function and focus',
                'Implement preventive health screenings'
            ],
            'health_conditions': ['POTS/Long COVID', 'Family history of heart disease'],
            'travel_frequency': 'Weekly international travel',
            'support_team': ['PA: Sarah', 'Home chef', 'Wife supportive'],
            'wearables': ['Garmin watch', 'Whoop (added during program)', 'Considering Oura'],
            'commitment': '5 hours/week average',
            'adherence_rate': '~50% (as per program design)'
        }
