import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';

interface SocialFeedProps {
  trainerId?: string;
  showOnlyFollowing?: boolean;
}

export function SocialFeed({ trainerId, showOnlyFollowing = false }: SocialFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commenting, setCommenting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadPosts();
  }, [trainerId, showOnlyFollowing, user]);

  const loadPosts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          trainer:profiles!trainer_id (
            id,
            full_name,
            role,
            bio
          ),
          likes (
            id,
            user_id,
            user:profiles!user_id (
              id,
              full_name
            )
          ),
          comments (
            id,
            content,
            created_at,
            user:profiles!user_id (
              id,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      // By default, sab posts dikhao Instagram ki tarah, sirf filter karo agar specifically bola ho to
      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      } else if (showOnlyFollowing) {
        const { data: followedTrainers } = await supabase
          .from('follows')
          .select('trainer_id')
          .eq('follower_id', user.id);
        
        const trainerIds = followedTrainers?.map((f: any) => f.trainer_id) || [];
        if (trainerIds.length > 0) {
          query = query.in('trainer_id' as any, trainerIds);
        } else {
          setPosts([]);
          setLoading(false);
          return;
        }
      }
      // Default mein saare trainer ke posts dikhao, koi filter nahi

      const { data, error } = await query;

      if (error) throw error;

      // Bas trainer ke hi posts rakhna, koi bhi non-trainer ka post hata do
      const postsData = (data || [])
        .filter((post: any) => post.trainer?.role === 'trainer')
        .map((post: any) => ({
          ...post,
          like_count: post.likes?.length || 0,
          comment_count: post.comments?.length || 0,
          is_liked: post.likes?.some((like: any) => like.user_id === user.id) || false
        }));

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            post_id: postId
          }] as any);
      }

      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              is_liked: !isLiked,
              like_count: isLiked ? post.like_count! - 1 : post.like_count! + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!user || !content) return;

    setCommenting(prev => ({ ...prev, [postId]: true }));

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content
        }] as any)
        .select(`
          *,
          user:profiles!user_id (
            id,
            full_name
          )
        `)
        .single();

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), data],
              comment_count: post.comment_count! + 1
            }
          : post
      ));

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-dark-text-muted">
          {showOnlyFollowing ? 'No posts from trainers you follow yet' : 'No posts yet'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="dark-surface border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-pink rounded-full flex items-center justify-center text-white font-semibold hover-lift">
                {post.trainer?.full_name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div>
                <div className="font-semibold text-dark-text-primary">
                  {post.trainer?.full_name || 'Unknown Trainer'}
                </div>
                <div className="text-sm text-dark-text-muted">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button className="text-dark-text-muted hover:text-dark-text-secondary transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Post Image */}
          <div className="aspect-square bg-dark-surface-light">
            <img
              src={post.image_url}
              alt={post.caption}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-3">
              <button
                onClick={() => handleLike(post.id, post.is_liked!)}
                className={`transition-colors ${
                  post.is_liked ? 'text-accent-pink' : 'text-dark-text-secondary hover:text-accent-pink'
                }`}
              >
                <Heart size={24} fill={post.is_liked ? 'currentColor' : 'none'} />
              </button>
              <button className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                <MessageCircle size={24} />
              </button>
              <button className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                <Send size={24} />
              </button>
            </div>

            {post.like_count! > 0 && (
              <div className="font-semibold text-dark-text-primary mb-2">
                {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
              </div>
            )}

            {/* Caption */}
            <div className="text-dark-text-primary mb-2">
              <span className="font-semibold mr-2 text-accent-orange">
                {post.trainer?.full_name || 'Unknown Trainer'}
              </span>
              {post.caption}
            </div>

            {/* Comments */}
            {post.comment_count! > 0 && (
              <div className="space-y-2 mb-3">
                {post.comments?.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="text-sm text-dark-text-secondary">
                    <span className="font-semibold text-dark-text-primary">{comment.user?.full_name}: </span>
                    {comment.content}
                  </div>
                ))}
                {post.comment_count! > 2 && (
                  <button className="text-sm text-dark-text-muted hover:text-dark-text-secondary transition-colors">
                    View all {post.comment_count} comments
                  </button>
                )}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex items-center space-x-3 pt-3 border-t border-gray-700">
              <input
                type="text"
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ 
                  ...prev, 
                  [post.id]: e.target.value 
                }))}
                placeholder="Add a comment..."
                style={{
                  backgroundColor: '#2a2a2a',
                  borderColor: '#4a4a4a',
                  color: '#ffffff',
                  caretColor: '#ff6a00'
                }}
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(post.id);
                  }
                }}
              />
              {commentInputs[post.id] && (
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={commenting[post.id]}
                  className="text-accent-orange font-semibold text-sm hover:text-accent-pink disabled:opacity-50 transition-colors"
                >
                  {commenting[post.id] ? 'Posting...' : 'Post'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
