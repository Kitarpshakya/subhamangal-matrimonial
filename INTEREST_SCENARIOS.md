# Interest Tracking - Test Scenarios

This document demonstrates how the interest tracking system supports one-to-many and many-to-one relationships.

## Scenario 1: One User → Many Users (One-to-Many)

### Setup:
- **User A** (Ram Kumar)
- **User B** (Sita Sharma)
- **User C** (Gita Patel)
- **User D** (Maya Singh)

### Actions:
1. Ram expresses interest in Sita → Creates `interests/A_B`
2. Ram expresses interest in Gita → Creates `interests/A_C`
3. Ram expresses interest in Maya → Creates `interests/A_D`

### Result:
**Ram's Sent Interests (in /interests):**
```
✓ Sita Sharma - Status: Pending
✓ Gita Patel - Status: Pending
✓ Maya Singh - Status: Pending
```

**What Ram Can Do:**
- View all 3 sent interests on `/interests` page
- Each has independent status (pending/accepted/rejected)
- Can continue expressing interest in more users
- If Sita accepts, Ram is paired with Sita but can still interact with Gita and Maya

## Scenario 2: Many Users → One User (Many-to-One)

### Setup:
- **User A** (Ram Kumar)
- **User B** (Shyam Thapa)
- **User C** (Hari Gurung)
- **User D** (Sita Sharma)

### Actions:
1. Ram expresses interest in Sita → Creates `interests/A_D`
2. Shyam expresses interest in Sita → Creates `interests/B_D`
3. Hari expresses interest in Sita → Creates `interests/C_D`

### Result:
**Sita's Received Interests (in /interests):**
```
✓ Ram Kumar - [Accept] [Reject]
✓ Shyam Thapa - [Accept] [Reject]
✓ Hari Gurung - [Accept] [Reject]
```

**What Sita Can Do:**
- View all 3 received interests
- Accept Ram → Creates pair (Ram & Sita)
- Accept Shyam → Creates another pair (Shyam & Sita)
- Reject Hari
- Sita can be paired with multiple users

## Scenario 3: Complex Relationships

### Network:
```
Ram (A) ──interested──> Sita (D)
Ram (A) ──interested──> Gita (C)
Shyam (B) ──interested──> Sita (D)
Sita (D) ──interested──> Ram (A)
```

### Documents Created:
```
interests/A_D → Ram → Sita (interested)
interests/A_C → Ram → Gita (interested)
interests/B_D → Shyam → Sita (interested)
interests/D_A → Sita → Ram (interested)
```

### What Happens:

**1. Ram accepts Sita's interest:**
- `interests/D_A` status → "accepted"
- Admin sees: **Paired Profile: Sita & Ram**

**2. Sita accepts Ram's interest:**
- `interests/A_D` status → "accepted"
- Admin sees: **2 Paired Profiles:**
  - Sita & Ram (from D_A)
  - Ram & Sita (from A_D)

*Note: These are technically the same pair, just from different directions*

**3. Meanwhile:**
- Ram's interest in Gita (`A_C`) is still pending
- Shyam's interest in Sita (`B_D`) is still pending
- Sita can accept Shyam too if she wants

## Scenario 4: Multiple Accepted Pairs

### Setup:
User Sita is very popular and receives many interests.

### Interests Received:
```
Ram → Sita (A_D)
Shyam → Sita (B_D)
Hari → Sita (C_D)
Krishna → Sita (E_D)
```

### Sita's Actions:
1. Accepts Ram → `A_D` status: "accepted"
2. Accepts Shyam → `B_D` status: "accepted"
3. Rejects Hari → `C_D` status: "rejected"
4. Leaves Krishna pending → `E_D` status: "interested"

### Admin Dashboard - Paired Profiles:
Shows **2 pairs**:
```
Pair 1: Ram Kumar & Sita Sharma
  - Ram: [contact details]
  - Sita: [contact details]

Pair 2: Shyam Thapa & Sita Sharma
  - Shyam: [contact details]
  - Sita: [contact details]
```

Admin can arrange meetings for both pairs independently.

## Database Structure

### interests/ Collection:
```javascript
// One user can have multiple sent interests
interests/A_B  { interestedBy: "A", interestedIn: "B", status: "interested" }
interests/A_C  { interestedBy: "A", interestedIn: "C", status: "interested" }
interests/A_D  { interestedBy: "A", interestedIn: "D", status: "accepted" }

// One user can have multiple received interests
interests/B_D  { interestedBy: "B", interestedIn: "D", status: "interested" }
interests/C_D  { interestedBy: "C", interestedIn: "D", status: "accepted" }
interests/E_D  { interestedBy: "E", interestedIn: "D", status: "rejected" }
```

## Key Points

### ✅ Supported:
- User can express interest in unlimited users (one-to-many)
- User can receive interest from unlimited users (many-to-one)
- User can have multiple accepted pairs simultaneously
- Each interest is independent with its own status
- No limit on number of paired profiles

### ✅ How It Works:
1. **Unique Document IDs**: Each interest gets unique ID `{sender}_{receiver}`
2. **Independent Statuses**: Each interest has its own status
3. **No Blocking**: Accepting one interest doesn't block others
4. **Flexible**: Users can be paired with multiple people

### 📋 Admin Workflow:

**For Multiple Pairs:**
```
Admin Dashboard → Paired Profiles

Showing 5 paired profiles:
1. Ram & Sita (accepted on Dec 1)
2. Shyam & Sita (accepted on Dec 3)
3. Gita & Hari (accepted on Dec 2)
4. Ram & Maya (accepted on Dec 4)
5. Krishna & Radha (accepted on Dec 1)
```

Admin arranges meetings for each pair independently.

## Edge Cases

### Case 1: Mutual Interest
- Ram interested in Sita: `A_D` (interested)
- Sita interested in Ram: `D_A` (interested)
- Both can accept each other
- Creates 2 paired profiles (technically same pair)
- *Recommendation: Admin can deduplicate in UI if needed*

### Case 2: Interest After Pairing
- Ram & Sita are paired (accepted)
- Ram can still express interest in Gita
- Gita can still express interest in Ram
- System allows unlimited pairing

### Case 3: Rejecting After Accepting
- Sita accepts Ram's interest
- Currently, no "unpair" feature
- *Future Enhancement: Add "unpair" or "cancel" feature*

## Testing Steps

### Test One-to-Many:
1. Login as User A
2. Find matches (ChatBot)
3. Express interest in User B
4. Go back, find more matches
5. Express interest in User C
6. Go to `/interests` → See both in "Sent Interests"

### Test Many-to-One:
1. Login as User A → Express interest in User D
2. Logout, Login as User B → Express interest in User D
3. Logout, Login as User C → Express interest in User D
4. Login as User D → Go to `/interests`
5. See 3 received interests (from A, B, C)

### Test Multiple Pairs:
1. User D accepts interests from A, B, and C
2. Login as Admin
3. Go to Paired Profiles
4. See 3 pairs:
   - User A & User D
   - User B & User D
   - User C & User D

## Conclusion

The system **fully supports** one-to-many and many-to-one relationships:
- ✅ One user can express interest in many users
- ✅ Many users can express interest in one user
- ✅ Users can have multiple accepted pairs
- ✅ All interests are tracked independently
- ✅ Admin can manage all paired profiles

No code changes needed - this functionality is already built in! 🎉
