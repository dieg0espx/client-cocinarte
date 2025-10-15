# Image Upload Feature for Cooking Classes

This document describes the newly added drag-and-drop image upload feature for cooking classes in the dashboard.

## Overview

The Create/Edit Cooking Class form now includes a drag-and-drop image upload section that allows administrators to add visual content to their classes.

## Features

### Drag and Drop
- Drag image files directly onto the upload area
- Visual feedback with hover effects and animations
- Drop zone highlights when dragging an image over it

### Click to Browse
- Click anywhere on the upload area to open a file browser
- Select images from your computer

### Image Preview
- Instant preview of uploaded images
- Displays images in a 16:9 aspect ratio
- Remove button to delete the uploaded image

### Validation
- Accepts only image files (PNG, JPG, GIF, etc.)
- Maximum file size: 5MB (configurable)
- Error messages for invalid files

## How to Use

### Creating a New Class with an Image

1. Navigate to the Dashboard → Classes
2. Click "Create New Class"
3. Fill in the class details
4. In the "Class Image" section:
   - Drag and drop an image file onto the upload area, OR
   - Click on the upload area to browse for an image
5. Preview will appear immediately after upload
6. Complete the form and click "Create Class"

### Editing a Class Image

1. Open an existing class for editing
2. If the class already has an image, it will be displayed
3. Click the X button to remove the current image
4. Upload a new image using drag-and-drop or click to browse
5. Save your changes

### Removing an Image

1. Open a class with an existing image
2. Click the X button in the top-right corner of the image preview
3. The image will be removed and the upload area will reappear
4. Save the class to confirm the removal

## Technical Details

### Database Migration

Before using this feature, you need to add the `image_url` column to the `clases` table:

**Option 1: Manual SQL (Recommended)**
```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE clases 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN clases.image_url IS 'URL or base64 string of the class image';
```

**Option 2: Using Migration Script**
```bash
npx tsx scripts/add-image-url-migration.ts
```

### Current Implementation

- Images are uploaded to **Cloudinary** (cloud-based image management service)
- Only the Cloudinary URL is stored in the database
- Automatic image optimization and CDN delivery
- Images are automatically resized to 1200x675 (16:9 ratio)
- Automatic format selection (WebP for modern browsers)
- Maximum recommended image size: 5MB

### Features Included

✅ **Cloudinary CDN** - Fast image delivery worldwide  
✅ **Automatic Optimization** - Images compressed and optimized  
✅ **Responsive Images** - WebP format for modern browsers  
✅ **Image Transformations** - Auto-resize to standard dimensions  
✅ **Scalable Storage** - No database size concerns  

### Future Enhancements

For advanced usage, consider:

1. **Multiple Images**
   - Image galleries per class
   - Before/after photos
   - Step-by-step cooking photos

2. **Advanced Transformations**
   - Image cropping before upload
   - Multiple size variants (thumbnail, medium, full)
   - Custom aspect ratios per class type

3. **Additional Features**
   - Video upload support
   - Recipe PDF attachments
   - Class material documents

## File Structure

### New Files Created

```
components/
  ui/
    image-upload.tsx              # Reusable drag-and-drop component

app/
  api/
    upload-image/
      route.ts                    # API endpoint for Cloudinary uploads

lib/
  cloudinary.ts                   # Cloudinary configuration and utilities

scripts/
  add-image-url-to-clases.sql    # Database migration
  add-image-url-migration.ts     # TypeScript migration runner

IMAGE_UPLOAD_FEATURE.md           # Feature documentation
CLOUDINARY_SETUP.md               # Cloudinary setup guide
FIX_ENV_FILE.md                   # Environment variable setup guide
.env.example                      # Environment variables example
```

### Modified Files

```
components/
  dashboard/
    class-form.tsx                # Added Cloudinary image upload integration

lib/
  types/
    clases.ts                     # Added image_url field to types

package.json                      # Added cloudinary dependency
```

## Component API

### ImageUpload Component

```typescript
interface ImageUploadProps {
  value?: string | null         // Current image URL or base64
  onChange: (file: File | null, previewUrl: string | null) => void
  maxSizeMB?: number            // Default: 5
  accept?: string               // Default: 'image/*'
  disabled?: boolean            // Default: false
}
```

### Usage Example

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImageUrl(previewUrl)
    // Handle file upload to storage if needed
  }
  
  return (
    <ImageUpload
      value={imageUrl}
      onChange={handleImageChange}
      maxSizeMB={5}
    />
  )
}
```

## Browser Support

- Modern browsers with File API support
- Drag and drop supported in Chrome, Firefox, Safari, Edge
- Fallback to click-to-browse on older browsers

## Accessibility

- Keyboard accessible (click to browse)
- Screen reader friendly labels
- Clear error messages
- Visual feedback for all interactions

## Performance Considerations

### Cloudinary Storage (Current Implementation)
- ✅ Production-ready and scalable
- ✅ Global CDN for fast delivery
- ✅ Automatic image optimization
- ✅ Minimal database footprint (only stores URLs)
- ✅ Automatic format conversion (WebP, AVIF)
- ✅ Responsive images with automatic quality adjustment

### Best Practices
- Images are automatically optimized on upload
- CDN caching ensures fast load times worldwide
- No additional optimization needed for basic usage
- Monitor Cloudinary quota in dashboard
- Consider upload presets for consistent transformations

## Troubleshooting

### Image Not Displaying
- Check browser console for errors
- Verify the image_url column exists in the database
- Ensure image is under 5MB

### Upload Failed
- Check file type (must be image/*)
- Verify file size (under 5MB)
- Check network connection

### Migration Failed
- Run SQL manually in Supabase SQL Editor
- Check database permissions
- Verify environment variables are set

## Support

For issues or questions about this feature:
1. Check this documentation
2. Review the component source code
3. Check browser console for errors
4. Verify database schema is up to date

