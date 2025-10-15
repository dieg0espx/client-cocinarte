# Cloudinary Image Upload Setup

This guide walks you through setting up Cloudinary for image uploads in the Cocinarte cooking class application.

## Overview

Images for cooking classes are now stored in Cloudinary instead of the database. This provides:
- **Better performance** - Images served via Cloudinary CDN
- **Automatic optimization** - Images are automatically compressed and optimized
- **Responsive images** - Automatic format selection (WebP for modern browsers)
- **Scalability** - No database size concerns
- **Transformations** - Images are automatically resized to 1200x675 (16:9 ratio)

## Prerequisites

1. A Cloudinary account (free tier available)
2. Node.js and npm installed
3. Access to your `.env.local` file

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Complete the registration process
4. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the Dashboard home page
3. You'll see your **Cloud Name**, **API Key**, and **API Secret**
4. Copy these values (you'll need them in the next step)

## Step 3: Configure Environment Variables

Add the following variables to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important Notes:**
- Replace `your_cloud_name_here`, `your_api_key_here`, and `your_api_secret_here` with your actual Cloudinary credentials
- **Do NOT use quotes** around the values (e.g., `CLOUDINARY_API_KEY=123456`, not `CLOUDINARY_API_KEY="123456"`)
- **Do NOT use JavaScript object syntax** (e.g., `cloud_name="xyz"` is wrong)
- Use the exact variable names shown above (uppercase with underscores)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is prefixed with `NEXT_PUBLIC_` because it may be used in client-side code
- **Never commit** your `.env.local` file to version control (it should be in `.gitignore`)

### ✅ Correct Format

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dku1gnuat
CLOUDINARY_API_KEY=416529686821769
CLOUDINARY_API_SECRET=vwhdv2_kGVTWxyKoYWn0XOraWVY
```

### ❌ Incorrect Formats

```bash
# WRONG - Do not use quotes around variable names
cloud_name="dku1gnuat"
api_key="416529686821769"

# WRONG - Do not use JavaScript object syntax
{ cloud_name: "dku1gnuat" }

# WRONG - Incorrect variable names (must match exactly)
CLOUDINARY_CLOUD_NAME=dku1gnuat
```

## Step 4: Run the Database Migration

Add the `image_url` column to your database:

### Option 1: Manual SQL (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/add-image-url-to-clases.sql`:

```sql
ALTER TABLE clases 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN clases.image_url IS 'URL or base64 string of the class image';
```

4. Execute the SQL

### Option 2: Using Migration Script

```bash
npx tsx scripts/add-image-url-migration.ts
```

## Step 5: Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 6: Test the Upload

1. Navigate to Dashboard → Classes
2. Click "Create New Class"
3. Scroll to the "Class Image" section
4. Drag and drop an image or click to browse
5. You should see "Uploading image to Cloudinary..." message
6. Once uploaded, the image preview will show the image from Cloudinary
7. Complete the form and create the class
8. Verify the image displays correctly

## Cloudinary Folder Structure

Images are organized in Cloudinary as follows:

```
coci/
  ├── image1.jpg
  ├── image2.png
  └── image3.jpg
```

All cooking class images are stored in the `coci` folder. You can change the folder name by modifying the `folder` parameter in the upload function.

## Image Transformations

Images are automatically transformed with the following settings:

- **Max dimensions**: 1200x675 pixels (16:9 aspect ratio)
- **Quality**: Auto (Cloudinary optimizes based on content)
- **Format**: Auto (WebP for modern browsers, fallback for older ones)

These settings are configured in `lib/cloudinary.ts` and can be customized.

## Troubleshooting

### Error: "Failed to upload image"

**Possible causes:**
1. Invalid Cloudinary credentials
2. Missing environment variables
3. Network connectivity issues

**Solutions:**
- Verify your `.env.local` file has the correct credentials
- Restart your development server after adding variables
- Check the browser console for detailed error messages
- Verify your Cloudinary account is active

### Error: "Cloudinary configuration error"

**Solution:**
- Make sure all three environment variables are set
- Check for typos in variable names
- Ensure there are no quotes around the values in `.env.local`

### Images not displaying

**Possible causes:**
1. Cloudinary URL is not being saved to database
2. CORS issues (unlikely with Cloudinary)

**Solutions:**
- Check the database to verify the `image_url` column contains Cloudinary URLs
- Verify the column type is `TEXT` (not limited VARCHAR)
- Check browser console for CORS errors

### Upload timeout

**Solution:**
- Cloudinary free tier has upload limits
- Try uploading a smaller image (under 5MB)
- Check your Cloudinary dashboard for quota usage

## Cloudinary Dashboard

View your uploaded images:
1. Log in to Cloudinary
2. Go to "Media Library"
3. Navigate to the `coci` folder
4. You'll see all uploaded class images

You can also:
- View usage statistics
- Manage transformations
- Set up upload presets
- Configure security settings

## Production Considerations

### Environment Variables on Vercel/Netlify

When deploying to production:

1. Go to your hosting platform's environment variables settings
2. Add the same three Cloudinary variables
3. Redeploy your application

### Security

- **API Secret**: Never expose this in client-side code
- **Upload API**: Currently handles uploads server-side (secure)
- **Signed Uploads**: Consider implementing signed uploads for additional security

### Quota Management

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

Monitor your usage in the Cloudinary dashboard. Upgrade if needed.

### Backup Strategy

Consider implementing:
- Regular backups of image URLs from database
- Export of images from Cloudinary Media Library
- Webhook to log all uploads

## Advanced Configuration

### Custom Transformations

Edit `lib/cloudinary.ts` to customize image transformations:

```typescript
transformation: [
  { width: 1920, height: 1080, crop: 'limit' }, // Larger images
  { quality: 80 }, // Fixed quality
  { fetch_format: 'auto' },
  { effect: 'sharpen' }, // Add sharpening
],
```

### Upload Presets

Create upload presets in Cloudinary dashboard for consistent transformations across all uploads.

### Multiple Folders

If needed, you can organize images by class type:

```typescript
const folder = `coci/${classType}` // e.g., coci/mini-chefcitos, coci/teen-culinary
```

## API Reference

### Upload Endpoint

**POST** `/api/upload-image`

Request body:
```json
{
  "file": "data:image/jpeg;base64,/9j/4AAQ...", // base64 encoded image
  "folder": "coci" // optional, defaults to "coci"
}
```

Response:
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/coci/abc123.jpg",
  "publicId": "coci/abc123"
}
```

### Delete Endpoint

**DELETE** `/api/upload-image`

Request body:
```json
{
  "publicId": "cocinarte/classes/abc123"
}
```

Response:
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Migration from Base64

If you have existing classes with base64 images in the database, you'll need to:

1. Create a migration script to extract base64 data
2. Upload each image to Cloudinary
3. Update the database with new Cloudinary URLs

Contact your developer for assistance with this migration.

## Support

For issues:
1. Check this documentation
2. Review Cloudinary documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
3. Check the browser console for errors
4. Verify environment variables are set correctly

## Additional Resources

- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary Transformations](https://cloudinary.com/documentation/image_transformations)

