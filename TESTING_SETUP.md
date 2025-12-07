# Testing vs Production Database Setup

This guide shows how to set up separate Firebase projects for testing and production, so you never accidentally test in production.

## 🎯 Why Separate Databases?

✅ **Safety**: Never risk production data during testing
✅ **Isolation**: Test features without affecting real users
✅ **Clean Data**: Fresh test data whenever you need it
✅ **Flexibility**: Experiment freely without consequences

## 📋 Setup Steps

### Step 1: Create a Development Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Create New Project**:
   - Click "Add Project"
   - Name: `subhamangal-matrimonial-dev` (or similar)
   - Enable Google Analytics (optional)
   - Click "Create Project"

3. **Set up Firestore**:
   - Go to "Firestore Database"
   - Click "Create Database"
   - Start in **Test Mode** (we'll deploy rules later)
   - Choose location: same as production

4. **Set up Authentication**:
   - Go to "Authentication"
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

5. **Get Firebase Configuration**:
   - Click gear icon → "Project Settings"
   - Scroll to "Your apps"
   - Click "Web" icon (</>) to add web app
   - Register app with name: "Subhamangal Dev"
   - Copy the `firebaseConfig` object

### Step 2: Configure Environment Files

1. **Edit `.env.development`**:

```env
# Development/Testing Firebase Configuration
VITE_FIREBASE_API_KEY=your_dev_api_key_from_step_1
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-dev-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_dev_measurement_id
VITE_ENVIRONMENT=development
```

2. **Edit `.env.production`** (already configured):

```env
# Production Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBKYbg-5AW5ZRbgLOTDtJBDOQf6fgbK1tY
VITE_FIREBASE_AUTH_DOMAIN=subhamangal-matrimonial.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=subhamangal-matrimonial
# ... rest is already set
VITE_ENVIRONMENT=production
```

3. **Optional: Use `.env.local` for Personal Testing**:

Create/edit `.env.local` (this file is git-ignored):

```env
# Your personal test Firebase project
VITE_FIREBASE_API_KEY=your_personal_test_key
VITE_FIREBASE_AUTH_DOMAIN=your-test-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-test-project
# ... other configs
VITE_ENVIRONMENT=local
```

### Step 3: Configure Firebase CLI for Multiple Projects

1. **Add Development Project**:

```bash
firebase use --add
```

- Select your development project
- Give it alias: `dev`

2. **Add Production Project** (if not already added):

```bash
firebase use --add
```

- Select your production project
- Give it alias: `production`

3. **Check Active Project**:

```bash
firebase use
```

Shows all configured projects and which is active.

### Step 4: Deploy Rules to Development Database

```bash
# Switch to dev project
firebase use dev

# Deploy rules and indexes
npm run firebase:deploy:dev
```

This deploys your Firestore rules and indexes to the development database.

## 🚀 Usage

### Development Mode (Testing Database)

```bash
# Run app with development Firebase
npm run dev
```

**Console Output:**
```
🔥 Firebase Environment: development
📦 Firebase Project: subhamangal-matrimonial-dev
⚠️  TESTING MODE - Using development database
✅ Safe to test - production data is protected
```

### Production Mode (Real Database)

```bash
# Run app with production Firebase
npm run dev:prod
```

**Console Output:**
```
🔥 Firebase Environment: production
📦 Firebase Project: subhamangal-matrimonial
🚀 PRODUCTION MODE - Using production database
⚠️  Be careful - changes affect real users!
```

## 📦 Build Commands

```bash
# Build for production deployment
npm run build

# Build for development/staging deployment
npm run build:dev
```

## 🔥 Firebase Deployment Commands

### Deploy to Development:
```bash
npm run firebase:deploy:dev
```

### Deploy to Production:
```bash
npm run firebase:deploy:prod
```

### Manual Switching:
```bash
# Switch to dev
firebase use dev

# Switch to production
firebase use production

# Deploy to current project
npm run firebase:deploy
```

## 🧪 Testing Workflow

### Daily Development:

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Check console** - should show:
   ```
   ⚠️  TESTING MODE - Using development database
   ```

3. **Test features freely**:
   - Create test users
   - Express interests
   - Accept/reject
   - Test admin features
   - Delete test data

4. **No impact on production** ✅

### Before Production Deployment:

1. **Test in development** thoroughly
2. **Switch to production** mode:
   ```bash
   npm run dev:prod
   ```
3. **Verify it works** with production data
4. **Deploy** if everything works

## 📂 File Structure

```
.env.development      → Dev Firebase config (git-tracked)
.env.production       → Prod Firebase config (git-tracked)
.env.local           → Personal test config (git-ignored)
.firebaserc          → Firebase project aliases
```

## 🔒 Security Best Practices

### What to Commit:
✅ `.env.development` - Dev project config (safe to share with team)
✅ `.env.production` - Prod project config (public in compiled app anyway)

### What NOT to Commit:
❌ `.env.local` - Personal testing configs
❌ Service account keys
❌ Admin SDK credentials

### Note on Firebase Config:
Firebase web config (API keys, project IDs) is **safe to expose publicly**. Security is handled by:
- Firestore Security Rules
- Firebase Auth
- App Check (optional)

## 🎨 Visual Indicators

The app shows which environment you're using:

**Development:**
- Console: Green "⚠️  TESTING MODE"
- Safe to experiment

**Production:**
- Console: Red "⚠️  Be careful"
- Changes affect real users

## 🔄 Environment Priority

Vite loads environment variables in this order:

1. `.env.local` (highest priority - your personal override)
2. `.env.[mode]` (development or production)
3. `.env` (base config)

## 🐛 Troubleshooting

### "Wrong database showing"

**Check:**
```bash
# In browser console, look for:
🔥 Firebase Environment: [should show development]
📦 Firebase Project: [should show your-dev-project-id]
```

**Solution:**
1. Verify `.env.development` has correct credentials
2. Run `npm run dev` (not `npm run dev:prod`)
3. Clear browser cache and reload

### "Cannot deploy to dev project"

**Check:**
```bash
firebase use
```

**Solution:**
```bash
firebase use dev
npm run firebase:deploy
```

### "Environment variables not loading"

**Vite requirement:** All variables must start with `VITE_`

**Solution:**
- Ensure all env vars in `.env.*` files start with `VITE_`
- Restart dev server after changing env files

## 📊 Example: Full Testing Flow

### 1. Setup Test Data in Dev Database:

```bash
# Start dev mode
npm run dev
```

**Browser Console:**
```
⚠️  TESTING MODE - Using development database
```

**Actions:**
1. Create test user: test@example.com
2. Create 5 test profiles
3. Express interests between profiles
4. Test accept/reject functionality
5. Check admin paired profiles

### 2. Verify in Dev Firebase Console:

- Go to: https://console.firebase.google.com/
- Select: `subhamangal-matrimonial-dev`
- Check Firestore → `interests` collection
- Verify data is there

### 3. Test in Production Mode:

```bash
# Stop dev server
# Start production mode
npm run dev:prod
```

**Browser Console:**
```
🚀 PRODUCTION MODE
⚠️  Be careful - changes affect real users!
```

**Verify:**
- Different database
- Production users shown
- No test data visible

### 4. Deploy to Production:

```bash
# Only after thorough testing
npm run firebase:deploy:prod
```

## 💡 Pro Tips

1. **Always check console** on app start to verify environment
2. **Use dev mode by default** - only switch to production when needed
3. **Create test data scripts** for quick dev database seeding
4. **Regular backups** of production before major changes
5. **Use .env.local** for your personal testing Firebase project

## 🔗 Quick Reference

| Command | Environment | Database |
|---------|------------|----------|
| `npm run dev` | Development | Testing DB ✅ |
| `npm run dev:prod` | Production | Real DB ⚠️ |
| `npm run build` | Production | Real DB ⚠️ |
| `npm run build:dev` | Development | Testing DB ✅ |

## 📚 Related Documentation

- `FIREBASE_SETUP.md` - Initial Firebase setup
- `QUICK_START.md` - Quick deployment guide
- `claude.md` - Complete project documentation

---

**Remember:** When in doubt, use `npm run dev` for testing. It's safer! 🛡️
