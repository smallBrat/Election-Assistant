import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../firebaseClient', () => {
  return {
    getFirebaseAnalytics: vi.fn(),
  };
});

vi.mock('firebase/analytics', () => {
  return {
    logEvent: vi.fn(),
  };
});

import { getFirebaseAnalytics } from '../../firebaseClient';
import { logEvent } from 'firebase/analytics';
import {
  trackGuestModeUsed,
  trackQuizSubmitted,
  trackSectionCompleted,
  trackSignIn,
} from '../../services/analytics';

describe('analytics service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips analytics when the client is unavailable', async () => {
    vi.mocked(getFirebaseAnalytics).mockResolvedValue(null);

    await trackSignIn();

    expect(logEvent).not.toHaveBeenCalled();
  });

  it('tracks sign-in with sanitized params', async () => {
    vi.mocked(getFirebaseAnalytics).mockResolvedValue({} as never);

    await trackSignIn();

    expect(logEvent).toHaveBeenCalledWith({}, 'sign_in', { method: 'google' });
  });

  it('tracks section completion with progress metadata', async () => {
    vi.mocked(getFirebaseAnalytics).mockResolvedValue({} as never);

    await trackSectionCompleted('timeline', 50);

    expect(logEvent).toHaveBeenCalledWith({}, 'section_completed', {
      section_name: 'timeline',
      progress_percent: 50,
    });
  });

  it('tracks quiz submissions and guest mode usage', async () => {
    vi.mocked(getFirebaseAnalytics).mockResolvedValue({} as never);

    await trackGuestModeUsed();
    await trackQuizSubmitted(8, 10);

    expect(logEvent).toHaveBeenCalledWith({}, 'guest_mode_used', { source: 'app_utility_bar' });
    expect(logEvent).toHaveBeenCalledWith({}, 'quiz_submitted', {
      score: 8,
      total_questions: 10,
    });
  });
});
