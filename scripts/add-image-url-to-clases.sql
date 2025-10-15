-- Add image_url column to clases table
ALTER TABLE clases 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN clases.image_url IS 'URL or base64 string of the class image';

