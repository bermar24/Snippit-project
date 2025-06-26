# Modern Blog Platform

A feature-rich, modern blogging platform built with React.js and Node.js, offering a comprehensive set of features for content creation, social interaction, and user engagement.

## 🚀 Features

### User Features
- **Authentication & Authorization**
  - Email/password registration and login
  - Google OAuth integration
  - Password reset functionality
  - JWT-based authentication

- **Content Management**
  - Rich text editor (TipTap) for creating posts
  - Draft and publish functionality
  - Categories and tags
  - Featured images with Cloudinary integration
  - SEO-friendly URLs

- **Social Features**
  - Follow/unfollow users
  - Like and bookmark posts
  - Nested comments with replies
  - User profiles with bio and avatar

- **Discovery & Search**
  - Full-text search across posts
  - Filter by category, tags, and author
  - Trending posts
  - Personalized recommendations

- **Personalization**
  - Multiple theme options (Light, Dark, Blue, Green, Purple)
  - Custom theme creator
  - Multi-language support (English & German)
  - User preferences

### Technical Features
- **Frontend**
  - Responsive design with Tailwind CSS & DaisyUI
  - Smooth animations with Framer Motion
  - Optimistic UI updates
  - Client-side caching with React Query
  - Internationalization with i18next

- **Backend**
  - RESTful API with Express.js
  - MongoDB with Mongoose ODM
  - Image uploads to Cloudinary
  - Rate limiting and security headers
  - Input validation and sanitization

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router v6
- React Query (TanStack Query)
- Tailwind CSS + DaisyUI
- TipTap Editor
- Framer Motion
- i18next
- Axios
- React Icons

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Cloudinary (Image Storage)
- Bcrypt.js
- Express Validator

## 📋 Prerequisites

- Node.js 16.x or higher
- MongoDB 4.x or higher
- Cloudinary account
- Google OAuth credentials (optional)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/modern-blog-platform.git
   cd modern-blog-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Backend (.env in /backend):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/modern-blog-platform
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=http://localhost:3000
   ```

   Frontend (.env in /frontend):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Update MONGODB_URI in your backend environment

## 📁 Project Structure

```
modern-blog-platform/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── App.js         # Express app setup
│   ├── server.js          # Server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── locales/       # Translation files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json
├── README.md
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/:slug` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (author only)
- `DELETE /api/posts/:id` - Delete post (author only)
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/image` - Upload featured image

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/stats` - Get user statistics
- `PUT /api/users/follow/:id` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get following users
- `PUT /api/users/bookmark/:postId` - Bookmark post
- `POST /api/users/avatar` - Upload avatar

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `PUT /api/comments/:id/like` - Like comment

### Interactions
- `GET /api/interactions/trending` - Get trending posts
- `GET /api/interactions/recommendations` - Get recommendations
- `GET /api/interactions/tags/popular` - Get popular tags
- `GET /api/interactions/analytics/post/:id` - Get post analytics

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Your Name - Full Stack Developer
- Team Member 2 - Frontend Developer
- Team Member 3 - Backend Developer
- Team Member 4 - UI/UX Designer

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS and DaisyUI teams
- All open-source contributors
