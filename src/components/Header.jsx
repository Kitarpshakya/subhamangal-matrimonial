import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser, getUserInterests } from '../firebase/firebaseService';
import { Button } from './ui/button';
import { LogOut, User, Shield, Heart } from 'lucide-react';
import { toast } from 'sonner';

const Header = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingInterestsCount, setPendingInterestsCount] = useState(0);

  useEffect(() => {
    if (user && !isAdmin) {
      loadPendingInterests();
      // Poll for new interests every 30 seconds
      const interval = setInterval(loadPendingInterests, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  const loadPendingInterests = async () => {
    try {
      const interests = await getUserInterests(user.uid);
      const pending = interests.received.filter(
        (interest) => interest.status === "interested"
      );
      setPendingInterestsCount(pending.length);
    } catch (error) {
      console.error("Error loading interests count:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent" data-testid="logo">
              Shubhmangal
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin ? (
                  <Button
                    data-testid="admin-dashboard-link"
                    onClick={() => navigate('/admin')}
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      data-testid="profile-link"
                      onClick={() => navigate('/profile')}
                      variant="ghost"
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button
                      data-testid="interests-link"
                      onClick={() => navigate('/interests')}
                      variant="ghost"
                      className="flex items-center gap-2 relative"
                    >
                      <Heart className="w-4 h-4" />
                      Interests
                      {pendingInterestsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {pendingInterestsCount}
                        </span>
                      )}
                    </Button>
                  </>
                )}
                <Button
                  data-testid="logout-button"
                  onClick={handleLogout}
                  variant="ghost"
                  className="flex items-center gap-2 text-rose-600 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  data-testid="signin-link"
                  onClick={() => navigate('/signin')}
                  variant="ghost"
                >
                  Sign In
                </Button>
                <Button
                  data-testid="signup-link"
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
