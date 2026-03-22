<div align="center">
  <h1>🎉 EventLK</h1>
  <p><strong>The Next-Generation, AI-Powered Event Management Platform  for Sri Lankan University Clubs</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Status-In%20Development-blue" alt="Status" />
    <img src="https://img.shields.io/badge/Stack-PERN-purple" alt="Tech Stack" />
    <img src="https://img.shields.io/badge/AI-Enabled-brightgreen" alt="AI Enabled" />
  </p>
</div>

---

## 📖 About The Project

**EventLK** is a comprehensive, modern web platform designed to eliminate the chaos of university event planning. Built for student committees and club organizers, EventLK centralizes everything from budgeting and team collaboration to ticketing and day-of-event attendance tracking. 

By integrating state-of-the-art AI, EventLK doesn't just record data—it actively assists organizers in making smarter financial and logistical decisions.

### 🌟 Key Features

* **🤖 AI-Powered Event Planning:** Intelligent venue suggestions and automated insights to streamline the planning phase.
* **💰 Smart LKR Budget Tracking:** Track income, sponsorships, and expenses dynamically in Sri Lankan Rupees (LKR).
* **🎫 QR Code Attendance System:** Frictionless, secure check-ins at the venue using auto-generated QR tickets.
* **👥 Real-Time Team Collaboration:** Seamlessly work with your committee members in a unified workspace.
* **🔒 Enterprise-Grade Security:** Robust JWT-based authentication, bcrypt password hashing, and strict input validation.
* **🎨 Premium UI/UX:** A sleek, dark-themed, highly responsive interface optimized for both desktop and mobile.

---

## 🛠️ Technology Stack

EventLK is built using the robust **PERN** stack, heavily separated into microservices for scalability.

* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Node.js, Express.js, PostgreSQL
* **Security:** JSON Web Tokens (JWT), bcryptjs
* **AI/ML:** XGBoost (Machine Learning models for budget/venue predictions)

---

## 📂 Repository Architecture

This project utilizes a Multi-Branch approach to maintain clean, isolated environments. 

```text
EventLK/
├── Project-Eventlk-frontend/   # Next.js User Interface (Branch: frontend)
├── Project-Eventlk-backend/    # Node.js/Express API (Branch: backend)
│   ├── src/
│   │   ├── controllers/  # Core business logic (The "Chefs")
│   │   ├── models/       # DB schemas and queries
│   │   └── routes/       # API endpoint definitions (The "Traffic Cops")
│   └── server.js         # API Entry point
└── Project-Eventlk-ai-ml/      # Python ML Models (Branch: ai-ml)