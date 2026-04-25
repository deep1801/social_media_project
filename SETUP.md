# Social Media App - Complete Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure Backend Environment

Create a `.env` file in the `server` directory (if not already present):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:3000` (or `http://localhost:5173` depending on Vite's port selection)

## Testing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account
3. Login with your credentials
4. Create posts, like posts, and add comments
5. View your profile

## Project Structure

```
mern-social-media/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)
- `GET /api/v1/auth/logout` - Logout user (protected)

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create post (protected)
- `PUT /api/v1/posts/:id` - Update post (protected)
- `DELETE /api/v1/posts/:id` - Delete post (protected)
- `PUT /api/v1/posts/:id/like` - Like post (protected)
- `PUT /api/v1/posts/:id/unlike` - Unlike post (protected)
- `POST /api/v1/posts/:id/comments` - Add comment (protected)
- `DELETE /api/v1/posts/:id/comments/:comment_id` - Delete comment (protected)

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use, you can change them:
- Frontend: Vite will automatically try the next available port
- Backend: Change `PORT` in `.env` file

### CORS Issues
Make sure the backend CORS configuration includes your frontend URL. Check `server/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### MongoDB Connection Issues
- Verify your MongoDB is running (if local)
- Check your `MONGO_URI` in `.env` file
- Ensure your IP is whitelisted (if using MongoDB Atlas)

## Building for Production

### Frontend
```bash
cd client
npm run build
```

The production build will be in `client/dist/`

### Backend
The backend is production-ready. Just set `NODE_ENV=production` in your `.env` file.

## Next Steps

- Add image upload functionality
- Implement user follow/unfollow
- Add real-time notifications
- Implement direct messaging
- Add search functionality
- Implement user profile editing
