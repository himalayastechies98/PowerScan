# Supabase Storage Bucket Setup for Feeders KML Files

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set bucket name: `feeder-kml-files`
5. Set to **Private** (not public)
6. Click **Create bucket**
7. Click on the bucket name to open it
8. Go to **Policies** tab
9. Add the following policies:

### Policy 1: Authenticated users can view KML files
- **Policy name**: Authenticated users can view KML files
- **Allowed operation**: SELECT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'feeder-kml-files'
```

### Policy 2: Authenticated users can upload KML files
- **Policy name**: Authenticated users can upload KML files
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'feeder-kml-files'
```

### Policy 3: Authenticated users can update KML files
- **Policy name**: Authenticated users can update KML files  
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'feeder-kml-files'
```

### Policy 4: Authenticated users can delete KML files
- **Policy name**: Authenticated users can delete KML files
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'feeder-kml-files'
```

## Option 2: Via SQL (Supabase SQL Editor)

Run this SQL in the Supabase SQL Editor:

```sql
-- Insert the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('feeder-kml-files', 'feeder-kml-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can view KML files"
ON storage.objects FOR SELECT
USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload KML files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update KML files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete KML files"
ON storage.objects FOR DELETE
USING (bucket_id = 'feeder-kml-files' AND auth.role() = 'authenticated');
```

## Verification

After setup, you should be able to:
1. Navigate to http://localhost:8080/feeders
2. Click "Create" button
3. Fill in feeder details and upload a KML file
4. The file should upload successfully to the storage bucket
