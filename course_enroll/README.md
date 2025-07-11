# Learning Management System (LMS)

A simple Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### For Instructors
- Create and manage courses
- View created courses
- Delete courses

### For Students
- View available courses
- Enroll in courses
- View enrolled courses
- Unenroll from courses

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd course-enrollment-system
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Running the Application

1. Start the MongoDB server:
```bash
mongod
```

2. Start the backend server (from the root directory):
```bash
npm run dev
```

3. Start the frontend development server (from the client directory):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Courses
- GET /api/courses - Get all courses
- POST /api/courses - Create a new course (Instructor only)
- GET /api/courses/my-courses - Get instructor's courses
- PUT /api/courses/:id - Update a course (Instructor only)
- DELETE /api/courses/:id - Delete a course (Instructor only)

### Enrollments
- POST /api/enrollments/:courseId - Enroll in a course (Student only)
- GET /api/enrollments/my-enrollments - Get student's enrolled courses
- DELETE /api/enrollments/:enrollmentId - Drop a course (Student only)

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication

## Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Role-based access control 