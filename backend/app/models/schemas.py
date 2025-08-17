from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Actor(BaseModel):
    sender: str
    role: str

class Travel(BaseModel):
    flag: bool = False
    region: Optional[str] = None
    location: Optional[str] = None

class Topic(BaseModel):
    category: str
    subtype: Optional[str] = None
    biomarkers: List[str] = Field(default_factory=list)

class Metrics(BaseModel):
    bp: Optional[str] = None
    sleep_hours: Optional[Any] = None
    hrv_flag: bool = False
    adherence_pct: Optional[int] = None

class TrainingFlags(BaseModel):
    zone2: bool = False
    strength: bool = False
    intervals: bool = False
    exercise_refresh: bool = False
    diagnostic_event: bool = False

class NutritionFlags(BaseModel):
    note: bool = False
    supplements: bool = False
    medication: bool = False

class Issues(BaseModel):
    msk: bool = False
    sleep_travel: bool = False

class Content(BaseModel):
    summary: List[str] = Field(default_factory=list)
    details: str = ""
    recommendations: str = ""

class Decision(BaseModel):
    taken: bool = False
    followup_date: Optional[str] = None

class Why(BaseModel):
    rationale: Optional[str] = None
    expected_outcome: Optional[str] = None
    priority: Optional[str] = None
    confidence: str = "Medium"

class Event(BaseModel):
    id: str
    timestamp: str
    month: int
    week: int
    timezone: str
    travel: Travel
    actor: Actor
    topic: Topic
    metrics: Metrics
    training_flags: TrainingFlags
    nutrition_flags: NutritionFlags
    issues: Issues
    content: Content
    decision: Decision
    why: Why

class JourneyResponse(BaseModel):
    events: List[Event]
    aggregates: Dict[str, Any]
    timelines: Dict[str, Any]
    decisions: List[Dict[str, Any]]

class MemberProfile(BaseModel):
    name: str
    age: int
    location: str
    goals: List[str]
    health_conditions: List[str]
