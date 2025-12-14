import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Dumbbell, User, UserCog } from 'lucide-react';

interface SignupProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'trainer'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName, role);
      onNavigate('landing');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 via-accent-pink/5 to-accent-purple/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-accent-pink/20 to-accent-orange/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative w-full max-w-md">
        <Card className="dark-surface border-gray-800 p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-pink rounded-2xl flex items-center justify-center mb-4 hover-lift">
              <Dumbbell size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-dark-text-primary mb-2">
              Join FitPlanHub
            </h1>
            <p className="text-dark-text-secondary">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-3">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover-lift ${
                    role === 'user'
                      ? 'border-accent-orange bg-accent-orange/10'
                      : 'border-gray-700 hover:border-gray-600 dark-surface-light'
                  }`}
                >
                  <User size={24} className={role === 'user' ? 'text-accent-orange' : 'text-dark-text-muted'} />
                  <span className={`mt-2 font-medium ${role === 'user' ? 'text-accent-orange' : 'text-dark-text-secondary'}`}>
                    User
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('trainer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover-lift ${
                    role === 'trainer'
                      ? 'border-accent-orange bg-accent-orange/10'
                      : 'border-gray-700 hover:border-gray-600 dark-surface-light'
                  }`}
                >
                  <UserCog size={24} className={role === 'trainer' ? 'text-accent-orange' : 'text-dark-text-muted'} />
                  <span className={`mt-2 font-medium ${role === 'trainer' ? 'text-accent-orange' : 'text-dark-text-secondary'}`}>
                    Trainer
                  </span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full btn-primary py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-dark-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-accent-orange hover:text-accent-pink font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
