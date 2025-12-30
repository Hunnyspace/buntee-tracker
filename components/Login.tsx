
import React, { useState } from 'react';
import { auth } from '../App';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Fix: Use the auth instance directly to bypass named export errors
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#D2B48C] w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#5D4037]">BUNTEE</h2>
          <p className="text-gray-500 mt-2">Sign in to manage Muska Bun Tracking</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4037] outline-none transition-all"
              placeholder="e.g. owner@buntee.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4037] outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#5D4037] text-white py-3 rounded-lg font-bold hover:bg-[#3E2723] transition-all disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Hint: Use owner@buntee.com or partner@buntee.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
