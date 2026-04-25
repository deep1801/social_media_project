# Social Media App - Frontend

Modern social media application built with React, Vite, and Tailwind CSS.

## Features

- 🔐 User authentication (login/register)
- 📝 Create, read, update, delete posts
- ❤️ Like/unlike posts
- 💬 Comment on posts
- 👤 User profiles
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── PostCard.jsx
│   │   └── CreatePost.jsx
│   ├── context/          # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   └── Profile.jsx
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api/v1/`

Endpoints used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `GET /auth/logout` - Logout user
- `GET /posts` - Get all posts
- `POST /posts` - Create a post
- `PUT /posts/:id/like` - Like a post
- `PUT /posts/:id/unlike` - Unlike a post
- `POST /posts/:id/comments` - Add a comment
- `DELETE /posts/:id/comments/:comment_id` - Delete a comment
- `DELETE /posts/:id` - Delete a post

## Environment Variables

The app uses Vite's proxy configuration to forward API requests to the backend server. No additional environment variables are required for development.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
