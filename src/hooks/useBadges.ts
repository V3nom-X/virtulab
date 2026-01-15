import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

export function useBadges() {
  const { user } = useAuth();

  const checkAndAwardBadge = async (badgeName: string) => {
    if (!user) return;

    try {
      // Get badge by name
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('name', badgeName)
        .single();

      if (!badge) return;

      // Check if already earned
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_id', badge.id)
        .single();

      if (existing) return;

      // Award badge
      const { error } = await supabase
        .from('user_badges')
        .insert({ user_id: user.id, badge_id: badge.id });

      if (!error) {
        toast.success(`🏆 Badge Earned: ${badge.name}!`, {
          description: badge.description || undefined
        });
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const checkExperimentBadges = async () => {
    if (!user) return;

    try {
      // Get completed experiments count
      const { data: progress } = await supabase
        .from('user_progress')
        .select('experiment_id, experiments(category)')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (!progress) return;

      const completed = progress.length;

      // First Experiment badge
      if (completed >= 1) {
        await checkAndAwardBadge('First Experiment');
      }

      // Category-specific badges
      const categoryCounts: Record<string, number> = {};
      progress.forEach((p: any) => {
        const category = p.experiments?.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      if ((categoryCounts['physics'] || 0) >= 10) {
        await checkAndAwardBadge('Physics Pro');
      }
      if ((categoryCounts['chemistry'] || 0) >= 5) {
        await checkAndAwardBadge('Chemistry Starter');
      }
      if ((categoryCounts['biology'] || 0) >= 5) {
        await checkAndAwardBadge('Biology Beginner');
      }

      // Science Explorer - all categories
      const categories = ['physics', 'chemistry', 'biology', 'earth_science'];
      if (categories.every(c => (categoryCounts[c] || 0) >= 1)) {
        await checkAndAwardBadge('Science Explorer');
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const checkQuizBadges = async () => {
    if (!user) return;

    try {
      const { data: results } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', user.id)
        .eq('passed', true);

      if (results && results.filter(r => r.score === 100).length >= 5) {
        await checkAndAwardBadge('Quiz Master');
      }
    } catch (error) {
      console.error('Error checking quiz badges:', error);
    }
  };

  const checkBuilderBadges = async () => {
    if (!user) return;

    try {
      const { data: experiments } = await supabase
        .from('custom_experiments')
        .select('id')
        .eq('user_id', user.id);

      if (experiments && experiments.length >= 5) {
        await checkAndAwardBadge('Master Builder');
      }
    } catch (error) {
      console.error('Error checking builder badges:', error);
    }
  };

  return {
    checkAndAwardBadge,
    checkExperimentBadges,
    checkQuizBadges,
    checkBuilderBadges
  };
}
