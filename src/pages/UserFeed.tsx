import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FitnessPlan } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, IndianRupee, User as UserIcon, Heart, CheckCircle } from 'lucide-react';

interface UserFeedProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function UserFeed({ onNavigate }: UserFeedProps) {
  const { user } = useAuth();
  const [followedPlans, setFollowedPlans] = useState<FitnessPlan[]>([]);
  const [subscribedPlans, setSubscribedPlans] = useState<FitnessPlan[]>([]);
  const [subscribedPlanIds, setSubscribedPlanIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFeedData();
    }
  }, [user]);

  const loadFeedData = async () => {
    if (!user) return;

    try {
      const { data: followedTrainers, error: followError } = await supabase
        .from('follows')
        .select('trainer_id')
        .eq('follower_id', user.id);

      if (followError) throw followError;

      const trainerIds = followedTrainers?.map((f: any) => f.trainer_id) || [];

      if (trainerIds.length > 0) {
        const { data: plansData, error: plansError } = await supabase
          .from('fitness_plans' as any)
          .select(`
            *,
            trainer:profiles!trainer_id (
              id,
              full_name,
              role,
              bio
            )
          `)
          .in('trainer_id', trainerIds)
          .order('created_at', { ascending: false });

        if (plansError) throw plansError;
        setFollowedPlans(plansData || []);
      }

      const { data: subscribedData, error: subscribedError } = await supabase
          .from('subscriptions' as any)
          .select(`
            *,
            plan:fitness_plans (
              *,
              trainer:profiles!trainer_id (
                id,
                full_name,
                role,
                bio
              )
            )
          `)
        .eq('user_id', user.id);

      if (subscribedError) throw subscribedError;

      const subPlans = subscribedData?.map((s: any) => s.plan).filter(Boolean) as FitnessPlan[] || [];
      setSubscribedPlans(subPlans);
      setSubscribedPlanIds(new Set(subPlans.map(p => p.id)));

    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-dark-text-primary flex items-center mb-4">
            <Heart className="mr-4 text-accent-pink" size={36} />
            My Fitness Feed
          </h1>
          <p className="text-dark-text-secondary text-lg">
            Plans from trainers you follow and your subscriptions
          </p>
        </div>

        {subscribedPlans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-8">My Subscribed Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscribedPlans.map((plan, index) => (
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
                    <div className="h-2 bg-gradient-to-r from-accent-green to-accent-cyan"></div>
                    <div className="bg-accent-green/10 border-b border-accent-green/30 px-4 py-3">
                      <div className="flex items-center text-accent-green text-sm">
                        <CheckCircle size={16} className="mr-2" />
                        <span className="font-semibold">Subscribed</span>
                      </div>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-dark-text-primary mb-3">
                        {plan.title}
                      </h3>
                      <p className="text-dark-text-secondary mb-6 line-clamp-3 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="space-y-3">
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
                        View Plan
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-8">
            Plans from Trainers You Follow
          </h2>
          {followedPlans.length === 0 ? (
            <Card className="dark-surface border-gray-800 p-12 text-center animate-fade-in">
              <Heart size={48} className="mx-auto text-accent-pink mb-6" />
              <p className="text-dark-text-secondary text-xl mb-3">No plans to show yet</p>
              <p className="text-dark-text-muted mb-8 text-lg">
                Follow trainers to see their latest fitness plans here
              </p>
              <Button onClick={() => onNavigate('landing')} className="btn-primary">
                Explore Trainers
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {followedPlans.map((plan, index) => (
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
                    {subscribedPlanIds.has(plan.id) && (
                      <div className="bg-accent-green/10 border-b border-accent-green/30 px-4 py-3">
                        <div className="flex items-center text-accent-green text-sm">
                          <CheckCircle size={16} className="mr-2" />
                          <span className="font-semibold">Subscribed</span>
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-dark-text-primary mb-3">
                        {plan.title}
                      </h3>
                      <p className="text-dark-text-secondary mb-6 line-clamp-3 leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="space-y-3">
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
