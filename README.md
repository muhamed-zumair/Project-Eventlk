<div align="center">
  
  <h1>⚙️ EventLK API (Backend Service)</h1>
  <p><strong>The robust, secure, and scalable RESTful API powering the EventLK platform.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/JWT-Black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT Security" />
  </p>

</div>

---

## 🧠 Overview

This repository contains the backend infrastructure for **EventLK**. It acts as the central hub, managing all business logic, database transactions, user authentication, and third-party AI integrations. 

Built on a strict **MVC (Model-View-Controller)** architecture, this API is designed to be highly modular, making it easy for multiple developers to add features without causing merge conflicts.

---

## 🛠️ Core Technologies

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (with `pg` driver)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
* **Security & Middleware:** CORS, Express JSON parser, strict Regex input validation

---

## 📂 Architecture & Folder Structure

We follow a professional separation of concerns to keep the codebase clean and maintainable.

```text
Project-Eventlk-backend/
├── src/
│   ├── config/         # Database connections and environment setups
│   ├── controllers/    # Core business logic and request validation (The "Chefs")
│   ├── middleware/     # Custom JWT protection and error handling logic
│   ├── models/         # PostgreSQL database schemas and queries
│   └── routes/         # API endpoint definitions (The "Traffic Cops")
├── .env                # Secret environment variables (Ignored by Git)
├── package.json        # Project dependencies and scripts
└── server.js           # Main application entry point
