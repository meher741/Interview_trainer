from pydantic import BaseModel
from typing import List


class QuestionRequest(BaseModel):
    role: str
    topic: str
    difficulty: str


class QuestionResponse(BaseModel):
    question: str
    difficulty: str
    expected_topics: List[str]
    hint: str
    estimated_time: str
