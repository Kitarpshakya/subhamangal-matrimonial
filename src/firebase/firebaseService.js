import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  arrayUnion,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from './config';
import { uploadToCloudinary } from '../services/cloudinaryService';

export const registerUser = async (email, password, profileData, photoFile) => {
  try {
    console.log('Starting registration for:', email);
    console.log('Profile data received:', profileData);
    
    // Create auth user first
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Auth user created:', user.uid);
    
    let photoURL = '';
    if (photoFile) {
      console.log('Uploading photo to Cloudinary...');
      try {
        photoURL = await uploadToCloudinary(photoFile);
        console.log('Photo uploaded successfully:', photoURL);
      } catch (photoError) {
        console.error('Photo upload failed:', photoError);
        // Continue without photo
      }
    }
    
    // Prepare complete profile data
    const completeProfileData = {
      ...profileData,
      email,
      photoURL,
      uid: user.uid,
      status: 'pending',
      adminNotes: [], // Initialize empty array for admin notes
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('Creating profile document with data:', completeProfileData);
    
    // Create profile document
    await setDoc(doc(db, 'profiles', user.uid), completeProfileData);
    
    console.log('Profile document created successfully');
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const isAdmin = async (uid) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', uid));
    if (profileDoc.exists()) {
      return { id: profileDoc.id, ...profileDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    // Update the fullName if name fields changed
    if (data.firstName || data.lastName) {
      const fullName = [
        data.firstName || '',
        data.middleName || '',
        data.lastName || ''
      ].filter(Boolean).join(' ');
      data.fullName = fullName;
    }
    
    await updateDoc(doc(db, 'profiles', uid), {
      ...data,
      updatedAt: Timestamp.now()
    });
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getApprovedProfiles = async (limitCount = 1000) => {
  try {
    const q = query(
      collection(db, 'profiles'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    console.log('Approved profiles fetched:', snapshot.size);

    // Filter out married profiles and return
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(profile => profile.status !== 'married');
  } catch (error) {
    console.error('Error getting approved profiles:', error);
    return [];
  }
};

export const getAllProfiles = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'profiles'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all profiles:', error);
    throw error;
  }
};

export const updateProfileStatus = async (uid, status) => {
  try {
    await updateDoc(doc(db, 'profiles', uid), {
      status,
      updatedAt: Timestamp.now()
    });
    console.log('Profile status updated to:', status);
  } catch (error) {
    console.error('Error updating profile status:', error);
    throw error;
  }
};

export const addAdminNote = async (uid, note) => {
  try {
    await updateDoc(doc(db, 'profiles', uid), {
      adminNotes: arrayUnion({
        note,
        timestamp: new Date().toISOString(),
        addedAt: Timestamp.now()
      })
    });
    console.log('Admin note added successfully');
  } catch (error) {
    console.error('Error adding admin note:', error);
    throw error;
  }
};

export const uploadProfilePhoto = async (uid, photoFile) => {
  try {
    const photoURL = await uploadToCloudinary(photoFile);
    await updateDoc(doc(db, 'profiles', uid), {
      photoURL,
      updatedAt: Timestamp.now()
    });
    console.log('Profile photo updated');
    return photoURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

// Profile Interest Tracking Functions

export const expressInterest = async (currentUserId, targetUserId) => {
  try {
    // Create a unique document ID using both user IDs
    const interestId = `${currentUserId}_${targetUserId}`;

    // Check if interest already exists
    const existingInterest = await getDoc(doc(db, 'interests', interestId));

    if (existingInterest.exists()) {
      // Update existing interest with new timestamp
      await updateDoc(doc(db, 'interests', interestId), {
        lastViewedAt: Timestamp.now(),
        status: 'interested'
      });
      console.log('Interest updated');
    } else {
      // Create new interest document
      await setDoc(doc(db, 'interests', interestId), {
        interestedBy: currentUserId,
        interestedIn: targetUserId,
        status: 'interested',
        createdAt: Timestamp.now(),
        lastViewedAt: Timestamp.now(),
        notes: ''
      });
      console.log('Interest created successfully');
    }

    return true;
  } catch (error) {
    console.error('Error expressing interest:', error);
    throw error;
  }
};

export const checkInterest = async (currentUserId, targetUserId) => {
  try {
    const interestId = `${currentUserId}_${targetUserId}`;
    const interestDoc = await getDoc(doc(db, 'interests', interestId));

    if (interestDoc.exists()) {
      return { exists: true, data: interestDoc.data() };
    }
    return { exists: false, data: null };
  } catch (error) {
    console.error('Error checking interest:', error);
    return { exists: false, data: null };
  }
};

export const getUserInterests = async (userId) => {
  try {
    // Get interests where user is the one who expressed interest
    const sentInterestsQuery = query(
      collection(db, 'interests'),
      where('interestedBy', '==', userId)
    );

    // Get interests where user received interest
    const receivedInterestsQuery = query(
      collection(db, 'interests'),
      where('interestedIn', '==', userId)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentInterestsQuery),
      getDocs(receivedInterestsQuery)
    ]);

    const sentInterests = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'sent',
      ...doc.data()
    }));

    const receivedInterests = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'received',
      ...doc.data()
    }));

    return {
      sent: sentInterests,
      received: receivedInterests,
      all: [...sentInterests, ...receivedInterests]
    };
  } catch (error) {
    console.error('Error getting user interests:', error);
    return { sent: [], received: [], all: [] };
  }
};

export const acceptInterest = async (interestId) => {
  try {
    await updateDoc(doc(db, 'interests', interestId), {
      status: 'accepted',
      acceptedAt: Timestamp.now()
    });
    console.log('Interest accepted successfully');
    return true;
  } catch (error) {
    console.error('Error accepting interest:', error);
    throw error;
  }
};

export const rejectInterest = async (interestId) => {
  try {
    await updateDoc(doc(db, 'interests', interestId), {
      status: 'rejected',
      rejectedAt: Timestamp.now()
    });
    console.log('Interest rejected successfully');
    return true;
  } catch (error) {
    console.error('Error rejecting interest:', error);
    throw error;
  }
};

export const getAcceptedInterests = async () => {
  try {
    const q = query(
      collection(db, 'interests'),
      where('status', '==', 'accepted')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting accepted interests:', error);
    return [];
  }
};

export const getPairedProfiles = async () => {
  try {
    // Get all accepted interests
    const acceptedInterests = await getAcceptedInterests();

    // Fetch profile details for each pair
    const pairs = await Promise.all(
      acceptedInterests.map(async (interest) => {
        const [profile1, profile2] = await Promise.all([
          getUserProfile(interest.interestedBy),
          getUserProfile(interest.interestedIn)
        ]);

        return {
          interestId: interest.id,
          acceptedAt: interest.acceptedAt,
          profile1,
          profile2
        };
      })
    );

    return pairs.filter(pair => pair.profile1 && pair.profile2);
  } catch (error) {
    console.error('Error getting paired profiles:', error);
    return [];
  }
};