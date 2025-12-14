export type UserRole = 'user' | 'trainer';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface FitnessPlan {
  id: string;
  trainer_id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  trainer?: Profile;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  subscribed_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  trainer_id: string;
  followed_at: string;
}

export interface Post {
  id: string;
  trainer_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  updated_at: string;
  trainer?: Profile;
  likes?: Like[];
  comments?: Comment[];
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      fitness_plans: {
        Row: FitnessPlan;
        Insert: Omit<FitnessPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FitnessPlan, 'id' | 'trainer_id' | 'created_at' | 'updated_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'subscribed_at'>;
        Update: never;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'id' | 'followed_at'>;
        Update: never;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id' | 'trainer_id' | 'created_at' | 'updated_at'>>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, 'id' | 'created_at'>;
        Update: never;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Comment, 'id' | 'post_id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
