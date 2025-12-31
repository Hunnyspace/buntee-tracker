import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../App';
import { User } from '../types';

interface NavbarProps {
  user: User;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Fix: Using the auth instance's signOut method to avoid module export issues
    await auth.signOut();
    navigate('/login');
  };

  // The direct Raw link to your GitHub image
  const logoUrl = "https://raw.githubusercontent.com/Hunnyspace/buntee-tracker/main/Bunteelogo.png";

  return (
    <nav className="bg-[#5D4037] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          {/* Using the Raw GitHub link directly in the src */}
          <img 
            src={logoUrl} 
            alt="Buntee Logo" 
            className="w-10 h-10 object-contain rounded-md" 
            onError={(e) => {
              // Fallback: If the image fails to load, it shows a styled 'B'
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          <div>
            <h1 className="text-xl font-bold leading-none uppercase">BUNTEE</h1>
            <p className="text-xs text-[#D2B48C]">Muska Bun Portal</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 justify-center">
          <Link to="/" className="hover:text-[#D2B48C] transition-colors font-medium">Dashboard</Link>
          <Link to="/history" className="hover:text-[#D2B48C] transition-colors font-medium">History</Link>
          <Link to="/summary" className="hover:text-[#D2B48C] transition-colors font-medium">Summary</Link>
          <button 
            onClick={handleLogout}
            className="text-sm bg-[#3E2723] px-3 py-1 rounded hover:bg-black transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;