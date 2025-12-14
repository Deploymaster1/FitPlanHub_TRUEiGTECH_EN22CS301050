import { Dumbbell, LogOut, Home, LayoutDashboard, Heart, Instagram, Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="dark-surface border-b border-gray-800 sticky top-0 z-40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2 hover-lift"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent-orange to-accent-pink rounded-lg flex items-center justify-center">
                <Dumbbell size={20} className="text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">FitPlanHub</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('landing')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover-lift ${
                    currentView === 'landing'
                      ? 'bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 text-accent-orange border border-accent-orange/30'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface-light'
                  }`}
                >
                  <Home size={18} />
                  <span className="font-medium">Explore</span>
                </button>

                <button
                  onClick={() => onNavigate('discover')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover-lift ${
                    currentView === 'discover'
                      ? 'bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 text-accent-orange border border-accent-orange/30'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface-light'
                  }`}
                >
                  <Compass size={18} />
                  <span className="font-medium">Discover</span>
                </button>

                <button
                  onClick={() => onNavigate('social')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover-lift ${
                    currentView === 'social'
                      ? 'bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 text-accent-orange border border-accent-orange/30'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface-light'
                  }`}
                >
                  <Instagram size={18} />
                  <span className="font-medium">Social</span>
                </button>

                {profile?.role === 'user' && (
                  <button
                    onClick={() => onNavigate('feed')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover-lift ${
                      currentView === 'feed'
                        ? 'bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 text-accent-orange border border-accent-orange/30'
                        : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface-light'
                    }`}
                  >
                    <Heart size={18} />
                    <span className="font-medium">My Feed</span>
                  </button>
                )}

                {profile?.role === 'trainer' && (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover-lift ${
                      currentView === 'dashboard'
                        ? 'bg-gradient-to-r from-accent-orange/20 to-accent-pink/20 text-accent-orange border border-accent-orange/30'
                        : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-surface-light'
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    <span className="font-medium">Dashboard</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-dark-text-primary">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-dark-text-secondary capitalize">{profile?.role || 'loading...'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 border-gray-600 text-dark-text-secondary hover:text-dark-text-primary hover:border-gray-500"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('login')}
                  className="border-gray-600 text-dark-text-secondary hover:text-dark-text-primary hover:border-gray-500"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('signup')}
                  className="btn-primary"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
