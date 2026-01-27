-- Seed data for inspections table
-- This script inserts sample inspection records using existing feeders and cars

-- Insert inspections using the first 2 feeders and various cars
-- Note: This assumes you have at least 2 feeders and 2 cars in your database
-- Adjust the LIMIT and specific selections as needed

INSERT INTO public.inspections (
  id_unico,
  name,
  ea,
  feeder_id,
  car_id,
  status,
  measures_red,
  measures_yellow,
  inspection_type,
  last_measure_date
)
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014237',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 0),
  'Finalizada',
  5,
  97,
  'Thermo-T',
  '2025-10-28'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014238',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 1),
  'En Progreso',
  12,
  45,
  'Visual',
  '2025-10-29'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014239',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 0),
  'Finalizada',
  3,
  120,
  'Thermo-T',
  '2025-10-27'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014240',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 1),
  'Pendiente',
  8,
  67,
  'Híbrido',
  '2025-10-26'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014241',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 0),
  'Finalizada',
  2,
  89,
  'Visual',
  '2025-10-30'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014242',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 1),
  'En Progreso',
  15,
  34,
  'Thermo-T',
  '2025-10-25'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014243',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 0),
  'Finalizada',
  1,
  156,
  'Visual',
  '2025-10-24'::date
UNION ALL
SELECT 
  gen_random_uuid()::text,
  '2025 EMT - RSI',
  'RSI_088009_2014244',
  (SELECT id_unico FROM public.feeders ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id_unico FROM public.cars ORDER BY created_at LIMIT 1 OFFSET 1),
  'Finalizada',
  7,
  78,
  'Thermo-T',
  '2025-10-23'::date;
