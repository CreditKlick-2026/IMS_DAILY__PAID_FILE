ALTER TABLE associate_tenured_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;
ALTER TABLE associate_vintage_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;
ALTER TABLE leadership_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;
ALTER TABLE special_grid_rules ADD COLUMN IF NOT EXISTS process_id INTEGER;
