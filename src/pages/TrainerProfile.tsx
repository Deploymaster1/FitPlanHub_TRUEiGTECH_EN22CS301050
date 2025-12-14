import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FitnessPlan, Profile } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, IndianRupee, UserCheck, UserPlus } from 'lucide-react';

interface TrainerProfileProps {
  trainerId: string;
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function TrainerProfile({ trainerId, onNavigate }: TrainerProfileProps) {
  const { user, profile } = useAuth();
  const [trainer, setTrainer] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<FitnessPlan[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTrainerProfile();
  }, [trainerId, user]);

  const loadTrainerProfile = async () => {
    try {
      const { data: trainerData, error: trainerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', trainerId)
        .maybeSingle();

      if (trainerError) throw trainerError;
      setTrainer(trainerData);

      const { data: plansData, error: plansError } = await supabase
        .from('fitness_plans')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      if (user && profile?.role === 'user') {
        const { data: followData, error: followError } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('trainer_id', trainerId)
          .maybeSingle();

        if (followError && followError.code !== 'PGRST116') throw followError;
        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error loading trainer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || profile?.role !== 'user') return;

    setActionLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('trainer_id', trainerId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{
            follower_id: user.id,
            trainer_id: trainerId,
          }] as any);

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading trainer profile...</p>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Card className="dark-surface border-gray-800 p-8 text-center">
          <p className="text-dark-text-secondary text-lg mb-4">Trainer not found.</p>
          <Button onClick={() => onNavigate('landing')} className="btn-primary">
            Back to Plans
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('landing')}
          className="mb-6 btn-secondary"
        >
          Back
        </Button>

        <Card className="dark-surface border-gray-800 p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-orange to-accent-pink rounded-full flex items-center justify-center text-3xl font-bold text-white mr-6 hover-lift">
                  {trainer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-display font-bold text-dark-text-primary mb-2">
                    {trainer.full_name}
                  </h1>
                  <p className="text-accent-orange font-semibold text-lg">
                    Certified Trainer
                  </p>
                </div>
              </div>

              <p className="text-dark-text-secondary leading-relaxed mb-6 text-lg">
                {trainer.bio || 'A dedicated fitness professional committed to helping you achieve your goals.'}
              </p>

              <div className="flex items-center text-dark-text-muted">
                <span className="font-semibold text-accent-cyan mr-2">{plans.length}</span>
                <span>
                  {plans.length === 1 ? 'Fitness Plan' : 'Fitness Plans'}
                </span>
              </div>
            </div>

            {user && profile?.role === 'user' && user.id !== trainerId && (
              <div className="mt-6 md:mt-0 md:ml-8">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="lg"
                  onClick={handleFollowToggle}
                  disabled={actionLoading}
                  className={`flex items-center space-x-2 px-6 py-3 ${
                    isFollowing ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={20} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Follow</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div>
          <h2 className="text-3xl font-display font-bold text-dark-text-primary mb-8">
            Fitness Plans by {trainer.full_name}
          </h2>

          {plans.length === 0 ? (
            <Card className="dark-surface border-gray-800 p-12 text-center">
              <p className="text-dark-text-secondary">This trainer hasn't created any plans yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div key={plan.id} className="animate-fade-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
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
                          <IndianRupee size={18} className="mr-3 text-accent-green" />
                          <span className="font-semibold text-accent-green">₹{plan.price}</span>
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
      </div>
    </div>
  );
}
