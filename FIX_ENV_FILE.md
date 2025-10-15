# ⚠️ Fix Your .env.local File

## Current Issue

Your Cloudinary credentials are in the wrong format. Environment variables need to use specific naming and format.

## What You Have (WRONG ❌)

```bash
cloud_name="dku1gnuat"
api_key="416529686821769"
api_secret="vwhdv2_kGVTWxyKoYWn0XOraWVY"
```

## What You Need (CORRECT ✅)

Open your `.env.local` file and replace the Cloudinary variables with this exact format:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dku1gnuat
CLOUDINARY_API_KEY=416529686821769
CLOUDINARY_API_SECRET=vwhdv2_kGVTWxyKoYWn0XOraWVY
```

## Key Differences

1. **Variable names** must be in UPPERCASE with underscores
2. **NO quotes** around variable names
3. **NO quotes** around values (or if using quotes, they become part of the value)
4. Must use the exact names: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Steps to Fix

1. Open `.env.local` in your code editor
2. Find the Cloudinary lines
3. Delete them
4. Copy and paste the correct format from above
5. Save the file
6. Restart your dev server: 
   ```bash
   # Press Ctrl+C to stop the server
   npm run dev
   ```

## After Fixing

Once you've updated the `.env.local` file and restarted the server, you can test the image upload:

1. Go to Dashboard → Classes
2. Click "Create New Class"
3. Try uploading an image
4. You should see "Uploading image to Cloudinary..." message
5. The image should upload successfully

If you still see errors, check the browser console for specific error messages.

