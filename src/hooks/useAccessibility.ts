import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessibilityPreferences {
  reduce_motion: boolean;
  high_contrast: boolean;
  color_blind_mode: boolean;
  parallax_enabled: boolean;
  cinematic_video_enabled: boolean;
}

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
    parallax_enabled: true,
    cinematic_video_enabled: true,
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
          parallax_enabled: true,
          cinematic_video_enabled: true,
        });
        return;
      }

      const { data } = await supabase
        .from('user_preferences')
        .select('reduce_motion, high_contrast, color_blind_mode, parallax_enabled, cinematic_video_enabled')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          reduce_motion: data.reduce_motion || false,
          high_contrast: data.high_contrast || false,
          color_blind_mode: data.color_blind_mode || false,
          parallax_enabled: data.parallax_enabled !== false,
          cinematic_video_enabled: (data as any).cinematic_video_enabled !== false,
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
              parallax_enabled: newData.parallax_enabled !== false,
              cinematic_video_enabled: newData.cinematic_video_enabled !== false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const effectiveReduceMotion = preferences.reduce_motion || systemReduce;
  const parallaxOff = !preferences.parallax_enabled || effectiveReduceMotion;

  useEffect(() => {
    const html = document.documentElement;

    if (effectiveReduceMotion) html.classList.add('reduce-motion');
    else html.classList.remove('reduce-motion');

    if (preferences.high_contrast) html.classList.add('high-contrast');
    else html.classList.remove('high-contrast');

    if (preferences.color_blind_mode) html.classList.add('color-blind-mode');
    else html.classList.remove('color-blind-mode');

    if (parallaxOff) html.classList.add('parallax-off');
    else html.classList.remove('parallax-off');
  }, [preferences, effectiveReduceMotion, parallaxOff]);

  return { ...preferences, reduce_motion: effectiveReduceMotion };
}

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

/**
 * True when parallax should run (user opted in AND motion not reduced).
 * Driven by the `.parallax-off` class set by `useAccessibility`.
 */
export function useParallaxEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !document.documentElement.classList.contains('parallax-off');
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const recompute = () => {
      setEnabled(!document.documentElement.classList.contains('parallax-off'));
    };
    recompute();
    const observer = new MutationObserver(recompute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return enabled;
}

/**
 * True when cinematic background videos may autoplay
 * (user opted in AND motion not reduced).
 */
export function useCinematicVideoEnabled(): boolean {
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setEnabled(true);
      return;
    }
    supabase
      .from('user_preferences')
      .select('cinematic_video_enabled')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) {
          setEnabled((data as any).cinematic_video_enabled !== false);
        }
      });

    const channel = supabase
      .channel('cinematic-video-pref')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_preferences', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setEnabled((payload.new as any).cinematic_video_enabled !== false);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return enabled && !reduced;
}
