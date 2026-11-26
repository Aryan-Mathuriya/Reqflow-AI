from pydantic import BaseModel
from typing import List


class ProjectObjective(BaseModel):
    objective: str


class ProjectFeature(BaseModel):
    feature: str
    description: str
    priority: str


class TechnicalRequirement(BaseModel):
    requirement: str
    category: str


class TechnologyRecommendation(BaseModel):
    technology: str
    purpose: str
    reason: str


class ProjectMilestone(BaseModel):
    milestone: str
    duration: str
    deliverables: List[str]


class ClarificationQuestion(BaseModel):
    question: str
    reason: str


class RequirementAnalysis(BaseModel):
    project_name: str
    project_summary: str

    objectives: List[ProjectObjective]

    functional_requirements: List[ProjectFeature]
    non_functional_requirements: List[ProjectFeature]

    technical_requirements: List[TechnicalRequirement]

    recommended_stack: List[TechnologyRecommendation]

    milestones: List[ProjectMilestone]

    clarification_questions: List[ClarificationQuestion]