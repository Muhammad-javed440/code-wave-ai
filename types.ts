
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  social_links?: {
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  media: string[]; // Image URLs
  video_url?: string; // Video URL
  project_url?: string; // External project link
  pdf_url?: string; // PDF file URL
  price?: number; // Price in USD
  rating: number; // Avg rating
  likes_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface VisitStats {
  total_visits: number;
  unique_users: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 0-100
  icon?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image_url?: string;
  email?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  display_order: number;
  created_at: string;
  updated_at: string;
}
