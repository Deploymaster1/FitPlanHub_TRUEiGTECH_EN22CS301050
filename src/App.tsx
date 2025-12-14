import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { TrainerDashboard } from './pages/TrainerDashboard';
import { PlanDetails } from './pages/PlanDetails';
import { UserFeed } from './pages/UserFeed';
import { TrainerProfile } from './pages/TrainerProfile';
import { SocialFeedPage } from './pages/SocialFeed';
import { Discover } from './pages/Discover';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'plan' | 'feed' | 'trainer' | 'social' | 'discover';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      if (currentView === 'login' || currentView === 'signup') {
        setCurrentView('landing');
      }
    }
  }, [user, profile, loading]);

  const handleNavigate = (view: string, planId?: string, trainerId?: string) => {
    setCurrentView(view as View);
    if (planId) setSelectedPlanId(planId);
    if (trainerId) setSelectedTrainerId(trainerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return <Login onNavigate={handleNavigate} />;
  }

  if (currentView === 'signup') {
    return <Signup onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {currentView === 'landing' && <Landing onNavigate={handleNavigate} />}

      {currentView === 'dashboard' && profile?.role === 'trainer' && (
        <TrainerDashboard />
      )}

      {currentView === 'plan' && selectedPlanId && (
        <PlanDetails planId={selectedPlanId} onNavigate={handleNavigate} />
      )}

      {currentView === 'feed' && profile?.role === 'user' && (
        <UserFeed onNavigate={handleNavigate} />
      )}

      {currentView === 'social' && user && (
        <SocialFeedPage onNavigate={handleNavigate} />
      )}

      {currentView === 'discover' && user && (
        <Discover onNavigate={handleNavigate} />
      )}

      {currentView === 'trainer' && selectedTrainerId && (
        <TrainerProfile trainerId={selectedTrainerId} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
