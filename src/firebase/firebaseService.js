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
      where('status', '!=', 'married'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    console.log(snapshot);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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