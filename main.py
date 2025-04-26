from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, JobApplication
import schemas
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
from fastapi.staticfiles import StaticFiles
import os
from fastapi import HTTPException
from schemas import JobApplicationCreate


app = FastAPI()
app.mount("/resumes", StaticFiles(directory="resumes"), name="resumes")
# Add this block below FastAPI app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Tracker API!"}

# 1. Create a Job
@app.post("/jobs/", response_model=schemas.JobApplicationResponse)
def create_job(job: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    db_job = JobApplication(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

# 2. Get All Jobs
@app.get("/jobs/", response_model=list[schemas.JobApplicationResponse])
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobApplication).all()
    return jobs

# 3. Update Job Status
@app.put("/jobs/{job_id}", response_model=schemas.JobApplicationResponse)
def update_job(job_id: int, updated_job: schemas.JobApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for var, value in vars(updated_job).items():
        setattr(job, var, value) if value else None
    db.commit()
    db.refresh(job)
    return job

# 4. Delete a Job
@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@app.post("/upload_resume/{job_id}")
def upload_resume(job_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Save file locally (for now)
    file_location = f"resumes/{job_id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Update the job with resume filename
    job.resume_filename = file_location
    db.commit()
    db.refresh(job)

    return {"message": "Resume uploaded successfully", "resume_filename": file_location}

import os

@app.delete("/delete_resume/{job_id}")
def delete_resume(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.resume_filename and os.path.exists(job.resume_filename):
        os.remove(job.resume_filename)

    job.resume_filename = None
    db.commit()
    db.refresh(job)

    return {"message": "Resume deleted successfully"}

@app.put("/jobs/{job_id}")
def update_job(job_id: int, updated_job: JobApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.company = updated_job.company
    job.position = updated_job.position
    job.application_date = updated_job.application_date
    job.status = updated_job.status
    job.notes = updated_job.notes
    job.resume_filename = updated_job.resume_filename  # Optional if you want

    db.commit()
    db.refresh(job)

    return job