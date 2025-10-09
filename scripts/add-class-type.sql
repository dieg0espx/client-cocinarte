-- Add class_type column to clases table
ALTER TABLE clases 
ADD COLUMN IF NOT EXISTS class_type VARCHAR(50);

-- Add index for class_type for better query performance
CREATE INDEX IF NOT EXISTS idx_clases_class_type ON clases(class_type);

-- Add comment to explain class_type field
COMMENT ON COLUMN clases.class_type IS 'Type of class: Mini Chefcitos, Chefcitos Together, or Cocina Creativa';

