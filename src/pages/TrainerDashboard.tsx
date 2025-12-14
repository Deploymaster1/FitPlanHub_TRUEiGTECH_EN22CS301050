import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FitnessPlan } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Calendar, Dumbbell, IndianRupee } from 'lucide-react';

export function TrainerDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<FitnessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FitnessPlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
  });

  useEffect(() => {
    loadPlans();
  }, [user]);

  const loadPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('fitness_plans')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({ title: '', description: '', price: '', duration: '', image_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: FitnessPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      image_url: plan.image_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const planData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        image_url: formData.image_url.trim() || null,
        trainer_id: user.id,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('fitness_plans' as any)
          .update(planData as any)
          .eq('id', editingPlan.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fitness_plans' as any)
          .insert([planData] as any);

        if (error) throw error;
      }

      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('fitness_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading your plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-text-primary mb-2">
              My Fitness Plans
            </h1>
            <p className="text-dark-text-secondary">Create and manage your fitness plans</p>
          </div>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Plan</span>
          </Button>
        </div>

        {plans.length === 0 ? (
          <Card className="dark-surface border-gray-800 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-orange/20 to-accent-pink/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell size={32} className="text-accent-orange" />
            </div>
            <p className="text-dark-text-secondary text-lg mb-6">You haven't created any plans yet.</p>
            <Button variant="primary" onClick={openCreateModal} className="btn-primary">
              Create Your First Plan
            </Button>
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

                  <div className="px-6 pb-6 flex space-x-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(plan)}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlan ? 'Edit Fitness Plan' : 'Create Fitness Plan'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Plan Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fat Loss Beginner Plan"
              required
              className="bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
            />

            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-dark-surface-light border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all resize-none text-dark-text-primary placeholder-dark-text-muted"
                rows={4}
                placeholder="Describe your fitness plan..."
                required
              />
            </div>

            <Input
              label="Plan Image URL (optional)"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/plan-image.jpg"
              className="bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
            />

            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="29.99"
              required
              className="bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
            />

            <Input
              label="Duration (days)"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="30"
              required
              className="bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1 btn-primary">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
