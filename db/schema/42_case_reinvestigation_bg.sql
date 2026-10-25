-- Migration 42: Add reinvestigation_bg_url to cases table
-- Used for 2D crime scene investigation background per case

ALTER TABLE cases
ADD COLUMN IF NOT EXISTS reinvestigation_bg_url TEXT;

-- Backfill case_000 with its default crime scene background
UPDATE cases
SET reinvestigation_bg_url = '/images/cases/case_000/crime_scene_360.jpg'
WHERE slug = 'case_000' AND reinvestigation_bg_url IS NULL;
