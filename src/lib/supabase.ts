import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Staff = {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  experience: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string | null;
  staff_id: string | null;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  services?: Service | null;
  staff?: Staff | null;
};

export type GalleryPhoto = {
  id: string;
  image: string;
  caption: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photo: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SalonSettings = {
  id: string;
  salon_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours_weekday: string;
  hours_sunday: string;
  instagram: string;
  facebook: string;
  youtube: string;
  hero_image: string;
  about_image: string;
  created_at: string;
  updated_at: string;
};
