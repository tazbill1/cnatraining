
-- Create training-videos storage bucket (private, requires auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-videos',
  'training-videos',
  false,
  104857600,  -- 100MB
  ARRAY['video/mp4', 'video/webm']
);

-- RLS: Authenticated users can read videos
CREATE POLICY "Authenticated users can view training videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'training-videos');

-- RLS: Managers can upload videos
CREATE POLICY "Managers can upload training videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'training-videos'
  AND public.has_role(auth.uid(), 'manager')
);

-- RLS: Managers can delete videos
CREATE POLICY "Managers can delete training videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'training-videos'
  AND public.has_role(auth.uid(), 'manager')
);
