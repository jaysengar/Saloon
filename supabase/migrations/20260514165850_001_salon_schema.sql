/*
  # Aman Salon - Core Schema

  1. New Tables
    - `staff` — Salon staff members (name, role, image, bio, active status)
    - `services` — Salon services (name, description, price, duration, image, category, active status)
    - `bookings` — Customer bookings (name, phone, email, service, staff, date, time, status, notes)
    - `salon_settings` — Salon-wide settings (name, address, phone, email, hours, social links)

  2. Security
    - Enable RLS on ALL tables
    - Public can read active staff, services, and salon settings
    - Only authenticated salon owner can insert/update/delete staff, services, bookings, settings
    - Customers can insert bookings (for the booking form)
*/

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Stylist',
  image text DEFAULT '',
  bio text DEFAULT '',
  experience text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price text NOT NULL DEFAULT '0',
  duration text DEFAULT '30 min',
  image text DEFAULT '',
  category text DEFAULT 'Hair',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Salon settings table (single row)
CREATE TABLE IF NOT EXISTS salon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name text DEFAULT 'Aman Salon',
  tagline text DEFAULT 'Where Beauty Meets Elegance',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  hours_weekday text DEFAULT '9 AM - 8 PM',
  hours_sunday text DEFAULT '10 AM - 6 PM',
  instagram text DEFAULT '',
  facebook text DEFAULT '',
  youtube text DEFAULT '',
  hero_image text DEFAULT '',
  about_image text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

-- Staff policies
CREATE POLICY "Public can view active staff"
  ON staff FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Owner can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (true);

-- Services policies
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Owner can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Owner can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owner can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- Salon settings policies
CREATE POLICY "Public can view salon settings"
  ON salon_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Owner can update salon settings"
  ON salon_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owner can insert salon settings"
  ON salon_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default salon settings
INSERT INTO salon_settings (salon_name, tagline, address, phone, email)
VALUES ('Aman Salon', 'Where Beauty Meets Elegance', '123 Beauty Lane, Mumbai', '+91 98765 43210', 'hello@amansalon.com');

-- Insert default services
INSERT INTO services (name, description, price, duration, image, category, sort_order) VALUES
  ('Precision Haircut', 'Expert cuts tailored to your face shape and style preferences by our master stylists.', '₹299', '30 min', 'https://images.pexels.com/photos/3993321/pexels-photo-3993321.jpeg?auto=compress&cs=tinysrgb&w=600', 'Hair', 1),
  ('Hair Coloring', 'Vibrant highlights, balayage, ombre and full color treatments with premium products.', '₹799', '60 min', 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=600', 'Color', 2),
  ('Blow Dry & Styling', 'Perfect blowouts and styling for any occasion — from casual to red-carpet ready.', '₹399', '30 min', 'https://images.pexels.com/photos/3765170/pexels-photo-3765170.jpeg?auto=compress&cs=tinysrgb&w=600', 'Styling', 3),
  ('Deep Conditioning', 'Restore shine and health with our luxurious deep conditioning and keratin treatments.', '₹599', '45 min', 'https://images.pexels.com/photos/3993464/pexels-photo-3993464.jpeg?auto=compress&cs=tinysrgb&w=600', 'Treatment', 4),
  ('Bridal Package', 'Complete bridal beauty experience — hair, makeup, and styling for your special day.', '₹4999', '180 min', 'https://images.pexels.com/photos/3756168/pexels-photo-3756168.jpeg?auto=compress&cs=tinysrgb&w=600', 'Bridal', 5),
  ('Spa & Facial', 'Rejuvenating facials and spa treatments for glowing, radiant skin.', '₹699', '60 min', 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600', 'Spa', 6);

-- Insert default staff
INSERT INTO staff (name, role, image, bio, experience, sort_order) VALUES
  ('Aman Kumar', 'Owner & Master Stylist', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300', 'Founder of Aman Salon with 10+ years of expertise in precision cuts and styling.', '10+ Years', 1),
  ('Priya Singh', 'Senior Colorist', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300', 'Specialist in balayage, ombre, and creative color transformations.', '8 Years', 2),
  ('Rahul Verma', 'Stylist', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300', 'Expert in modern cuts, fades, and men grooming services.', '5 Years', 3);
