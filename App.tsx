
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
// Fix: Use compat version of auth because named modular exports (getAuth, etc) are missing in this environment
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getFirestore } from 'firebase/firestore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Summary from './components/Summary';
import Navbar from './components/Navbar';
import { User, UserRole } from './types';

// Replace with your actual Firebase config in production
const firebaseConfig = {
  // Use process.env.API_KEY directly for Firebase as well
 const firebaseConfig = {
  apiKey: "AIzaSyB57Vp2oTCHXGd-E4QPX9FecjzA1Pwke24",
  authDomain: "buntee-tracker.firebaseapp.com",
  projectId: "buntee-tracker",
  storageBucket: "buntee-tracker.firebasestorage.app",
  messagingSenderId: "901861830828",
  appId: "1:901861830828:web:50b8dac1a66c85641c6f09",
  measurementId: "G-85R7319XQH"
};

const app = initializeApp(firebaseConfig);
// Initialize compat firebase for the auth module specifically to resolve import errors
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const auth = firebase.auth();
export const db = getFirestore(app);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Use the compat auth listener which is robust in this setup
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (fbUser) {
        // Simple role check based on email for the demo
        const role: UserRole = fbUser.email?.includes('owner') ? 'OWNER' : 'PARTNER';
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          role: role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCF0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4037]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFCF0] text-[#3E2723]">
        {user && <Navbar user={user} />}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/history" 
              element={user ? <History user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/summary" 
              element={user ? <Summary user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
