-- ============================================================
-- Reborn Unisex Salon — Full Services Price List
-- Run this in Supabase SQL Editor
-- First deletes all old/default services, then inserts fresh ones
-- ============================================================

-- Step 1: Clear existing default services (optional — comment out if you want to keep old ones)
DELETE FROM services;

-- Step 2: Insert all services with correct prices and categories
INSERT INTO services (name, description, price, duration, image, category, is_active, sort_order) VALUES

-- ───────────────────────────────────────────
-- MEN'S SERVICES
-- ───────────────────────────────────────────
('Hair Cut', 'Expert haircut tailored to your style.', '₹250', '30 min', '', 'Men', true, 1),
('Advance Hair Cut', 'Premium styling cut by our master stylist.', '₹400', '45 min', '', 'Men', true, 2),
('Beard Trimming', 'Clean and precise beard shaping.', '₹150', '20 min', '', 'Men', true, 3),
('Beard Trimming (Styling)', 'Detailed beard styling and shaping.', '₹200', '25 min', '', 'Men', true, 4),
('Shaving', 'Classic smooth shave with premium products.', '₹100', '20 min', '', 'Men', true, 5),
('Kid Hair Cut (below 5 yrs)', 'Gentle haircut for kids below 5 years.', '₹200', '20 min', '', 'Men', true, 6),
('Extra Hair Wash', 'Add-on hair wash service.', '₹50', '10 min', '', 'Men', true, 7),

-- ───────────────────────────────────────────
-- WOMEN'S SERVICES
-- ───────────────────────────────────────────
('Hair Cut (Women)', 'Professional women''s haircut by expert stylists.', '₹400', '45 min', '', 'Women', true, 10),
('Kids Hair Cut (below 5 yrs)', 'Gentle haircut for girls below 5 years.', '₹300', '20 min', '', 'Women', true, 11),
('Layer Hair Cut', 'Layered cut for volume and movement.', '₹650', '60 min', '', 'Women', true, 12),
('Hair Trimming', 'Light trimming to remove split ends.', '₹300', '30 min', '', 'Women', true, 13),
('Tong', 'Tong curling / waving for a glamorous look.', '₹650', '45 min', '', 'Women', true, 14),
('Hair Wash & Blow Dry (Normal)', 'Wash and blow dry with normal products.', '₹300', '30 min', '', 'Women', true, 15),
('Hair Wash & Blow Dry (Loreal)', 'Wash and blow dry with Loreal products.', '₹400', '35 min', '', 'Women', true, 16),
('Hair Wash & Blow Dry (Keratin)', 'Wash and blow dry with Keratin products.', '₹600', '40 min', '', 'Women', true, 17),
('Hair Wash & Blow Dry (Moroccan)', 'Wash and blow dry with Moroccan oil products.', '₹500', '40 min', '', 'Women', true, 18),
('Hair Ironing', 'Smooth and sleek iron finish for any occasion.', '₹650', '45 min', '', 'Women', true, 19),

-- ───────────────────────────────────────────
-- THREADING
-- ───────────────────────────────────────────
('Threading (Normal)', 'Eyebrow or upper lip threading.', '₹100', '10 min', '', 'Threading', true, 20),
('Side Lock Threading', 'Side lock area threading for clean finish.', '₹150', '10 min', '', 'Threading', true, 21),
('Full Face Threading', 'Complete face threading for smooth skin.', '₹350', '25 min', '', 'Threading', true, 22),

-- ───────────────────────────────────────────
-- WAXING
-- ───────────────────────────────────────────
('Upper Lip / Chin Wax', 'Quick and clean upper lip or chin wax.', '₹100', '10 min', '', 'Waxing', true, 30),
('Side Lock Wax', 'Side lock area waxing.', '₹250', '15 min', '', 'Waxing', true, 31),
('Face Wax', 'Full face waxing for smooth skin.', '₹500', '30 min', '', 'Waxing', true, 32),
('Leg Wax', 'Complete leg waxing.', '₹500', '40 min', '', 'Waxing', true, 33),
('Stomach Wax', 'Stomach area waxing.', '₹500', '20 min', '', 'Waxing', true, 34),
('Back Wax', 'Back area waxing.', '₹500', '25 min', '', 'Waxing', true, 35),
('Hand Wax', 'Complete hand waxing.', '₹400', '30 min', '', 'Waxing', true, 36),
('Under Arms Wax', 'Under arms waxing.', '₹100', '10 min', '', 'Waxing', true, 37),
('Bikini Wax', 'Bikini area waxing.', '₹2000', '30 min', '', 'Waxing', true, 38),
('Full Body Wax', 'Complete full body waxing.', '₹2000', '90 min', '', 'Waxing', true, 39),
('Body Polishing', 'Full body polishing for radiant skin.', '₹2000', '90 min', '', 'Waxing', true, 40),

-- ───────────────────────────────────────────
-- FACIAL & SKIN CARE
-- ───────────────────────────────────────────
('D-Tan', 'De-tanning treatment for glowing skin.', '₹500', '30 min', '', 'Facial', true, 50),
('Cleanup (Charcoal)', 'Charcoal deep pore cleanup.', '₹600', '45 min', '', 'Facial', true, 51),
('Cleanup (VLCC/Richfeel)', 'Premium VLCC or Richfeel brand cleanup.', '₹800', '45 min', '', 'Facial', true, 52),
('Facial – Gold / Fruit / Lotus', 'Branded facial for rejuvenated skin.', '₹800 – ₹1500', '60 min', '', 'Facial', true, 53),
('Facial – O3+', 'Premium O3+ facial for glowing skin.', '₹1500 – ₹3000', '60 min', '', 'Facial', true, 54),

-- ───────────────────────────────────────────
-- HAIR COLOURING
-- ───────────────────────────────────────────
('Hair Colour – Men (Matrix/Loreal/Inoa)', 'Men''s hair colouring with premium brands.', '₹700 – ₹1000', '60 min', '', 'Color', true, 60),
('Global Hair Colour – Women', 'Full global hair colouring for women.', '₹3000 – ₹5000', '90 min', '', 'Color', true, 61),
('Root Touchup', 'Root touch-up to cover regrowth.', '₹800 – ₹1200', '45 min', '', 'Color', true, 62),
('Highlights (per strip)', 'Individual highlight strips for dimension.', '₹250', '30 min', '', 'Color', true, 63),

-- ───────────────────────────────────────────
-- HAIR TREATMENTS
-- ───────────────────────────────────────────
('Hair Smoothing / Straightening', 'Long-lasting smoothing and straightening treatment.', '₹5000 onwards', '180 min', '', 'Treatment', true, 70),
('Keratin Treatment', 'Keratin infusion for frizz-free smooth hair.', '₹4000 onwards', '150 min', '', 'Treatment', true, 71),
('Botox Treatment', 'Hair botox for deep repair and shine.', '₹6000 onwards', '180 min', '', 'Treatment', true, 72),
('Hair Spa', 'Relaxing hair spa for nourishment and shine.', '₹800 – ₹2000', '60 min', '', 'Treatment', true, 73),
('Head Massage (Oil)', 'Relaxing oil head massage.', '₹400 – ₹500', '30 min', '', 'Treatment', true, 74),

-- ───────────────────────────────────────────
-- NAILS & MAKEUP
-- ───────────────────────────────────────────
('Pedicure (Basic to Premium)', 'Foot care and nail treatment.', '₹500 – ₹1500', '45 min', '', 'Grooming', true, 80),
('Manicure (Basic to Premium)', 'Hand care and nail treatment.', '₹500 – ₹1500', '45 min', '', 'Grooming', true, 81),
('Nail Extension (Gel/Acrylic)', 'Gel or acrylic nail extensions.', '₹1500 – ₹3000', '90 min', '', 'Grooming', true, 82),
('Bridal Makeup', 'Complete bridal makeup for your special day.', '₹5000 onwards', '180 min', '', 'Bridal', true, 83),
('Normal Makeup', 'Everyday or party makeup look.', '₹1500 onwards', '60 min', '', 'Bridal', true, 84),
('Saree Draping', 'Elegant saree draping service.', '₹500', '30 min', '', 'Bridal', true, 85),

-- ───────────────────────────────────────────
-- MEHANDI & TATTOO
-- ───────────────────────────────────────────
('Mehandi (Normal to Bridal)', 'Beautiful mehandi designs for all occasions.', '₹500 – ₹3000', '60 min', '', 'Other', true, 90),
('Permanent Tattoo', 'Professional permanent tattoo art.', '₹300 per sq. inch', '60 min', '', 'Other', true, 91);
