import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FitnessPlan } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Calendar, IndianRupee, User as UserIcon, Lock, CheckCircle } from 'lucide-react';

interface PlanDetailsProps {
  planId: string;
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function PlanDetails({ planId, onNavigate }: PlanDetailsProps) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPlanDetails();
  }, [planId, user]);

  const loadPlanDetails = async () => {
    try {
      const { data: planData, error: planError } = await supabase
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
        .eq('id', planId)
        .maybeSingle();

      if (planError) throw planError;
      setPlan(planData);

      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('plan_id', planId)
          .maybeSingle();

        if (subError && subError.code !== 'PGRST116') throw subError;
        setIsSubscribed(!!subData);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !plan) return;

    setPurchasing(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          plan_id: plan.id,
        }] as any);

      if (error) throw error;
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error purchasing plan:', error);
      alert('Failed to purchase plan. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Card className="dark-surface border-gray-800 p-8 text-center">
          <p className="text-dark-text-secondary text-lg mb-4">Plan not found.</p>
          <Button onClick={() => onNavigate('landing')} className="btn-primary">
            Back to Plans
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigate('landing')}
          className="mb-6 btn-secondary"
        >
          Back to Plans
        </Button>

        <Card className="dark-surface border-gray-800 overflow-hidden animate-fade-in">
          {isSubscribed && (
            <div className="bg-accent-green/10 border-b border-accent-green/30 px-6 py-4">
              <div className="flex items-center text-accent-green">
                <CheckCircle size={20} className="mr-2" />
                <span className="font-medium">You have access to this plan</span>
              </div>
            </div>
          )}

          {plan.image_url && (
            <div className="h-64 bg-dark-surface-light">
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

          <div className="p-8">
            <h1 className="text-4xl font-display font-bold text-dark-text-primary mb-6">
              {plan.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center text-dark-text-secondary">
                <UserIcon size={20} className="mr-3 text-accent-cyan" />
                <button
                  onClick={() => onNavigate('trainer', undefined, plan.trainer_id)}
                  className="hover:text-accent-cyan transition-colors font-medium"
                >
                  {plan.trainer?.full_name || 'Unknown Trainer'}
                </button>
              </div>
              <div className="flex items-center text-dark-text-secondary">
                <IndianRupee size={20} className="mr-3 text-accent-green" />
                <span className="font-semibold text-xl text-accent-green">{plan.price}</span>
              </div>
              <div className="flex items-center text-dark-text-secondary">
                <Calendar size={20} className="mr-3 text-accent-yellow" />
                <span>{plan.duration} days</span>
              </div>
            </div>

            {!isSubscribed ? (
              <div className="dark-surface-light border-2 border-gray-700 rounded-xl p-8 mb-8">
                <div className="flex items-start mb-6">
                  <Lock size={24} className="text-dark-text-muted mr-4 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-dark-text-primary mb-3">
                      Preview Mode
                    </h3>
                    <p className="text-dark-text-secondary text-lg">
                      Subscribe to this plan to unlock full access to all exercises, meal plans, and detailed instructions.
                    </p>
                  </div>
                </div>
                <p className="text-dark-text-secondary mb-6 text-lg leading-relaxed">
                  {plan.description.substring(0, 150)}...
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full btn-primary"
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-5 h-5 mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Subscribe ${plan.price}`
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-4">Full Plan Details</h2>
                  <p className="text-dark-text-secondary leading-relaxed whitespace-pre-line text-lg">
                    {plan.description}
                  </p>
                </div>

                <div className="dark-surface-light border border-accent-cyan/30 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-accent-cyan mb-6">
                    What's Included
                  </h3>
                  <ul className="space-y-4 text-dark-text-secondary">
                    <li className="flex items-start">
                      <CheckCircle size={20} className="mr-3 mt-1 flex-shrink-0 text-accent-cyan" />
                      <span className="text-lg">{plan.duration} days of structured workout routines</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="mr-3 mt-1 flex-shrink-0 text-accent-cyan" />
                      <span className="text-lg">Personalized meal and nutrition guidance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="mr-3 mt-1 flex-shrink-0 text-accent-cyan" />
                      <span className="text-lg">Progress tracking and milestone checkpoints</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle size={20} className="mr-3 mt-1 flex-shrink-0 text-accent-cyan" />
                      <span className="text-lg">Direct support from your trainer</span>
                    </li>
                  </ul>
                </div>

                <div className="dark-surface-light rounded-xl p-8">
                  <h3 className="text-xl font-bold text-dark-text-primary mb-4">
                    About Your Trainer
                  </h3>
                  <p className="text-dark-text-secondary text-lg leading-relaxed">
                    {plan.trainer?.bio || 'This trainer is dedicated to helping you achieve your fitness goals.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('trainer', undefined, plan.trainer_id)}
                    className="mt-6"
                  >
                    View Trainer Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
