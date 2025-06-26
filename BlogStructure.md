# Modern Blog Platform - Complete Project Structure

```
modern-blog-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── cloudinary.js
│   │   │   └── passport.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   └── interactionController.js
│   │   ├── middleware/
│   │   │   ├── authController.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Comment.js
│   │   │   └── Follow.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── interactionRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   └── App.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── locales/
│   │       ├── en/
│   │       │   └── translation.json
│   │       └── de/
│   │           └── translation.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── blog/
│   │   │   ├── common/
│   │   │   ├── editor/
│   │   │   ├── layout/
│   │   │   └── profile/
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

## Tech Stack Overview

### Frontend
- **React.js** - UI framework
- **Tailwind CSS + DaisyUI** - Styling and theme system
- **TipTap** - Rich text editor
- **React Query** - Data fetching and caching
- **React Router** - Routing
- **react-i18next** - Internationalization
- **Axios** - HTTP client

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Passport.js** - OAuth integration
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Development Tools
- **Concurrently** - Run frontend and backend together
- **Nodemon** - Auto-restart server
- **ESLint + Prettier** - Code formatting
