import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from '../firebaseClient';
import type { SectionKey } from '../context/ProgressContext';

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

function sanitizeParams(params?: AnalyticsParams): Record<string, string | number | boolean> | undefined {
  if (!params) {
    return undefined;
  }

  const safeParams = Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return Object.keys(safeParams).length > 0 ? safeParams : undefined;
}

async function logAnalyticsEvent(name: string, params?: AnalyticsParams): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) {
      return;
    }

    const sanitized = sanitizeParams(params);
    if (sanitized) {
      logEvent(analytics, name, sanitized);
      return;
    }

    logEvent(analytics, name);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info(`Analytics event '${name}' was skipped.`, error);
    }
  }
}

export function trackSignIn(): Promise<void> {
  return logAnalyticsEvent('sign_in', { method: 'google' });
}

export function trackGuestModeUsed(): Promise<void> {
  return logAnalyticsEvent('guest_mode_used', { source: 'app_utility_bar' });
}

export function trackSectionCompleted(section: SectionKey, progressPercent: number): Promise<void> {
  return logAnalyticsEvent('section_completed', {
    section_name: section,
    progress_percent: progressPercent,
  });
}

export function trackQuizSubmitted(score: number, totalQuestions: number): Promise<void> {
  return logAnalyticsEvent('quiz_submitted', {
    score,
    total_questions: totalQuestions,
  });
}
