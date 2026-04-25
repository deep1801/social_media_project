# 🚀 Quick Start Guide

## Option 1: Automatic Start (Windows)

Double-click `start.bat` to automatically install dependencies and start both servers.

## Option 2: Manual Start

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend Server
```bash
cd client
npm install
npm run dev
```

## 📱 Access the App

- **Frontend**: http://localhost:3000 (or http://localhost:5173)
- **Backend API**: http://localhost:5000

## 🔑 First Steps

1. **Register** a new account
2. **Login** with your credentials
3. **Create** your first post
4. **Like** and **comment** on posts
5. **View** your profile

## 📝 Features

✅ User Authentication (Register/Login)  
✅ Create Posts (up to 500 characters)  
✅ Like/Unlike Posts  
✅ Comment on Posts  
✅ Delete Your Posts & Comments  
✅ User Profile View  
✅ Responsive Design  
✅ Modern UI with Tailwind CSS  

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

**Backend:**
- Node.js
- Express
- MongoDB
- JWT Auth
- bcryptjs

## 📚 Documentation

- Full setup guide: `SETUP.md`
- Client README: `client/README.md`
- Main README: `README.md`

## ⚙️ Environment Setup

Make sure your `server/.env` file has:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

## 🐛 Common Issues

**Port already in use?**
- Backend: Change PORT in `.env`
- Frontend: Vite will auto-select next port

**MongoDB connection failed?**
- Check if MongoDB is running
- Verify MONGO_URI in `.env`

**CORS errors?**
- Ensure backend CORS includes your frontend URL
- Check `server/server.js` line 25-28

## 🎨 UI Components

The app includes pre-built components:
- `Navbar` - Navigation with user menu
- `PostCard` - Display posts with like/comment
- `CreatePost` - Post creation form
- `Login/Register` - Auth pages
- `Profile` - User profile page

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token sent with API requests
4. Protected routes check authentication
5. Auto-redirect based on auth status

## 📦 Build for Production

```bash
# Frontend
cd client
npm run build

# Backend
# Set NODE_ENV=production in .env
```

---

**Happy Coding! 🎉**
