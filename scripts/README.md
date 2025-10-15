# Clases Table Setup

This directory contains scripts to create and manage the `clases` table in your Supabase database.

## Table Structure

The `clases` table includes the following fields:

- `id` (UUID, Primary Key) - Unique identifier
- `title` (VARCHAR(255)) - Class title
- `description` (TEXT) - Class description
- `date` (DATE) - Class date
- `time` (TIME) - Class time
- `minStudents` (INTEGER) - Minimum students required
- `maxStudents` (INTEGER) - Maximum students allowed
- `price` (DECIMAL(10,2)) - Class price
- `classDuration` (INTEGER) - Duration in minutes
- `image_url` (TEXT) - URL or base64 string of the class image
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Setup Options

### Option 1: Manual SQL Execution (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `create-clases-table.sql`
4. Execute the SQL

### Option 2: Using the Service Role Key

1. Make sure you have the environment variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Run the TypeScript script:
   ```bash
   npx tsx scripts/setup-clases-table.ts
   ```

### Option 3: Using Node.js Script

1. Make sure you have the environment variables set
2. Run the JavaScript script:
   ```bash
   node scripts/create-clases-table.js
   ```

## Usage

After creating the table, you can use the `ClasesService` class in your application:

```typescript
import { ClasesService } from '@/lib/supabase/clases';

const clasesService = new ClasesService();

// Get all clases
const clases = await clasesService.getAllClases();

// Get upcoming clases
const upcoming = await clasesService.getUpcomingClases();

// Create a new clase
const newClase = await clasesService.createClase({
  title: 'Spanish for Beginners',
  description: 'Learn basic Spanish',
  date: '2024-02-15',
  time: '10:00:00',
  minStudents: 3,
  maxStudents: 8,
  price: 25.00,
  classDuration: 60
});
```

## Sample Data

The SQL script includes sample data to help you get started:

- Spanish for Beginners
- Advanced Conversation
- Spanish Grammar Workshop
- Kids Spanish Fun

## Indexes

The table includes indexes on:
- `date` - for efficient date-based queries
- `time` - for efficient time-based queries

## Triggers

An automatic trigger updates the `updated_at` timestamp whenever a record is modified.

## Migrations

### Adding Image URL Support

If you already have the `clases` table created, you'll need to run the migration to add the `image_url` column:

**Option 1: Manual SQL Execution (Recommended)**
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add-image-url-to-clases.sql`
4. Execute the SQL

**Option 2: Using TypeScript Script**
```bash
npx tsx scripts/add-image-url-migration.ts
```

This migration adds support for uploading and storing images with cooking classes.
