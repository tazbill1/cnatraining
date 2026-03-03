UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'application/octet-stream']
WHERE id = 'training-videos';