-- Remove ea and region columns from feeders table
ALTER TABLE feeders 
DROP COLUMN IF EXISTS ea,
DROP COLUMN IF EXISTS region;
