import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post, Like } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Send, MoreHorizontal, Plus, Search, Home, User } from 'lucide-react';
import { PostCreator } from '../components/PostCreator';

interface SocialFeedPageProps {
  onNavigate: (view: string, planId?: string, trainerId?: string) => void;
}

export function SocialFeedPage({ onNavigate }: SocialFeedPageProps) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commenting, setCommenting] = useState<{ [key: string]: boolean }>({});
  const [showPostCreator, setShowPostCreator] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;

    try {
      const { data: followedTrainers } = await supabase
        .from('follows')
        .select('trainer_id')
        .eq('follower_id', user.id);
      
      const trainerIds = followedTrainers?.map(f => f.trainer_id) || [];
      
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

      if (trainerIds.length > 0) {
        query = query.in('trainer_id' as any, trainerIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsData = (data || []).map((post: any) => ({
        ...post,
        like_count: post.likes?.length || 0,
        comment_count: post.comments?.length || 0,
        is_liked: post.likes?.some((like: Like) => like.user_id === user.id) || false
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
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Instagram-style Navigation */}
      <div className="sticky top-0 z-50 bg-dark-surface border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-display gradient-text">FitPlanHub</h1>
              <div className="hidden md:flex items-center space-x-6">
                <button className="text-dark-text-primary hover:text-accent-orange transition-colors">
                  <Home size={24} />
                </button>
                <button className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                  <Search size={24} />
                </button>
                <button 
                  onClick={() => setShowPostCreator(!showPostCreator)}
                  className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('feed')}
              className="text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <User size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            {showPostCreator && profile?.role === 'trainer' && (
              <div className="animate-fade-in">
                <PostCreator 
                  onPostCreated={() => {
                    loadPosts();
                    setShowPostCreator(false);
                  }}
                  onClose={() => setShowPostCreator(false)}
                />
              </div>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="dark-surface rounded-xl p-12 text-center">
                <div className="text-dark-text-muted mb-4">
                  No posts from trainers you follow yet
                </div>
                <button 
                  onClick={() => onNavigate('landing')}
                  className="btn-primary"
                >
                  Discover Trainers
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="ig-post animate-fade-in">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-pink rounded-full flex items-center justify-center text-white font-semibold">
                        {post.trainer?.full_name?.[0]?.toUpperCase() || 'T'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {post.trainer?.full_name || 'Unknown Trainer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Image */}
                  <div className="aspect-square bg-gray-100">
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
                        className={`transition-all transform hover:scale-110 ${
                          post.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <Heart size={24} fill={post.is_liked ? 'currentColor' : 'none'} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <MessageCircle size={24} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Send size={24} />
                      </button>
                    </div>

                    {post.like_count! > 0 && (
                      <div className="font-semibold text-gray-800 mb-2">
                        {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                      </div>
                    )}

                    {/* Caption */}
                    <div className="text-gray-800 mb-2">
                      <span className="font-semibold mr-2">
                        {post.trainer?.full_name || 'Unknown Trainer'}
                      </span>
                      {post.caption}
                    </div>

                    {/* Comments */}
                    {post.comment_count! > 0 && (
                      <div className="space-y-2 mb-3">
                        {post.comments?.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="text-sm text-gray-600">
                            <span className="font-semibold">{comment.user?.full_name}: </span>
                            {comment.content}
                          </div>
                        ))}
                        {post.comment_count! > 2 && (
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            View all {post.comment_count} comments
                          </button>
                        )}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        placeholder="Add a comment..."
                        className="flex-1 text-sm outline-none bg-transparent"
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
                          className="text-ig-blue font-semibold text-sm hover:text-ig-blue/80 disabled:opacity-50"
                        >
                          {commenting[post.id] ? 'Posting...' : 'Post'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="dark-surface rounded-xl p-6 sticky top-24">
              <h3 className="font-display text-xl mb-4 gradient-text">Discover</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => onNavigate('landing')}
                  className="w-full text-left p-3 rounded-lg hover:bg-dark-surface-light transition-colors"
                >
                  <div className="font-semibold text-dark-text-primary">Explore Plans</div>
                  <div className="text-sm text-dark-text-secondary">Find fitness programs</div>
                </button>
                <button 
                  onClick={() => onNavigate('feed')}
                  className="w-full text-left p-3 rounded-lg hover:bg-dark-surface-light transition-colors"
                >
                  <div className="font-semibold text-dark-text-primary">My Feed</div>
                  <div className="text-sm text-dark-text-secondary">Your personalized content</div>
                </button>
                {profile?.role === 'trainer' && (
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="w-full text-left p-3 rounded-lg hover:bg-dark-surface-light transition-colors"
                  >
                    <div className="font-semibold text-dark-text-primary">Dashboard</div>
                    <div className="text-sm text-dark-text-secondary">Manage your plans</div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
