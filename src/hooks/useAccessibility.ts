import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessibilityPreferences {
  reduce_motion: boolean;
  high_contrast: boolean;
  color_blind_mode: boolean;
}

// Track system preference so it can be combined with the stored user setting.
function getSystemReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useAccessibility() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduce_motion: false,
    high_contrast: false,
    color_blind_mode: false,
  });
  const [systemReduce, setSystemReduce] = useState<boolean>(getSystemReducedMotion());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystemReduce(mql.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
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

  // Combine system preference with user preference.
  const effectiveReduceMotion = preferences.reduce_motion || systemReduce;

  // Apply preferences to document
  useEffect(() => {
    const html = document.documentElement;

    if (effectiveReduceMotion) html.classList.add('reduce-motion');
    else html.classList.remove('reduce-motion');

    if (preferences.high_contrast) html.classList.add('high-contrast');
    else html.classList.remove('high-contrast');

    if (preferences.color_blind_mode) html.classList.add('color-blind-mode');
    else html.classList.remove('color-blind-mode');
  }, [preferences, effectiveReduceMotion]);

  return { ...preferences, reduce_motion: effectiveReduceMotion };
}

/**
 * Lightweight subscriber for components that only need the reduced-motion flag.
 * Listens to the system media query AND the global `.reduce-motion` class
 * (which the main hook sets when the logged-in user toggles the pref).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const sys = getSystemReducedMotion();
    const cls = document.documentElement.classList.contains('reduce-motion');
    return sys || cls;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const recompute = () => {
      const sys = mql?.matches ?? false;
      const cls = document.documentElement.classList.contains('reduce-motion');
      setReduced(sys || cls);
    };
    recompute();
    mql?.addEventListener?.('change', recompute);

    // Observe class changes on <html> so user-toggle updates propagate.
    const observer = new MutationObserver(recompute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mql?.removeEventListener?.('change', recompute);
      observer.disconnect();
    };
  }, []);

  return reduced;
}
