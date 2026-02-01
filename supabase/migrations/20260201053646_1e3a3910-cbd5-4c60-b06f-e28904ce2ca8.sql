-- Create storage buckets for file uploads

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents', 
  'documents', 
  false, 
  52428800 -- 50MB limit
);

-- Assignments bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'assignments', 
  'assignments', 
  false, 
  52428800 -- 50MB limit
);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can access all documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload any documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND public.is_admin(auth.uid()));

-- Storage policies for assignments
CREATE POLICY "Users can view assignment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments');

CREATE POLICY "Teachers can upload assignment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignments' AND public.is_teacher(auth.uid()));

CREATE POLICY "Students can upload submission files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assignments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all assignment files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'assignments' AND public.is_admin(auth.uid()));