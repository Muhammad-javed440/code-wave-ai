# Storage Bucket RLS Policies

## Bucket: avatars

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Public read
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users upload own avatar (path starts with their uid)
CREATE POLICY "avatars_upload_own" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users update/delete own avatar
CREATE POLICY "avatars_update_own" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_delete_own" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Bucket: project-media

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-media', 'project-media', true);

-- Public read
CREATE POLICY "project_media_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');

-- Admin-only upload
CREATE POLICY "project_media_admin_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Admin-only update
CREATE POLICY "project_media_admin_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Admin-only delete
CREATE POLICY "project_media_admin_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```
