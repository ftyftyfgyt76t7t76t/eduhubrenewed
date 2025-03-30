import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
import { apiRequest } from "./queryClient";

export async function registerUser(
  email: string, 
  password: string, 
  userData: any
) {
  // First create user in Firebase
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Update profile with displayName
  await updateProfile(firebaseUser, {
    displayName: userData.fullName
  });
  
  // Then register user in our backend
  const response = await apiRequest("POST", "/api/auth/register", {
    email,
    password, // In a real app, we wouldn't store the raw password in our DB
    ...userData
  });
  
  return response.json();
}

export async function loginUser(email: string, password: string) {
  // First login with Firebase
  await signInWithEmailAndPassword(auth, email, password);
  
  // Then login with our backend
  const response = await apiRequest("POST", "/api/auth/login", {
    email,
    password
  });
  
  return response.json();
}

export async function logoutUser() {
  // Logout from Firebase
  await signOut(auth);
  
  // Logout from our backend
  await apiRequest("POST", "/api/auth/logout", {});
}

export async function createDemoUser(role: string) {
  const response = await apiRequest("POST", "/api/auth/demo", { role });
  return response.json();
}

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
