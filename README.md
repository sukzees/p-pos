<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# P POS System

ระบบ Point of Sale (POS) สำหรับร้านอาหาร สร้างด้วย React + TypeScript + Vite + Firebase

## ✨ Features

- 🍽️ จัดการเมนูอาหารและหมวดหมู่
- 🪑 จัดการโต๊ะและโซน
- 📦 จัดการสต็อกวัตถุดิบ
- 🛒 ระบบ POS สำหรับรับออเดอร์
- 👨‍🍳 หน้าจอครัวและบาร์
- 📊 รายงานยอดขาย
- 👥 จัดการลูกค้าและ Loyalty Program
- 🎫 ระบบโปรโมชั่นและคูปอง
- 📱 รองรับ Self-Order สำหรับลูกค้า

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm หรือ yarn
- Firebase account (สำหรับ production)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd p-pos

# Install dependencies
npm install

# Run locally (with mock data)
npm run dev
```

## 🔥 Firebase Setup (Production)

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Add project"** → ตั้งชื่อ project → สร้าง
3. ไปที่ **Project Settings** > **General**
4. ใน "Your apps" คลิก Web icon (`</>`)
5. ตั้งชื่อ app → **Register app**
6. Copy config ที่ได้

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลัก:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. เปิดใช้งาน Firestore

1. ไปที่ **Firestore Database** > **Create database**
2. เลือก **Start in test mode** (สำหรับ development)
3. เลือก location ที่ใกล้ที่สุด

### 4. Deploy to Firebase Hosting

```bash
# Install Firebase CLI (ครั้งแรก)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (เลือก project)
firebase init

# Build and Deploy
npm run deploy
```

หรือ deploy แบบแยกขั้นตอน:

```bash
npm run build
firebase deploy --only hosting
```

## 📁 Project Structure

```
p-pos/
├── components/          # Reusable UI components
├── context/
│   └── StoreContext.tsx # Global state management + Firebase sync
├── pages/
│   ├── admin/          # Admin dashboard pages
│   └── client/         # Customer-facing pages
├── services/
│   ├── firebase.ts     # Firebase configuration
│   ├── firestoreService.ts # Database operations
│   └── mockData.ts     # Initial/mock data
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── vite.config.ts      # Vite configuration
```

## 🔐 Default Login

| Username | Password | Role    |
|----------|----------|---------|
| admin    | 123      | Admin   |
| manager  | 123      | Manager |
| staff    | 123      | Staff   |
| kitchen  | 123      | Kitchen |

> ⚠️ **หมายเหตุ**: เปลี่ยนรหัสผ่านก่อนใช้งานจริง!

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build and deploy to Firebase |

## 📝 Notes

- หากไม่ได้ตั้งค่า Firebase จะใช้ข้อมูลจำลอง (mock data) แทน
- ข้อมูลทั้งหมดจะ sync แบบ real-time เมื่อเชื่อมต่อ Firebase
- Orders และ Tables มี real-time listeners สำหรับ sync ระหว่างอุปกรณ์

## 📄 License

MIT License

---

Built with ❤️ using React, TypeScript, Vite, and Firebase
