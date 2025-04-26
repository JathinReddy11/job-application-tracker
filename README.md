### Job appliacation Tracker

Track your job applications easily!  
Upload resumes, manage application status, and visualize your progress with live charts.

---

## Features

- Add, edit, and delete job applications
- Upload, view, and delete resumes (PDF)
- Search and filter by company name, position, and status
- Visualize application status using Pie Chart and Bar Chart
- Export all job applications to CSV
- Clean and responsive UI with TailwindCSS
- FastAPI-powered backend with SQLite database

---

## Tech Stack

- **Frontend:** HTML, TailwindCSS, JavaScript
- **Backend:** FastAPI, SQLAlchemy
- **Database:** SQLite
- **Charting:** Chart.js
- **Other:** Fetch API, Responsive Design

---

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/JathinReddy11/job-application-tracker.git
cd job-application-tracker

### 2. Set up the Backend (FastAPI + SQLite)

Create a virtual environment:

```bash
python -m venv venv


# Activate the virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy

# Start the FastAPI server
uvicorn main:app --reload
Backend runs at http://127.0.0.1:8000
API Documentation available at http://127.0.0.1:8000/docs

### 3. Set up the Frontend (HTML + Tailwind + JS)
Open frontend/index.html manually in your browser.
Use Live Server extension in VS Code for hot reload experience.

#Author
Jathin Reddy Baddam
