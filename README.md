# 🍀 FloWealth

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google OAuth">
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare">
</p>

---

## 📖 About FloWealth

**FloWealth** is a modern expense tracking application that helps you manage your spending habits with intelligent AI-powered features. Plan your shopping trips, track actual purchases, and get detailed analytics about your spending patterns.

### ✨ Key Features

- 📝 **AI Note Creation** - Add notes with just an AI prompt, no manual entry needed
- 📸 **AI Receipt Scanning** - Upload receipts and let AI analyze your purchases
- 📊 **Smart Analytics** - Visualize your spending habits with detailed charts
- 🏷️ **Theme Organization** - Organize expenses by categories/themes
- 🤖 **AI Comparison** - Compare planned vs actual spending with AI insights
- 🔐 **Secure Authentication** - Google OAuth + Email/Password authentication
- 🌙 **Dark/Light Mode** - Beautiful UI in both themes

---

## 🛠️ Tech Stack

### Frontend

| Technology    | Purpose           |
| ------------- | ----------------- |
| React         | UI Library        |
| TypeScript    | Type Safety       |
| Vite          | Build Tool        |
| Tailwind CSS  | Styling           |
| HeroUI        | Component Library |
| Framer Motion | Animations        |
| Recharts      | Charts            |

### Backend

| Technology  | Purpose        |
| ----------- | -------------- |
| Node.js     | Runtime        |
| Express     | Web Framework  |
| TypeScript  | Type Safety    |
| Drizzle ORM | Database ORM   |
| JWT         | Authentication |

### Database & Infrastructure

| Technology | Purpose          |
| ---------- | ---------------- |
| PostgreSQL | Database         |
| Supabase   | Database Hosting |
| Docker     | Containerization |
| Nginx      | Reverse Proxy    |

---

## ⚙️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React + Vite  │────▶│   Express API   │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Supabase)    │
│                 │     │                 │     │   Drizzle ORM   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
   Tailwind CSS           OpenAI API
   HeroUI Components      AI Receipt Analysis
   Framer Motion         JWT Auth
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Google  │────▶│  Backend │
│          │◀────│  OAuth   │◀────│  Verify  │
└──────────┘     └──────────┘     └──────────┘
     │                                  │
     │         ┌──────────┐             │
     └────────▶│  Email   │◀────────────┘
               │   + OTP   │
               │  Verify   │
               └──────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Supabase Account
- OpenAI API Key

### Environment Variables

**Backend (.env)**

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET_KEY=your-secret-key
EMAIL_USER=your-email@gmail.com
APP_PASSWORD=your-app-password
CLOUDFLARE_SECRET_KEY=your-cloudflare-key
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/FloWealth.git
cd FloWealth

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install

# Run with Docker
docker-compose up -d
```

---

## 📱 Features Showcase

### 🏠 Landing Page

The landing page features a beautiful, animated hero section showcasing FloWealth's AI-powered expense tracking capabilities.

![Landing Page](./Readme%20gifs/landingpage.gif)

---

### 🌙 Dark/Light Mode

Switch seamlessly between dark and light themes with a beautifully animated toggle.

![Dark/Light Mode](./Readme%20gifs/darkehitemode.gif)

---

### 📝 Note Management

Create notes with just an AI prompt - just type what you need to buy and our AI parses it automatically. Add products, estimate prices, and track your planned expenses.

![Add Note](./Readme%20gifs/addnote.gif)

---

### 👁️ View Notes

View all your notes in a beautiful grid layout. Filter by completed, upcoming, or all notes.

![View Notes](./Readme%20gifs/viewnotes.gif)

---

### 🏷️ Theme Management

Organize your expenses by creating color-coded themes. Track spending across different categories.

![Add Theme](./Readme%20gifs/addtheme.gif)

---

### 📊 Analytics Dashboard

Get insights into your spending patterns with detailed analytics. See theme-based statistics and spending trends.

![Analyze Note](./Readme%20gifs/analyzenote.gif)

---

### 🤖 AI Receipt Analysis

Upload your receipt and let FloWealth's AI analyze it. Compare actual purchases with your planned note.

![Analyze Note with AI](./Readme%20gifs/analyzenotewithai.gif)

---

### ⚖️ AI-Powered Comparison

Compare multiple notes and get AI-generated insights about your spending habits and accuracy.

![Compare with AI](./Readme%20gifs/comparewithai.gif)

---

### 👤 Account Management

Manage your account settings, view token usage, and delete your account securely.

![Account Page](./Readme%20gifs/accountpage.gif)

## 📦 Project Structure

```
FloWealth/
├── README.md
├── docker-compose.yml
│
├── Backend/
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── DB/               # Database schemas
│   │   ├── middlewares/       # Auth middlewares
│   │   ├── routes/          # API routes
│   │   ├── services/         # Business logic
│   │   └── server.ts        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── Components/      # React components
│   │   ├── Context/         # React contexts
│   │   ├── Pages/           # Page components
│   │   ├── api/             # Axios setup
│   │   └── App.tsx          # Main app
│   ├── public/
│   ├── Dockerfile
│   └── package.json


```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Bcrypt Password Hashing** - Passwords never stored plain text
- **Google OAuth 2.0** - Social authentication
- **Cloudflare Turnstile** - Bot protection
- **CORS Protection** - Cross-origin request safety
- **SQL Injection Prevention** - Drizzle ORM parameterization

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

<p align="center">
  Made with ❤️ for better expense tracking
</p>
