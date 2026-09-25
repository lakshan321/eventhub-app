# EventHub – Event Management Mobile Application

> **SLIIT SE2020 Web and Mobile Technologies Individual Assignment**  
> A clean, modular, and production-ready full-stack mobile application built with **React Native**, **Node.js + Express**, and **MongoDB Atlas**.

---

## 📱 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Database Schema & Relationships](#database-schema--relationships)
6. [Business Logic (Ticket & Seat Availability)](#business-logic-ticket--seat-availability)
7. [REST API Documentation](#rest-api-documentation)
8. [Setup & Installation Guide](#setup--installation-guide)
   - [Backend Local Setup](#1-backend-local-setup)
   - [Frontend Mobile App Setup](#2-frontend-mobile-app-setup)
9. [Deployment Guide (Render / Railway)](#deployment-guide-render--railway)
10. [Connecting Mobile App to Production Backend](#connecting-mobile-app-to-production-backend)
11. [Viva Examination Q&A Guide](#viva-examination-qa-guide)

---

## 1. Project Overview

**EventHub** allows users to:
- Register and securely log in via JWT authentication.
- Browse upcoming events with categories, search, and seat indicators.
- View detailed event information and check live ticket availability.
- Create and organize events with banner image uploads (Multer).
- Edit and delete their own events (with creator authorization checks).
- Reserve tickets with real-time seat decrement logic.
- View personal booking history as digital ticket passes.
- Cancel bookings with automatic seat restoration.

---

## 2. Technology Stack

### Mobile Frontend
- **Framework**: React Native (Expo SDK 57)
- **Language**: JavaScript (ES6+ Functional Components & React Hooks)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **API Client**: Axios (Centralized configuration with automatic JWT request interceptors)
- **Storage**: `@react-native-async-storage/async-storage` for persisting JWT and user sessions
- **Image Picker**: `expo-image-picker`

### Backend REST API
- **Runtime**: Node.js & Express.js
- **Database ODM**: Mongoose
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Security**: `bcryptjs` (Salt rounds = 10)
- **File Uploads**: `multer` with MIME type filtering and 5MB size limits
- **CORS & Environment**: `cors`, `dotenv`

---

## 3. System Architecture

```
+-------------------------------------------------------------------+
|               REACT NATIVE MOBILE FRONTEND (Expo/RN)             |
|                                                                   |
|  [Screens: Auth, Event Feed, Details, Create/Edit, Bookings]      |
|                                |                                  |
|                  Axios + AsyncStorage (JWT)                       |
+--------------------------------+----------------------------------+
                                 | HTTP / JSON (REST API)
                                 v
+-------------------------------------------------------------------+
|                   NODE.JS + EXPRESS BACKEND                       |
|                                                                   |
|   [cors, express.json, multer static uploads, errorMiddleware]   |
|                                |                                  |
|   +----------------------------+-----------------------------+    |
|   | Auth Routes (JWT/bcrypt)   | Event Routes (CRUD/Upload)  |    |
|   |                            | Booking Routes (Logic/CRUD) |    |
|   +----------------------------+-----------------------------+    |
|                                | Mongoose ODM                     |
+--------------------------------+----------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|                  MONGODB ATLAS CLOUD DATABASE                     |
|                                                                   |
|          [Users] <------- [Events] <------- [Bookings]            |
+-------------------------------------------------------------------+
```

---

## 4. Folder Structure

```
Event management system/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── eventController.js    # Event CRUD & image handling
│   │   └── bookingController.js  # Booking CRUD & seat availability logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & route protection
│   │   ├── uploadMiddleware.js   # Multer file storage & type filter
│   │   └── errorMiddleware.js    # Centralized error handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── Event.js              # Event schema with status & creator ref
│   │   └── Booking.js            # Booking schema with event & user refs
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── eventRoutes.js        # /api/events endpoints
│   │   └── bookingRoutes.js      # /api/bookings endpoints
│   ├── uploads/                  # Uploaded event banner images
│   ├── .env                      # Local environment variables
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend scripts and dependencies
│   └── server.js                 # Main server initialization
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components (Buttons, Inputs, Cards)
│   │   ├── config/
│   │   │   └── api.js            # Centralized API base URL & Axios instance
│   │   ├── context/
│   │   │   └── AuthContext.js    # Global auth provider (user, token, login, logout)
│   │   ├── navigation/
│   │   │   ├── AppNavigator.js   # Root switch between Auth & Main stacks
│   │   │   ├── AuthNavigator.js  # Login & Register stack
│   │   │   └── MainNavigator.js  # Bottom Tabs & Details stack
│   │   ├── screens/              # 11 Application Screens
│   │   │   ├── SplashScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── EventDetailsScreen.js
│   │   │   ├── CreateEventScreen.js
│   │   │   ├── EditEventScreen.js
│   │   │   ├── BookingScreen.js
│   │   │   ├── MyBookingsScreen.js
│   │   │   ├── BookingDetailsScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── utils/
│   │       └── helpers.js        # Date and status color formatting utilities
│   ├── App.js                    # Mobile application root entry
│   └── package.json              # Frontend scripts and dependencies
│
└── README.md
```

---

## 5. Database Schema & Relationships

### 1. User (`models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Hashed with bcrypt
  timestamps: true
}
```

### 2. Event (`models/Event.js`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  availableSeats: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Cancelled', 'Completed'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamps: true
}
```

### 3. Booking (`models/Booking.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  numberOfTickets: { type: Number, required: true, min: 1 },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' },
  timestamps: true
}
```

---

## 6. Business Logic (Ticket & Seat Availability)

1. **Initial State**: Upon creating an event, `availableSeats` is initialized to equal `capacity`.
2. **Reservation (Booking)**:
   - When a user requests $N$ tickets, the backend verifies:
     - `event.status === 'Active'`
     - `event.availableSeats > 0` (otherwise returns `"This event is completely sold out"`)
     - $N \le \text{availableSeats}$ (otherwise returns `"Only X seat(s) are available"`).
   - Seats are reduced safely:
     ```javascript
     event.availableSeats = Math.max(0, event.availableSeats - tickets);
     await event.save();
     ```
3. **Cancellation**:
   - When a confirmed booking is cancelled, seats are restored:
     ```javascript
     event.availableSeats = Math.min(event.capacity, event.availableSeats + booking.numberOfTickets);
     await event.save();
     ```
   - This guarantees `availableSeats` never exceeds `capacity` or becomes negative.

---

## 7. REST API Documentation

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user | `201 Created` |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT | `200 OK` |
| `GET` | `/api/auth/profile` | Private | Retrieve logged-in user profile | `200 OK` |

### Event Routes (`/api/events`)
| Method | Endpoint | Access | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Get all events | `200 OK` |
| `GET` | `/api/events/:id` | Public | Get single event details | `200 OK` |
| `POST` | `/api/events` | Private | Create event (Multer multipart image) | `201 Created` |
| `PUT` | `/api/events/:id` | Private | Update event (Creator only) | `200 OK` |
| `DELETE` | `/api/events/:id` | Private | Delete event (Creator only) | `200 OK` |

### Booking Routes (`/api/bookings`)
| Method | Endpoint | Access | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | Book tickets (with seat availability check) | `201 Created` |
| `GET` | `/api/bookings` | Private | Get current user's bookings | `200 OK` |
| `GET` | `/api/bookings/:id` | Private | Get single booking ticket pass | `200 OK` |
| `PUT` | `/api/bookings/:id` | Private | Cancel booking & restore seats | `200 OK` |
| `DELETE` | `/api/bookings/:id` | Private | Delete booking record | `200 OK` |

---

## 8. Setup & Installation Guide

### 1. Backend Local Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder (or copy from `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventhub?retryWrites=true&w=majority
   JWT_SECRET=eventhub_super_secret_jwt_key_2026
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://0.0.0.0:5000`.*

---

### 2. Frontend Mobile App Setup

1. Open a terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your backend IP in [frontend/src/config/api.js](file:///c:/Users/awala/Desktop/Event%20management%20system/frontend/src/config/api.js):
   - **Android Emulator**: `http://10.0.2.2:5000/api`
   - **Physical Phone with Expo Go**: `http://<YOUR_COMPUTER_LOCAL_IP>:5000/api` (e.g. `http://192.168.1.100:5000/api`)
   - **Web / iOS Simulator**: `http://localhost:5000/api`
4. Start Expo:
   ```bash
   npm start
   ```
5. Scan the QR code using the **Expo Go** app on your physical phone, or press `a` to run on an Android emulator or `w` for Web.

---

## 9. Deployment Guide (Render / Railway)

The backend is fully configured for deployment on **Render.com** or **Railway.app**:

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and create a **New Web Service**.
3. Connect your GitHub repository and specify the **Root Directory**: `backend`.
4. Configure Build and Start settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In the **Environment Variables** section, add:
   - `PORT`: `5000` (Render will override automatically with `process.env.PORT`)
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_secret_key`
   - `NODE_ENV`: `production`
6. Click **Deploy**. Render will deploy your service and provide a public URL like:
   `https://eventhub-backend.onrender.com`

---

## 10. Connecting Mobile App to Production Backend

Once deployed, open [frontend/src/config/api.js](file:///c:/Users/awala/Desktop/Event%20management%20system/frontend/src/config/api.js) and update the `API_BASE_URL`:

```javascript
export const API_BASE_URL = 'https://eventhub-backend.onrender.com/api';
```

Now your mobile application will communicate with your cloud backend anywhere in the world!

---

## 11. Viva Examination Q&A Guide

Be prepared to answer these key questions during your SLIIT viva:

### Q1: How does JWT Authentication work?
> **Answer**: When a user logs in with valid credentials, the server signs a JSON Web Token containing the user's ID payload using a secret key (`jwt.sign`). The client stores this token in `AsyncStorage`. On subsequent requests, the Axios interceptor automatically includes it in the HTTP `Authorization: Bearer <token>` header. The server's `authMiddleware` verifies the token's cryptographic signature using `jwt.verify` and attaches the user document to `req.user`.

### Q2: How does Bcrypt hashing protect passwords?
> **Answer**: Plaintext passwords are never stored in the database. In `models/User.js`, a Mongoose `pre('save')` hook intercepts the user before saving, generates a random salt with 10 rounds (`bcrypt.genSalt(10)`), and hashes the password (`bcrypt.hash`). When logging in, `bcrypt.compare` re-hashes the incoming password with the stored salt to determine if they match, without ever decrypting the password.

### Q3: How are Event and Booking related in the database?
> **Answer**: We use referenced relationships via MongoDB `ObjectId`:
> - `Event.createdBy` references `User._id`
> - `Booking.userId` references `User._id`
> - `Booking.eventId` references `Event._id`  
> In Mongoose queries, we use `.populate('eventId')` and `.populate('userId')` to fetch full relational details in a single query.

### Q4: How is seat availability calculated safely?
> **Answer**: Before confirming a booking, the backend checks `tickets <= event.availableSeats`. If valid, it subtracts the tickets using `event.availableSeats = Math.max(0, event.availableSeats - tickets)`. If a user cancels their booking, the seats are restored using `Math.min(event.capacity, event.availableSeats + booking.numberOfTickets)`. This ensures available seats can neither drop below zero nor exceed the venue capacity.

### Q5: How does Multer handle image uploads?
> **Answer**: `uploadMiddleware.js` uses `multer.diskStorage` to save uploaded files into the `uploads/` directory. Each file is given a unique timestamped name (`event-${Date.now()}-${random}.ext`). A file filter verifies that the MIME type is JPEG, PNG, or WEBP, and enforces a 5MB size limit. The resulting filename is stored in MongoDB, and the `backend/uploads` directory is served statically using `express.static()`.
