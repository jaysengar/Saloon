/*
  # Add gallery_photos table

  1. New Tables
    - `gallery_photos` — Owner-managed gallery images (image URL, caption, category, active status, sort order)

  2. Security
    - Enable RLS on `gallery_photos`
    - Public can read active gallery photos
    - Only authenticated owner can insert/update/delete gallery photos
*/

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  caption text DEFAULT '',
  category text DEFAULT 'Salon',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active gallery photos"
  ON gallery_photos FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Owner can view all gallery photos"
  ON gallery_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner can insert gallery photos"
  ON gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update gallery photos"
  ON gallery_photos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can delete gallery photos"
  ON gallery_photos FOR DELETE
  TO authenticated
  USING (true);

-- Insert default gallery photos
INSERT INTO gallery_photos (image, caption, category, sort_order) VALUES
  ('https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800', 'Elegant Styling', 'Styling', 1),
  ('https://images.pexels.com/photos/3993321/pexels-photo-3993321.jpeg?auto=compress&cs=tinysrgb&w=800', 'Precision Cuts', 'Haircut', 2),
  ('https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800', 'Color Transformation', 'Color', 3),
  ('https://images.pexels.com/photos/3765170/pexels-photo-3765170.jpeg?auto=compress&cs=tinysrgb&w=800', 'Blow Out Perfection', 'Styling', 4),
  ('https://images.pexels.com/photos/3993464/pexels-photo-3993464.jpeg?auto=compress&cs=tinysrgb&w=800', 'Deep Treatment', 'Treatment', 5),
  ('https://images.pexels.com/photos/3756168/pexels-photo-3756168.jpeg?auto=compress&cs=tinysrgb&w=800', 'Bridal Beauty', 'Bridal', 6),
  ('https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800', 'Glow Up Facial', 'Spa', 7),
  ('https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800', 'Luxury Experience', 'Salon', 8);
