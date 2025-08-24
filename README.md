# RSVP Event Attendance System

A full-stack web application for managing events and RSVPs, built with React.js frontend and Node.js/Express.js backend. Users can create events, RSVP to attend, and manage their event participation.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure signup, login, and profile management
- **Event Management**: Create, edit, and delete events
- **RSVP System**: Mark attendance for events with real-time updates
- **User Profiles**: View and manage personal information and event history
- **Responsive Design**: Mobile-friendly interface with modern UI

### User Experience
- **Real-time Updates**: Instant feedback for RSVP actions
- **Toast Notifications**: User-friendly success/error messages
- **Image Upload**: Profile picture management with Cloudinary integration
- **Event Discovery**: Browse upcoming events with filtering
- **Attendance Tracking**: Monitor events you're hosting or attending

## 🛠️ Tech Stack

### Frontend
- **React.js 18.3.1** - Modern React with hooks and context
- **React Router DOM 6.23.1** - Client-side routing
- **React Icons 5.2.1** - Icon library for UI elements
- **React Toastify 10.0.5** - Toast notification system
- **Bootstrap** - Responsive CSS framework
- **CSS3** - Custom styling and animations

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 4.19.2** - Web application framework
- **MongoDB 8.4.1** - NoSQL database with Mongoose ODM
- **JWT 9.0.2** - JSON Web Token authentication
- **bcryptjs 2.4.3** - Password hashing and salting
- **Multer 1.4.5** - File upload middleware
- **Cloudinary 1.41.3** - Cloud image storage and management
- **CORS 2.8.5** - Cross-origin resource sharing
- **Express Validator 7.1.0** - Input validation and sanitization

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB database
- **Mongoose** - MongoDB object modeling for Node.js

### Deployment
- **Render** - Backend hosting platform
- **Netlify/Vercel** - Frontend hosting (recommended)

## 📁 Project Structure

```
rsvp/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── App.js           # Main application component
│   │   └── index.js         # Application entry point
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── config/              # Configuration files
│   ├── middlewares/         # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API route handlers
│   ├── uploads/             # File upload directory
│   ├── server.js            # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (free tier available)
- **Cloudinary** account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ujjwi/rsvp.git
   cd rsvp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the `backend/` directory:
   ```env
   # MongoDB Configuration
   mongo_username=your_mongodb_username
   mongo_password=your_mongodb_password
   
   # JWT Configuration
   secret_key=your_jwt_secret_key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Server Configuration
   PORT=5000
   ```

5. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Update the `mongo_username` and `mongo_password` in your `.env` file

6. **Cloudinary Setup**
   - Sign up for a free Cloudinary account
   - Get your cloud name, API key, and API secret
   - Update the Cloudinary credentials in your `.env` file

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /createuser` - User registration
- `POST /login` - User login
- `GET /getuser/:id` - Get user profile
- `PUT /updateuser` - Update user profile

### Event Routes (`/api/event`)
- `GET /getallevents` - Get all upcoming events
- `GET /getallevents/:id` - Get event by ID
- `POST /addevent` - Create new event
- `PUT /updateevent/:id` - Update event
- `DELETE /deleteevent/:id` - Delete event
- `POST /attendevent/:id` - RSVP to event
- `POST /unattendevent/:id` - Cancel RSVP
- `GET /eventsvisiting` - Get user's attending events
- `GET /eventshosting` - Get user's hosting events

## 🎯 Key Features Implementation

### Event Management
- **Create Events**: Users can create events with title, description, start/end times, and location
- **Edit Events**: Event creators can modify event details
- **Delete Events**: Event creators can remove their events
- **Event Discovery**: Browse all upcoming events with real-time filtering

### RSVP System
- **Attend Events**: Users can RSVP to events they want to attend
- **Cancel RSVP**: Users can cancel their attendance
- **Attendance Tracking**: Real-time updates of event attendance
- **Event History**: Track events you're hosting or attending

### User Management
- **Secure Authentication**: JWT-based authentication with password hashing
- **Profile Management**: Update personal information and profile pictures
- **Image Upload**: Cloudinary integration for profile picture storage
- **Session Management**: Persistent login sessions

## 🚀 Deployment

### Backend Deployment (Render)
1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy the Node.js service

### Frontend Deployment (Netlify/Vercel)
1. Build the production version: `npm run build`
2. Deploy the `build/` folder to your preferred hosting service
3. Update the backend URL in your frontend code to point to your deployed backend

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Cross-origin resource sharing configuration
- **File Upload Security**: File type and size validation

Run tests with:
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Ujjwal Raj**
- GitHub: [@your-username](https://github.com/ujjwi)
- LinkedIn: [Your LinkedIn](https://leetcode.com/u/ujjwal018/)

## 🙏 Acknowledgments

- React.js community for the amazing framework
- MongoDB Atlas for the cloud database service
- Cloudinary for image storage solutions
- Express.js team for the robust backend framework

---

**Happy Event Planning! 🎉**