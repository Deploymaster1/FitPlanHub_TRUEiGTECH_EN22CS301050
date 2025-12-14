import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SocialFeed } from '../components/SocialFeed';
import { Heart, Users, TrendingUp } from 'lucide-react';

interface DiscoverProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function Discover({ onNavigate }: DiscoverProps) {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'trainers'>('posts');

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'trainer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (error) {
      console.error('Error loading trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Card className="dark-surface border-gray-800 p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-4">
            Sign In Required
          </h2>
          <p className="text-dark-text-secondary mb-6">
            Please sign in to access the discover section
          </p>
          <Button onClick={() => onNavigate('login')} className="btn-primary">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading discover content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-dark-text-primary flex items-center mb-4">
            <TrendingUp className="mr-4 text-accent-orange" size={36} />
            Discover
          </h1>
          <p className="text-dark-text-secondary text-lg">
            Explore trending posts and connect with fitness trainers
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-dark-surface-light rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-accent-orange to-accent-pink text-white'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            <Heart size={18} />
            <span className="font-medium">Trending Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'trainers'
                ? 'bg-gradient-to-r from-accent-orange to-accent-pink text-white'
                : 'text-dark-text-secondary hover:text-dark-text-primary'
            }`}
          >
            <Users size={18} />
            <span className="font-medium">Trainers</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-2">
                Trending Posts
              </h2>
              <p className="text-dark-text-secondary">
                See what trainers are sharing with the community
              </p>
            </div>
            <SocialFeed showOnlyFollowing={false} />
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-dark-text-primary mb-2">
                All Trainers
              </h2>
              <p className="text-dark-text-secondary">
                Connect with fitness professionals and follow their journey
              </p>
            </div>

            {trainers.length === 0 ? (
              <Card className="dark-surface border-gray-800 p-12 text-center">
                <Users size={48} className="mx-auto text-dark-text-muted mb-6" />
                <p className="text-dark-text-secondary text-xl mb-3">No trainers found</p>
                <p className="text-dark-text-muted">
                  Check back later for new trainers to follow
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map((trainer, index) => (
                  <div key={trainer.id} className="animate-fade-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card className="dark-surface border-gray-800 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-pink rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 hover-lift">
                            {trainer.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-dark-text-primary">
                              {trainer.full_name}
                            </h3>
                            <p className="text-accent-orange font-medium">Certified Trainer</p>
                          </div>
                        </div>

                        <p className="text-dark-text-secondary mb-6 leading-relaxed">
                          {trainer.bio || 'A dedicated fitness professional committed to helping you achieve your goals.'}
                        </p>

                        <div className="flex space-x-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onNavigate('trainer', undefined, trainer.id)}
                            className="flex-1 btn-primary"
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onNavigate('feed')}
                            className="flex items-center space-x-1 btn-secondary"
                          >
                            <Heart size={16} />
                            <span>Posts</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
