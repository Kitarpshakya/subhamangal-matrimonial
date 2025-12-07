# Shubhmangal Matrimonial Platform

A modern matrimonial matching platform built with React, Firebase, and intelligent match-finding capabilities.

## Project Overview

Shubhmangal is a matrimonial application designed to help users find compatible life partners based on their preferences. The platform includes user registration, profile management, intelligent matching through an AI-powered chatbot, and comprehensive admin controls.

## Technology Stack

### Frontend
- **React** 19.0.0 with React Router DOM 7.5.1
- **Vite** 7.2.2 (build tool with HMR)
- **Tailwind CSS** 3.4.17 for styling
- **Radix UI** (40+ accessible components)
- **shadcn/ui** component library
- **Lucide React** icons (507.0)
- **React Hook Form** 7.56.2 with **Zod** 3.24.4 validation
- **Sonner** 2.0.3 for toast notifications

### Backend & Services
- **Firebase** 12.6.0
  - Firebase Authentication (email/password)
  - Cloud Firestore (NoSQL database)
- **Cloudinary** 2.8.0 for image hosting & optimization
- **Axios** 1.8.4 for HTTP requests

## Project Structure

```
subhamangal-matrimonial/
├── src/
│   ├── pages/                    # Main page components
│   │   ├── Home.jsx             # Landing page with match finding intro
│   │   ├── SignUp.jsx           # User registration with biodata form
│   │   ├── SignIn.jsx           # Login page
│   │   ├── Profile.jsx          # User profile view/edit + admin notes
│   │   ├── Matches.jsx          # Match results display
│   │   └── AdminDashboard.jsx   # Admin profile management panel
│   ├── components/
│   │   ├── Header.jsx           # Navigation header
│   │   ├── ChatBot.jsx          # AI-powered preference questionnaire
│   │   ├── Register.jsx         # Payment/registration modal
│   │   └── ui/                  # Radix UI component library (40+ components)
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── firebase/
│   │   ├── config.js            # Firebase initialization
│   │   └── firebaseService.js   # Firebase operations (auth, Firestore)
│   ├── services/
│   │   └── cloudinaryService.js # Image upload & optimization
│   ├── hooks/
│   │   └── use-toast.js         # Toast notification hook
│   ├── lib/
│   │   └── utils.js             # Utility functions
│   ├── App.jsx                  # Main app with routing
│   └── index.jsx                # React DOM entry point
├── public/                      # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## Key Features

### 1. Authentication System
- Email/password signup with comprehensive biodata form
- Sign-in with admin role detection
- Protected routes for authenticated users and admins
- Session persistence via Firebase Auth

### 2. Profile Management
- Comprehensive biodata creation (name, age, gender, location, caste, hobbies, etc.)
- Profile photo upload via Cloudinary with compression
- Profile status tracking: pending → approved → rejected → married
- Edit capabilities for admin users
- Admin notes system with timestamps

### 3. Intelligent Matching System (ChatBot)
- Multi-step questionnaire interface
- Questions cover: preferred gender, age group, city, hobbies
- Real-time filtering based on user preferences
- Results from approved profiles only
- Results stored in sessionStorage

### 4. Matches Display
- Grid view of potential matches (responsive 3-column layout)
- Privacy protection: anonymized names, dummy avatars
- Shows: age, location, gender, hobbies (first 3)
- "Express Interest" functionality (see Interest Tracking)

### 5. Admin Dashboard
- Comprehensive profile management interface
- Stats cards: Total, Pending, Approved, Rejected, Married
- Advanced filtering: search by name/email/mobile/location, status, gender
- Profile status management (approve/reject/mark married)
- CSV export functionality for filtered profiles
- Admin note management with edit capability

### 6. Payment Integration
- Registration payment modal (NPR 1000)
- QR code display for eSewa/Bank transfer
- Payment instructions for users
- Admin verification workflow

## Database Structure

### Firestore Collections

#### `profiles/` Collection
```javascript
{
  fullName: string,
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
  mobile: string,
  age: number,
  gender: "Male" | "Female" | "Other",
  location: string, // Kathmandu, Lalitpur, Bhaktapur
  detailLocation: string,
  photoURL: string, // Cloudinary URL
  biharBahi: string,
  caste: string,
  intercaste: "Yes" | "No",
  hobbies: string[],
  mustHave: string, // partner preferences
  status: "pending" | "approved" | "rejected" | "married",
  adminNotes: [
    {
      note: string,
      timestamp: ISO8601
    }
  ],
  uid: string,
  createdAt: Firestore.Timestamp,
  updatedAt: Firestore.Timestamp
}
```

#### `admins/` Collection
```javascript
{
  uid: string // Document ID, presence indicates admin status
}
```

#### `interests/` Collection (NEW - for profile interest tracking)
```javascript
{
  // Document ID: {interestedBy}_{interestedIn}
  interestedBy: string, // uid of user expressing interest
  interestedIn: string, // uid of user receiving interest
  status: "interested" | "accepted" | "rejected",
  createdAt: Firestore.Timestamp,
  lastViewedAt: Firestore.Timestamp,
  acceptedAt: Firestore.Timestamp, // when receiver accepted
  rejectedAt: Firestore.Timestamp, // when receiver rejected
  notes: string // optional message
}
```

## Routing Structure

```
/                       → Home (public)
/signin                 → SignIn (public, redirects after login)
/signup                 → SignUp (public, creates pending profile)
/profile                → Profile (protected)
  - GET /profile        → View own profile
  - GET /profile?userId={uid} → View other's profile
/matches                → Matches (protected, displays sessionStorage matches)
/interests              → Interests (protected, manage sent/received interests)
/admin                  → AdminDashboard (admin-protected)
/admin/paired-profiles  → PairedProfiles (admin-protected, arrange meetings)
```

### Route Protection
- `<PrivateRoute>`: Requires authenticated user
- `<AdminRoute>`: Requires authenticated user with admin flag

## Key Services

### Firebase Service (`firebaseService.js`)

Core functions:
- `registerUser(email, password, profileData, photoFile)` - Complete user registration
- `loginUser(email, password)` - User authentication
- `logoutUser()` - Sign out
- `isAdmin(uid)` - Check admin status
- `getUserProfile(uid)` - Fetch profile data
- `updateUserProfile(uid, data)` - Update profile
- `getApprovedProfiles(limit)` - Get matches for chatbot
- `getAllProfiles()` - Get all profiles for admin
- `updateProfileStatus(uid, status)` - Change profile status
- `addAdminNote(uid, note)` - Add timestamped note
- `uploadProfilePhoto(uid, photoFile)` - Upload and save photo URL

### Interest Tracking (NEW)
- `expressInterest(currentUserId, targetUserId)` - Save interest in a profile
- `checkInterest(currentUserId, targetUserId)` - Check if interest exists
- `getUserInterests(userId)` - Get all sent/received interests
- `acceptInterest(interestId)` - Accept a received interest
- `rejectInterest(interestId)` - Reject a received interest
- `getAcceptedInterests()` - Get all accepted interests
- `getPairedProfiles()` - Get paired profiles with full details (admin)

### Cloudinary Service (`cloudinaryService.js`)

Functions:
- `compressImage(file)` - Client-side image compression
- `uploadToCloudinary(file)` - Upload to cloud storage
- `getOptimizedImageUrl(url, options)` - Transform URLs with watermark
- `deleteFromCloudinary(publicId)` - Manual deletion

## Profile Interest Tracking & Meeting Arrangement Feature

### How It Works

1. **Expressing Interest**
   - User clicks "Express Interest" button on a profile in Matches.jsx
   - System creates an interest record in Firestore with status "interested"
   - Record includes: interestedBy, interestedIn, status, timestamps

2. **Receiving & Accepting Interests**
   - User receives notification badge in header (real-time count)
   - Navigate to `/interests` page to view received interests
   - Can accept or reject each interest
   - When accepted, status changes to "accepted" with acceptedAt timestamp

3. **State Maintenance**
   - When viewing matches again, "Interest Sent" button shows for expressed interests
   - Button is disabled to prevent duplicate interests
   - Visual indicator shows status for all sent interests

4. **Admin Meeting Arrangements**
   - Admin dashboard has "Paired Profiles" button
   - Shows all accepted interest pairs with full details:
     - Profile photos
     - Full names (revealed for paired profiles)
     - Contact numbers
     - Email addresses
     - Detailed locations
   - Admin can arrange meetings between paired couples

### Implementation Details

The interest tracking and meeting system is implemented in:
- `src/firebase/firebaseService.js` - Backend functions (express, accept, reject, getPaired)
- `src/pages/Matches.jsx` - Express interest UI
- `src/pages/Interests.jsx` - Accept/reject interests UI
- `src/pages/PairedProfiles.jsx` - Admin meeting arrangements
- `src/components/Header.jsx` - Notification badge
- Uses Firestore real-time updates for instant feedback

### Usage

```javascript
// Express interest in a profile
await expressInterest(currentUser.uid, targetProfile.uid);

// Check if interest exists
const { exists, data } = await checkInterest(currentUser.uid, targetProfile.uid);

// Get all interests for current user
const interests = await getUserInterests(currentUser.uid);
// Returns: { sent: [], received: [], all: [] }

// Accept an interest (receiver)
await acceptInterest(interestId);

// Reject an interest (receiver)
await rejectInterest(interestId);

// Get all accepted interests (admin)
const accepted = await getAcceptedInterests();

// Get paired profiles with full details (admin)
const pairs = await getPairedProfiles();
// Returns array of { interestId, acceptedAt, profile1, profile2 }
```

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Firebase rules and indexes (one-time setup)
npm run firebase:deploy

# Deploy only Firestore rules
npm run firebase:rules

# Deploy only Firestore indexes
npm run firebase:indexes
```

## Vite Configuration

- **Port**: 3000
- **Path alias**: `@` → `./src`
- **HMR**: Enabled with 100ms polling interval
- **Source maps**: Enabled for development

## Environment Variables

Create a `.env` file in the root directory with Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Cloudinary Configuration

Update in `cloudinaryService.js`:
```javascript
const CLOUD_NAME = 'your_cloud_name';
const UPLOAD_PRESET = 'your_upload_preset';
```

## Firebase Setup (One-Time)

Before using the interest tracking feature, deploy Firestore configuration:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy Firestore rules and indexes**:
   ```bash
   npm run firebase:deploy
   ```

This will automatically configure:
- Security rules for `profiles`, `admins`, and `interests` collections
- Database indexes for efficient queries
- Permissions for interest tracking feature

See `FIREBASE_SETUP.md` for detailed instructions.

## Admin Setup

To make a user an admin:
1. User must register normally through the signup flow
2. Manually add their UID to the `admins` collection in Firestore
3. Create a document with the user's UID as the document ID

## Security Considerations

- All admin operations are protected by authentication checks
- Profile photos are optimized and compressed before upload
- Email/password authentication with Firebase security rules
- Protected routes prevent unauthorized access
- Admin status verified on both client and server side

## Future Enhancements

- [ ] Mutual interest notifications
- [ ] Chat functionality between matched users
- [ ] Advanced search filters
- [ ] Profile completeness indicators
- [ ] Email notifications for profile status changes
- [ ] Mobile app version
- [ ] Video call integration for virtual meetings

## Contributing

1. Create a feature branch from `master`
2. Make your changes with clear commit messages
3. Test thoroughly before submitting
4. Submit a pull request with description

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
