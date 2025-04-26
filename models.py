from sqlalchemy import Column, Integer, String, Date
from database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    application_date = Column(Date)
    status = Column(String, default="Applied")  # Applied, Interview, Offer, Rejected
    notes = Column(String)
    resume_filename = Column(String, nullable=True)  # 👈 Add this
