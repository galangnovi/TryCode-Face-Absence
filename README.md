# 👁️ Face Attendance System (Next.js Project)

The **Face Attendance System** is a web-based application built with **Next.js** that allows users to **check in and check out using face detection technology**.  
It’s designed to provide a modern and secure attendance solution using browser-based camera access and AI-powered face recognition.

---

## 🧠 Overview

This project was created as a **personal learning exercise** to explore how **Next.js**, **face detection**, and **attendance management** can be integrated into a single fullstack application.  
It demonstrates how to capture webcam input, detect and recognize faces, and record attendance data (check-in/check-out) efficiently.

---

## ✨ Features

- 👤 **Face Detection & Recognition** — identify users directly from webcam  
- 🕒 **Check-In / Check-Out Tracking** — records real-time attendance  
- 📅 **Attendance History** — view daily and historical logs  
- 🔐 **Authentication System** — secure login and user sessions  
- ⚙️ **Admin Dashboard** — manage users and attendance data  
- 📸 **Real-Time Camera Feed** — using browser media API and TensorFlow.js  

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend Framework** | Next.js |
| **Face Detection** | face-api.js |
| **Styling** | Tailwind CSS |
| **Database** |  Supabase |
| **Deployment** | Vercel (Frontend)|

---

## ⚙️ Requirements

Before running the app, make sure you have:

- **Node.js** ≥ 18  
- **npm** or **yarn**  
- **Supabase account** *(optional, for hosted database)*  
- Webcam access (for testing face detection)

---

## 🚀 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/galangnovi/TryCode-Face-Absence.git
cd TryCode-Face-Absence
```

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env.local file in the root directory:

# Database / API
DATABASE_URL=your_postgresql_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Supabase (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

4️⃣ Run the Development Server
npm run dev


Your app will run at:
👉 http://localhost:3000

🧩 Face Detection Setup

This app uses TensorFlow.js or face-api.js to detect and recognize faces directly in the browser.

👁️ Using face-api.js

Load pre-trained models in the public/models/ directory (e.g. face_recognition_model, ssd_mobilenetv1).

Initialize model on page load:

await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
await faceapi.nets.faceRecognitionNet.loadFromUri('/models')


Use the webcam feed for detection:

const video = document.getElementById('video')
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream })


Compare detected faces against stored embeddings in the database to verify user identity.

🕒 Attendance Flow
User Opens App
   │
   ▼
Camera Activates (WebRTC)
   │
   ▼
Face Detected → Compare with Stored Data
   │
   ├──> Match Found → Record Check-In / Check-Out
   └──> No Match → Display Error Message
   │
   ▼
Attendance Saved to Database
   │
   ▼
Admin Dashboard Updated in Real-Time




💬 Notes

This is a learning project, built to simulate a real-world face attendance application.
It can be extended with:
------------------------

Attendance analytics and reporting dashboard
