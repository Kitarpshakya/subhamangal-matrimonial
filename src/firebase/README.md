# Firebase Configuration

This folder contains all Firebase-related configuration and services for the Shubhmangal Matrimonial application.

## 📁 Files Overview

### Core Files
- **`config.js`** - Firebase initialization and emulator configuration
- **`firebaseService.js`** - All Firebase operations (auth, Firestore, storage)

### Security & Database Configuration
- **`firestore.rules`** - Firestore security rules for all collections
- **`firestore.indexes.json`** - Database indexes for efficient queries
- **`setup.md`** - Detailed deployment instructions
- **`README.md`** - This file

## 🚀 Quick Deploy

To deploy Firestore rules and indexes from this folder:

```bash
# From project root
npm run firebase:deploy
```

This will deploy the rules and indexes defined in this folder to your Firebase project.

## 📋 Collections Structure

### 1. `profiles` Collection
User profile data with matrimonial information.

### 2. `admins` Collection
Admin user IDs for elevated permissions.

### 3. `interests` Collection (Interest Tracking Feature)
Stores user interests in other profiles.

**Document Structure:**
```javascript
{
  interestedBy: string,      // UID of user expressing interest
  interestedIn: string,      // UID of target profile
  status: "interested",      // Interest status
  createdAt: Timestamp,      // When interest was first expressed
  lastViewedAt: Timestamp,   // Last interaction time
  notes: string              // Optional message
}
```

**Document ID Format:** `{interestedBy}_{interestedIn}`

## 🔐 Security Rules

All security rules are defined in `firestore.rules`:

- **Profiles**: Public read, authenticated create/update
- **Admins**: Authenticated read, no write (manual only)
- **Interests**: Users can manage their own interests, admins have full access

## 📊 Indexes

Composite indexes defined in `firestore.indexes.json`:

1. `profiles` by `status` + `createdAt`
2. `interests` by `interestedBy` + `createdAt`
3. `interests` by `interestedIn` + `createdAt`

## 🛠️ Available Functions

### Authentication
- `registerUser(email, password, profileData, photoFile)`
- `loginUser(email, password)`
- `logoutUser()`
- `isAdmin(uid)`

### Profile Management
- `getUserProfile(uid)`
- `updateUserProfile(uid, data)`
- `getApprovedProfiles(limitCount)`
- `getAllProfiles()`
- `updateProfileStatus(uid, status)`
- `addAdminNote(uid, note)`
- `uploadProfilePhoto(uid, photoFile)`

### Interest Tracking (NEW)
- `expressInterest(currentUserId, targetUserId)` - Save interest in a profile
- `checkInterest(currentUserId, targetUserId)` - Check if interest exists
- `getUserInterests(userId)` - Get all sent/received interests

## 🔄 Update Workflow

### To Update Security Rules:
1. Edit `src/firebase/firestore.rules`
2. Run: `npm run firebase:rules`

### To Update Indexes:
1. Edit `src/firebase/firestore.indexes.json`
2. Run: `npm run firebase:indexes`

### To Update Both:
1. Edit the respective files
2. Run: `npm run firebase:deploy`

## 📖 Documentation

See `setup.md` in this folder for:
- First-time deployment instructions
- Troubleshooting guide
- Testing procedures
- Security best practices

## 🔗 Firebase Console Links

- **Project**: https://console.firebase.google.com/project/subhamangal-matrimonial
- **Firestore**: https://console.firebase.google.com/project/subhamangal-matrimonial/firestore
- **Rules**: https://console.firebase.google.com/project/subhamangal-matrimonial/firestore/rules
- **Indexes**: https://console.firebase.google.com/project/subhamangal-matrimonial/firestore/indexes

## ⚠️ Important Notes

- Firebase CLI must be installed: `npm install -g firebase-tools`
- You must be logged in: `firebase login`
- The `firebase.json` and `.firebaserc` files in the project root reference this folder
- Changes to rules/indexes only take effect after deployment
- Indexes may take several minutes to build after deployment

## 🐛 Common Issues

### "Permission denied" errors
- Deploy rules: `npm run firebase:rules`
- Check browser console for specific permission errors

### "Index not found" errors
- Deploy indexes: `npm run firebase:indexes`
- Wait 5-10 minutes for indexes to build
- Check status in Firebase Console

### Rules not updating
- Ensure you're deploying: `npm run firebase:deploy`
- Clear browser cache and reload app
- Check Firebase Console to verify rules were deployed

## 💡 Pro Tips

- All Firebase configuration is version-controlled in this folder
- Test rules locally before deploying (future enhancement)
- Keep security rules as restrictive as possible
- Monitor Firebase usage in the console
- Add indexes as your queries grow more complex
