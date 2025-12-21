import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Experiment {
  id: string;
  title: string;
  description: string | null;
  category: 'physics' | 'chemistry' | 'biology' | 'earth_science';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  thumbnail_url: string | null;
  simulation_type: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  experiment_id: string;
  completed: boolean;
  score: number | null;
  time_spent_seconds: number;
  last_accessed_at: string;
  completed_at: string | null;
}

export const useExperiments = (category?: string, difficulty?: string) => {
  return useQuery({
    queryKey: ['experiments', category, difficulty],
    queryFn: async () => {
      let query = supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category as 'physics' | 'chemistry' | 'biology' | 'earth_science');
      }
      if (difficulty && difficulty !== 'all') {
        query = query.eq('difficulty', difficulty as 'beginner' | 'intermediate' | 'advanced');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Experiment[];
    }
  });
};

export const useFeaturedExperiments = () => {
  return useQuery({
    queryKey: ['experiments', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('is_featured', true)
        .limit(6);

      if (error) throw error;
      return data as Experiment[];
    }
  });
};

export const useExperiment = (id: string) => {
  return useQuery({
    queryKey: ['experiment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Experiment;
    },
    enabled: !!id
  });
};

export const useUserProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      experimentId, 
      timeSpent, 
      completed, 
      score 
    }: { 
      experimentId: string; 
      timeSpent?: number; 
      completed?: boolean;
      score?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('experiment_id', experimentId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            time_spent_seconds: (existing.time_spent_seconds || 0) + (timeSpent || 0),
            completed: completed ?? existing.completed,
            score: score ?? existing.score,
            last_accessed_at: new Date().toISOString(),
            completed_at: completed ? new Date().toISOString() : existing.completed_at
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            experiment_id: experimentId,
            time_spent_seconds: timeSpent || 0,
            completed: completed || false,
            score: score
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
  });
};

export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('points', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
};

export const useUserBadges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};
