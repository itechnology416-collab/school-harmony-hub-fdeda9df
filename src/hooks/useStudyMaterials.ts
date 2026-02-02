import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface StudyMaterial {
  id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  entity_type: string | null;
  entity_id: string | null;
  owner_id: string;
  is_public: boolean | null;
  created_at: string;
  class?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

interface UploadMaterialInput {
  file: File;
  name: string;
  category?: string;
  classId?: string;
  subjectId?: string;
  isPublic?: boolean;
}

export function useStudyMaterials(classId?: string, subjectId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const materialsQuery = useQuery({
    queryKey: ['study-materials', user?.id, classId, subjectId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .eq('entity_type', 'study_material')
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('category', classId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch class and subject details separately if needed
      const materials: StudyMaterial[] = data || [];
      return materials;
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (input: UploadMaterialInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { file, name, category, classId, isPublic } = input;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          category: classId || category,
          entity_type: 'study_material',
          entity_id: classId,
          owner_id: user.id,
          is_public: isPublic || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      toast.success('Study material uploaded successfully!');
    },
    onError: (error) => {
      toast.error('Failed to upload: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get file path first
      const { data: doc } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();

      if (doc?.file_path) {
        await supabase.storage.from('documents').remove([doc.file_path]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials'] });
      toast.success('Material deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const getDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);
    return data?.signedUrl;
  };

  return {
    materials: materialsQuery.data || [],
    isLoading: materialsQuery.isLoading,
    uploadMaterial: uploadMutation.mutate,
    deleteMaterial: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    getDownloadUrl,
  };
}
