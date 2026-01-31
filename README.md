# E-Library Telkom

A premium digital library management system built with Next.js (Frontend) and Express.js (Backend).

## 🚀 Features

- **Book Catalog Management**: Full CRUD for books with advanced filtering (Jenjang, Kurikulum, Mapel, etc.)
- **Advanced Uploads**:
  - Local file upload for Covers and PDF Books.
  - **Remote Download**: Input external URLs and the server will download & store the file automatically.
  - **Real-time Progress Indicator**: See download percentage with a sleek progress bar.
  - **Premium Preview System**: Instant thumbnail preview for covers and file icons for PDFs using secure signed URLs.
- **Premium UI/UX**:
  - Modern dashboard design with glassmorphism and subtle animations.
  - Searchable selection components with checkbox indicators.
  - Fully responsive layout for all devices.
- **Security**:
  - JWT Authentication for secure API access.
  - Role-based authorization (Superadmin, etc.).
  - Signed URLs for unauthorized-file-viewing protection.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Server**: Node.js / Express.js
- **Database**: MySQL (using `mysql2/promise`)
- **File Handling**: Multer & Axios (for remote download)
- **Auth**: JsonWebToken & Bcryptjs

## 📦 Getting Started

### Prerequisites
- Node.js installed
- MySQL Server

### 1. Database Setup
Create a database named `telkom-punya` and configure your credentials in the `.env` file inside the `server` directory.

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

## 📂 Project Structure
- `src/`: Next.js frontend source code.
- `server/`: Express.js backend source code.
- `public/`: Static assets and uploaded files.

## 📄 License
This project is private and intended for Telkom internal use.
