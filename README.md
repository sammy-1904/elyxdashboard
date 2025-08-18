
# 📊 Health Dashboard Project

A full-stack **health monitoring dashboard** built with **React (frontend)** and **FastAPI (backend)**.  
It visualizes health episodes, labs, training notes, and overall journey in an interactive dashboard.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Backend will now run at **http://localhost:8000**  
Interactive API docs available at **http://localhost:8000/docs**

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend will now run at **http://localhost:3000**

---

## 📌 Dashboard Overview

The dashboard is designed to give a **clear snapshot of member health episodes**:

- **Overview Card** → Member profile + key metrics  
- **Episode Card** → For each health episode:
  - Episode title & date range  
  - Last update timestamp  
  - Primary health topics (Exercise, Sleep, Nutrition, Labs, etc.)  
  - Lab notes & training notes  
  - Overall status tags (*Healthy*, *Needs Attention*, etc.)  

---

## 🛠 Tech Stack

- **Frontend**: React  
- **Backend**: FastAPI  

---

✨ That’s it! Once both servers are running, open `http://localhost:3000` in your browser to use the dashboard.  
