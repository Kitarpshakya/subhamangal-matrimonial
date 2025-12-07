# Firebase Setup Guide

Complete guide for deploying and managing Firebase configuration from the `src/firebase/` folder.

## Prerequisites

- Node.js and npm installed
- Firebase project created: `subhamangal-matrimonial`
- Project access permissions

## First-Time Setup

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### Step 2: Login to Firebase

```bash
firebase login
```

This opens a browser window for Google authentication.

### Step 3: Verify Project

Check that your project is configured:

```bash
firebase projects:list
```

You should see `subhamangal-matrimonial` in the list.

### Step 4: Deploy Configuration

From the **project root**, run:

```bash
npm run firebase:deploy
```

This deploys:
- ✅ Security rules from `src/firebase/firestore.rules`
- ✅ Database indexes from `src/firebase/firestore.indexes.json`

**Expected Output:**
```
✔ Deploy complete!

Deployed Rules:
  - profiles (read/write rules)
  - admins (read-only rules)
  - interests (user-managed rules)

Deployed Indexes:
  - profiles (status + createdAt)
  - interests (interestedBy + createdAt)
  - interests (interestedIn + createdAt)
```

## Deployment Commands

All deployment commands should be run from the **project root**:

### Deploy Everything
```bash
npm run firebase:deploy
```

### Deploy Only Security Rules
```bash
npm run firebase:rules
```

### Deploy Only Indexes
```bash
npm run firebase:indexes
```

## Configuration Files

### 1. `firestore.rules` (Security Rules)

Defines access control for all Firestore collections.

**Key Features:**
- Public read access for profiles (matching purposes)
- Authenticated write with ownership validation
- Admin override capabilities
- Interest tracking with proper validation

**To Modify:**
1. Edit `src/firebase/firestore.rules`
2. Test your changes mentally or with Firebase emulator
3. Deploy: `npm run firebase:rules`
4. Verify in Firebase Console

### 2. `firestore.indexes.json` (Database Indexes)

Defines composite indexes for complex queries.

**Current Indexes:**

1. **Profiles by Status**
   - Fields: `status` (ASC), `createdAt` (DESC)
   - Used by: ChatBot match finding

2. **Interests by Sender**
   - Fields: `interestedBy` (ASC), `createdAt` (DESC)
   - Used by: Viewing sent interests

3. **Interests by Receiver**
   - Fields: `interestedIn` (ASC), `createdAt` (DESC)
   - Used by: Viewing received interests

**To Add New Index:**
1. Edit `src/firebase/firestore.indexes.json`
2. Add index definition:
   ```json
   {
     "collectionGroup": "collection_name",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "field1", "order": "ASCENDING" },
       { "fieldPath": "field2", "order": "DESCENDING" }
     ]
   }
   ```
3. Deploy: `npm run firebase:indexes`
4. Wait for index to build (5-10 minutes)

## Testing After Deployment

### 1. Verify Deployment

**Check Firebase Console:**
- Rules: https://console.firebase.google.com/project/subhamangal-matrimonial/firestore/rules
- Indexes: https://console.firebase.google.com/project/subhamangal-matrimonial/firestore/indexes

**Check in App:**
1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. Perform actions that use Firestore
4. No permission errors = successful deployment ✅

### 2. Test Interest Tracking

1. Sign in to the app
2. Use ChatBot to find matches
3. Click "Express Interest" on a profile
4. Check browser console for errors
5. Verify in Firestore Console:
   - Navigate to `interests` collection
   - Document should exist with ID: `{yourUid}_{targetUid}`

### 3. Test State Persistence

1. Express interest in a profile
2. Refresh the page
3. Navigate back to matches
4. Button should show "Interest Sent" (disabled)

## File Structure

```
src/firebase/
├── config.js                    # Firebase initialization
├── firebaseService.js          # All Firebase operations
├── firestore.rules             # Security rules (deployed)
├── firestore.indexes.json      # Database indexes (deployed)
├── README.md                   # This folder's overview
└── setup.md                    # This deployment guide

Root files (required by Firebase CLI):
├── firebase.json               # References src/firebase/ files
└── .firebaserc                 # Project configuration
```

## Troubleshooting

### Issue: "Permission denied to update project"

**Solution:**
```bash
firebase login --reauth
firebase use subhamangal-matrimonial
```

### Issue: "Could not find firebase.json"

**Cause:** Running commands from wrong directory

**Solution:** Always run `npm run firebase:*` commands from project root, not from `src/firebase/`

### Issue: Indexes not working

**Symptoms:** "The query requires an index" error in console

**Solution:**
1. Click the link in the error message (auto-creates index)
2. OR deploy manually: `npm run firebase:indexes`
3. Wait 5-10 minutes for index to build
4. Refresh app

### Issue: Rules not applying

**Solution:**
```bash
# Force deploy rules
npm run firebase:rules

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Verify in Firebase Console
# Check "Rules" tab to see deployed rules
```

### Issue: "Project not found"

**Solution:**
1. Check `.firebaserc` has correct project ID
2. Verify project exists: `firebase projects:list`
3. Select project: `firebase use subhamangal-matrimonial`

## Security Best Practices

### Rules Best Practices

1. **Least Privilege:** Only grant minimum necessary permissions
2. **Validate Data:** Use `request.resource.data` to validate writes
3. **Check Auth:** Always verify `request.auth != null` for protected operations
4. **Prevent Escalation:** Users shouldn't be able to grant themselves admin rights

### Index Best Practices

1. **Only Create What You Need:** Each index has storage/cost implications
2. **Monitor Usage:** Check Firebase Console for index usage stats
3. **Remove Unused:** Delete indexes for deprecated queries
4. **Consider Single-Field:** Firebase auto-indexes single fields

## Advanced Usage

### Test Rules Locally (Future Enhancement)

```bash
# Install emulator
firebase init emulators

# Start emulator
firebase emulators:start

# Run tests
npm test
```

### Deploy to Different Environments

```bash
# Add staging project
firebase use --add

# Deploy to staging
firebase use staging
npm run firebase:deploy

# Deploy to production
firebase use production
npm run firebase:deploy
```

### View Deployment History

Check Firebase Console → Firestore → Rules → History

## Continuous Integration

### GitHub Actions Example

```yaml
name: Deploy Firebase Config
on:
  push:
    branches: [master]
    paths:
      - 'src/firebase/firestore.rules'
      - 'src/firebase/firestore.indexes.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
```

## Monitoring & Maintenance

### Regular Checks

1. **Weekly:** Review Firestore usage in console
2. **Monthly:** Audit security rules for vulnerabilities
3. **Quarterly:** Review and optimize indexes

### Alerts to Set Up

- Firestore quota warnings
- Unusual access patterns
- Failed authentication attempts
- Index build failures

## Quick Reference

```bash
# Login
firebase login

# Check project
firebase projects:list
firebase use

# Deploy all
npm run firebase:deploy

# Deploy rules only
npm run firebase:rules

# Deploy indexes only
npm run firebase:indexes

# Check status
firebase deploy --only firestore --dry-run
```

## Support Resources

- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **Security Rules Guide:** https://firebase.google.com/docs/firestore/security/get-started
- **Indexing Guide:** https://firebase.google.com/docs/firestore/query-data/indexing

## Next Steps

After successful deployment:

1. ✅ Test interest tracking feature
2. ✅ Monitor Firebase Console for errors
3. ✅ Set up automated backups (if needed)
4. ✅ Configure Firebase alerts
5. ✅ Document any custom rules you add

---

**Remember:** All Firebase configuration is now managed from `src/firebase/`. Keep this folder in version control and always deploy changes using the npm scripts!
