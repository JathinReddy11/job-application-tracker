from pydantic import BaseModel
from datetime import date
from typing import Optional

class JobApplicationCreate(BaseModel):
    company: str
    position: str
    application_date: Optional[date] = None
    status: Optional[str] = "Applied"
    notes: Optional[str] = None
    resume_filename: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: int
    company: str
    position: str
    application_date: Optional[date]
    status: str
    notes: Optional[str] = None
    resume_filename: Optional[str]
    class Config:
        orm_mode = True
