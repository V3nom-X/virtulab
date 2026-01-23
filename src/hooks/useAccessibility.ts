import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessibilityPreferences {
  reduce_motion: boolean;
  high_contrast: boolean;
  color_blind_mode: boolean;
}

export function useAccessibility() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduce_motion: false,
    high_contrast: false,
    color_blind_mode: false,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        // Reset to defaults when logged out
        setPreferences({
          reduce_motion: false,
          high_contrast: false,
          color_blind_mode: false,
        });
        return;
      }

      const { data } = await supabase
        .from('user_preferences')
        .select('reduce_motion, high_contrast, color_blind_mode')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          reduce_motion: data.reduce_motion || false,
          high_contrast: data.high_contrast || false,
          color_blind_mode: data.color_blind_mode || false,
        });
      }
    };

    fetchPreferences();

    // Subscribe to changes
    const channel = supabase
      .channel('accessibility-preferences')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: user ? `user_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            setPreferences({
              reduce_motion: newData.reduce_motion || false,
              high_contrast: newData.high_contrast || false,
              color_blind_mode: newData.color_blind_mode || false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Apply preferences to document
  useEffect(() => {
    const html = document.documentElement;
    
    // Reduce motion
    if (preferences.reduce_motion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    // High contrast
    if (preferences.high_contrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Color blind mode
    if (preferences.color_blind_mode) {
      html.classList.add('color-blind-mode');
    } else {
      html.classList.remove('color-blind-mode');
    }
  }, [preferences]);

  return preferences;
}
