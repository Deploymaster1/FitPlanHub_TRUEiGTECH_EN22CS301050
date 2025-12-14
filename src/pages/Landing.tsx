import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FitnessPlan } from '../lib/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, User as UserIcon, Dumbbell, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [plans, setPlans] = useState<FitnessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_plans')
        .select(`
          *,
          trainer:profiles!trainer_id (
            id,
            full_name,
            role,
            bio
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading fitness plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 via-accent-pink/10 to-accent-purple/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-pink rounded-2xl flex items-center justify-center">
                <Dumbbell size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text">
              Transform Your
              <br />
              Fitness Journey
            </h1>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover professional fitness plans from certified trainers. 
              Start your transformation with personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                className="btn-primary px-8 py-4 text-lg"
                onClick={() => user ? onNavigate('social') : onNavigate('signup')}
              >
                {user ? 'Explore Social Feed' : 'Get Started'}
              </Button>
              {!user && (
                <Button
                  variant="secondary"
                  className="btn-secondary px-8 py-4 text-lg"
                  onClick={() => onNavigate('login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-accent-pink/20 to-accent-orange/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4 text-dark-text-primary">
            Featured Fitness Plans
          </h2>
          <p className="text-lg text-dark-text-secondary">
            Handpicked programs from expert trainers
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="dark-surface rounded-2xl p-12 max-w-md mx-auto">
              <Dumbbell size={48} className="mx-auto text-dark-text-muted mb-4" />
              <p className="text-dark-text-secondary text-lg mb-2">No fitness plans available yet</p>
              <p className="text-dark-text-muted mb-6">Check back soon for new plans!</p>
              {user && (
                <Button onClick={() => onNavigate('social')} className="btn-primary">
                  Explore Social Feed
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={plan.id} 
                className="animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="dark-surface border-gray-800 overflow-hidden flex flex-col">
                  {plan.image_url && (
                    <div className="h-48 bg-dark-surface-light">
                      <img
                        src={plan.image_url}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="h-2 bg-gradient-to-r from-accent-orange to-accent-pink"></div>
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-dark-text-primary mb-3 group-hover:text-accent-orange transition-colors">
                      {plan.title}
                    </h3>
                    <p className="text-dark-text-secondary mb-6 line-clamp-3 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-dark-text-secondary">
                        <UserIcon size={18} className="mr-3 text-accent-cyan" />
                        <button
                          onClick={() => onNavigate('trainer', undefined, plan.trainer_id)}
                          className="hover:text-accent-cyan transition-colors font-medium"
                        >
                          {plan.trainer?.full_name || 'Unknown Trainer'}
                        </button>
                      </div>
                      <div className="flex items-center text-dark-text-secondary">
                        <IndianRupee size={18} className="mr-3 text-accent-green" />
                        <span className="font-semibold text-accent-green">{plan.price}</span>
                      </div>
                      <div className="flex items-center text-dark-text-secondary">
                        <Calendar size={18} className="mr-3 text-accent-yellow" />
                        <span>{plan.duration} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Button
                      variant="primary"
                      className="w-full btn-primary"
                      onClick={() => onNavigate('plan', plan.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="dark-surface rounded-3xl p-12 border border-gray-800">
            <h2 className="text-3xl font-display font-bold mb-4 gradient-text">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-dark-text-secondary mb-8">
              Join thousands of users transforming their lives with expert guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                className="btn-primary px-8 py-4"
                onClick={() => user ? onNavigate('social') : onNavigate('signup')}
              >
                {user ? 'Explore Community' : 'Join Now'}
              </Button>
              {!user && (
                <Button
                  variant="secondary"
                  className="btn-secondary px-8 py-4"
                  onClick={() => onNavigate('login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
