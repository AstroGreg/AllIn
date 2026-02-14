-- Seed competitions/events for local development.
-- Uses ON CONFLICT guards to avoid duplicate inserts.

-- Events (top-level competitions)
INSERT INTO main.events (id, event_name, event_location, event_date)
VALUES
  ('2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Sunrise 10K Community Run', 'Brussels, Belgium', '2026-05-27'),
  ('d7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'BK Studentent 23', 'Ghent, Belgium', '2025-03-16'),
  ('0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'PK Indoor 2025', 'Berlin, Germany', '2025-01-11'),
  ('7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', 'IFAM 2024', 'Oordegem, Belgium', '2024-05-25')
ON CONFLICT (id) DO NOTHING;

-- Competition categories / disciplines per event
INSERT INTO main.event_competitions (id, event_id, competition_name, competition_type, competition_name_normalized)
VALUES
  (gen_random_uuid(), '2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', 'Road&Trail', 'road_trail', 'road&trail'),
  (gen_random_uuid(), '2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '5K', 'road_trail', '5k'),
  (gen_random_uuid(), '2b9a1d1b-2a16-4dd5-9f86-91d52f149c01', '10K', 'road_trail', '10k'),

  (gen_random_uuid(), 'd7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', 'Track&Field', 'track_field', 'track&field'),
  (gen_random_uuid(), 'd7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '100m', 'track_field', '100m'),
  (gen_random_uuid(), 'd7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '200m', 'track_field', '200m'),
  (gen_random_uuid(), 'd7a0a017-4d4b-43c6-8f25-cb9d6a3ac8d4', '400m', 'track_field', '400m'),

  (gen_random_uuid(), '0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', 'Track&Field', 'track_field', 'track&field'),
  (gen_random_uuid(), '0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '60m', 'track_field', '60m'),
  (gen_random_uuid(), '0e2c5f4d-1bcb-4a1e-9f2d-4d0d0e9c6d09', '400m', 'track_field', '400m'),

  (gen_random_uuid(), '7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', 'Track&Field', 'track_field', 'track&field'),
  (gen_random_uuid(), '7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', '800m', 'track_field', '800m'),
  (gen_random_uuid(), '7e0d0f7b-1c48-4b4f-9d8b-6d8a3f8c28a0', '1500m', 'track_field', '1500m')
ON CONFLICT (event_id, competition_name_normalized) DO NOTHING;
