# MERN Social Media App

A full-stack social media application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring user authentication, posts, likes, and comments.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete posts
- Like and unlike posts
- Add and delete comments on posts
- User profiles with avatars
- Responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mern-social-media.git
   cd mern-social-media
   ```

2. Install dependencies for both server and client:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRE=30d
     NODE_ENV=development
     ```

## Running the Application

1. Start the development server:
   ```bash
   # Run both client and server
   npm run dev
   
   # Or run them separately
   # In one terminal:
   cd server && npm run server
   # In another terminal:
   cd client && npm start
   ```

2. Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/logout` - Logout user

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create a post
- `PUT /api/v1/posts/:id` - Update a post
- `DELETE /api/v1/posts/:id` - Delete a post
- `PUT /api/v1/posts/:id/like` - Like a post
- `PUT /api/v1/posts/:id/unlike` - Unlike a post
- `POST /api/v1/posts/:id/comments` - Add a comment
- `DELETE /api/v1/posts/:id/comments/:comment_id` - Delete a comment

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend (Client)
- React.js
- Redux for state management
- React Router for navigation
- Axios for HTTP requests
- Material-UI for UI components

## Project Structure

```
mern-social-media/
├── client/                  # Frontend (React)
│   ├── public/             
│   └── src/
│       ├── assets/         # Images, icons, etc.
│       ├── components/     # Reusable UI components
│       ├── context/        # React context
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
│
├── server/                 # Backend (Node.js/Express)
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
│
├── .gitignore
└── package.json
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project was built as part of a learning experience with the MERN stack.
- Special thanks to the open-source community for all the amazing libraries and tools.
