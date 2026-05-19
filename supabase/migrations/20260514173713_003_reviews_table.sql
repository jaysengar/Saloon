/*
  # Create reviews table

  1. New Tables
    - `reviews` — Customer reviews with name, rating, comment, photo (pfp), and active status
      - `id` (uuid, primary key)
      - `name` (text, customer name)
      - `rating` (integer, 1-5 stars)
      - `comment` (text, review text)
      - `photo` (text, URL to customer profile photo)
      - `is_active` (boolean, owner can hide/show)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reviews`
    - Public can read active reviews
    - Anyone can submit a review (INSERT)
    - Only authenticated owner can update/delete reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  photo text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Owner can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can submit a review"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample reviews
INSERT INTO reviews (name, rating, comment, photo, sort_order) VALUES
  ('Priya Sharma', 5, 'Absolutely love this salon! The stylists are incredibly talented and the ambiance is so luxurious. My hair has never looked better.', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', 1),
  ('Ankit Verma', 5, 'Best salon experience in the city. The attention to detail is remarkable. Highly recommend the grooming package!', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', 2),
  ('Sneha Patel', 4, 'Wonderful bridal styling for my wedding. The team made me feel like a queen. The only reason for 4 stars is the wait time.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', 3),
  ('Rahul Kumar', 5, 'The color transformation was exactly what I wanted. Professional, clean, and the staff is super friendly.', 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200', 4),
  ('Meera Singh', 5, 'From the moment you walk in, you feel pampered. The spa treatments are heavenly. Will definitely be a regular!', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', 5);
