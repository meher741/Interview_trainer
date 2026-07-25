from pydantic import BaseModel
from typing import List


class EvaluationRequest(BaseModel):
    question: str
    expected_topics: List[str]
    answer: str


class EvaluationResponse(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]
    missing_topics: List[str]
    ideal_answer: str
    feedback: str
    confidence: str
    next_difficulty: str
