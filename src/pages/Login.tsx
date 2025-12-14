import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onNavigate('landing');
    } catch (err) {
      setError('Invalid email or password');
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
              Welcome Back
            </h1>
            <p className="text-dark-text-secondary">Sign in to your FitPlanHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

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
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted hover:text-dark-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-dark-text-secondary">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-accent-orange hover:text-accent-pink font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
