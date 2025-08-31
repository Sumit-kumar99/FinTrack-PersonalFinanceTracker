# 📊 FinTrack – Personal Finance Tracker

A full-stack **Personal Finance Tracking Application** built with **Spring Boot (Java)** for backend and **React (Vite + Tailwind)** for frontend.  
Users can **register, log in, manage transactions (income & expenses), categorize them, upload receipts (OCR parsing), and view summaries (daily, category-wise, overall)**.

---

## 🚀 Features
- 🔑 **Authentication & Security**
  - User registration & login with **JWT authentication**
  - Password encryption using **BCrypt**

- 💸 **Transaction Management**
  - Add Income & Expense
  - Pagination & Filtering by date
  - Attach categories (Food, Rent, Salary, etc.)

- 📂 **Receipt Upload**
  - Upload **images** (parsed with Tesseract OCR via `tess4j`)
  - Upload **PDFs** (parsed with Apache PDFBox)
  - Auto-create transactions from extracted text

- 📊 **Summaries & Reports**
  - Day-wise summary
  - Category-wise breakdown
  - Overall statistics

- 🎨 **Frontend (React + Tailwind)**
  - Login/Register forms
  - Dashboard with charts & summaries
  - Add new entries
  - Transaction list with pagination
  - Responsive modern UI

---

## 🏗️ Project Structure
FinTrack-PersonalFinanceTracker/
│── backend/ # Spring Boot backend (Java)
│ ├── src/main/java/com/sumit/finance/
│ │ ├── controller/ # REST controllers
│ │ ├── service/ # Business logic
│ │ ├── model/ # Entities (User, Transaction, Category)
│ │ ├── repository/ # Spring Data JPA Repos
│ │ └── security/ # JWT & Security config
│ └── pom.xml # Maven config

│── frontend/ # React frontend (Vite + Tailwind)
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── App.jsx # Main React app
│ │ └── index.jsx # Entry point
│ ├── package.json
│ └── vite.config.js

│── README.md

yaml
Copy code

---

## ⚙️ Tech Stack
### Backend
- Java 17+
- Spring Boot 3 (Spring Security, Spring Data JPA, JWT)
- MySQL / PostgreSQL
- Hibernate
- tess4j (OCR), Apache PDFBox

### Frontend
- React (Vite)
- TailwindCSS
- Recharts (for charts/graphs)

---

## ▶️ Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/Sumit-kumar99/FinTrack-PersonalFinanceTracker.git
cd FinTrack-PersonalFinanceTracker
2️⃣ Backend Setup
bash
Copy code
cd backend
mvn clean install
mvn spring-boot:run
Backend runs at: http://localhost:8080

✅ Update application.properties with your DB credentials.

3️⃣ Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173

🔑 API Endpoints
Auth
POST /api/auth/register → Register new user

POST /api/auth/authenticate → Login & get JWT

Transactions
POST /api/transactions → Add transaction

GET /api/transactions?page=0&size=10 → Paginated list

POST /api/transactions/upload-receipt → Upload receipt

Summary
GET /api/summary → Overall summary

GET /api/summary/by-category → Category-wise summary

GET /api/summary/by-day → Daily summary


📜 License
MIT License © 2025 Sumit Kumar
