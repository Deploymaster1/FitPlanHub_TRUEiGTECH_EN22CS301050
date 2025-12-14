import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { X, Image as ImageIcon, Send } from 'lucide-react';

interface PostCreatorProps {
  onPostCreated?: () => void;
  onClose?: () => void;
}

export function PostCreator({ onPostCreated, onClose }: PostCreatorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!imageUrl.trim() || !caption.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          trainer_id: user.id,
          image_url: imageUrl.trim(),
          caption: caption.trim()
        } as any);

      if (insertError) throw insertError;

      // Form phirse refresh
      setImageUrl('');
      setCaption('');
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-surface border-gray-800 rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-dark-text-primary">Create Post</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-dark-text-muted hover:text-dark-text-secondary transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Image URL
            </label>
            <div className="relative">
              <ImageIcon 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted" 
              />
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Yahaan apni image ka link paste karein"
                className="pl-10 bg-dark-surface-light border-gray-700 text-dark-text-primary placeholder-dark-text-muted"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your fitness journey..."
              className="w-full px-3 py-2 bg-dark-surface-light border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent resize-none text-dark-text-primary placeholder-dark-text-muted"
              rows={4}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Posting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send size={16} className="mr-2" />
                  Share Post
                </div>
              )}
            </Button>
            
            {onClose && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
