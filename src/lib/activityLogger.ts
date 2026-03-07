/**
 * Activity Logger Utility
 * Logs user activities to the backend for tracking in log files
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Log an activity to the backend
 * @param section - The section name (mcq, testpad, vault)
 * @param action - The action performed
 * @param details - Additional details about the action
 */
export const logActivity = async (
  section: string,
  action: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[ActivityLogger] No token found, skipping log');
      return;
    }

    const response = await fetch(`${API_BASE}/activity/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ section, action, details }),
    });

    if (!response.ok) {
      console.warn('[ActivityLogger] Failed to log activity');
    }
  } catch (error) {
    console.error('[ActivityLogger] Error logging activity:', error);
  }
};

// Section-specific logging helpers

export const logMCQActivity = {
  generate: (topic: string, numQuestions: number, difficulty: string) =>
    logActivity('mcq', 'QUIZ_GENERATED', { topic, numQuestions, difficulty }),

  start: (questionCount: number) =>
    logActivity('mcq', 'QUIZ_STARTED', { questionCount }),

  submit: (score: number, correct: number, total: number) =>
    logActivity('mcq', 'QUIZ_COMPLETED', { score, correctAnswers: correct, totalQuestions: total }),

  viewResults: () =>
    logActivity('mcq', 'RESULTS_VIEWED', {}),
};

export const logTestpadActivity = {
  generate: (topic: string) =>
    logActivity('testpad', 'PROBLEM_GENERATED', { topic }),

  runTests: (problemTitle: string, passed: number, total: number) =>
    logActivity('testpad', 'TESTS_RUN', { problemTitle, passedCases: passed, totalCases: total }),
};

export const logVaultActivity = {
  // These are handled by backend routes, but can be called for additional logging
  view: () =>
    logActivity('vault', 'VAULT_VIEWED', {}),
};

// CodeDuel Activity Logging
export const logCodeDuelActivity = {
  createRoom: () =>
    logActivity('codeduel', 'ROOM_CREATED', {}),

  joinRoom: (roomId: string) =>
    logActivity('codeduel', 'ROOM_JOINED', { roomId }),

  generateProblem: (topic: string) =>
    logActivity('codeduel', 'PROBLEM_GENERATED', { topic }),

  startDuel: (roomId: string) =>
    logActivity('codeduel', 'DUEL_STARTED', { roomId }),

  runTests: (passedCases: number, totalCases: number, attempts: number) =>
    logActivity('codeduel', 'TEST_RUN', { passedCases, totalCases, attempts }),

  winDuel: (roomId: string) =>
    logActivity('codeduel', 'DUEL_WON', { roomId }),

  loseDuel: (roomId: string) =>
    logActivity('codeduel', 'DUEL_LOST', { roomId }),
};

// Roadmap Activity Logging
export const logRoadmapActivity = {
  viewRoadmap: (roadmapType: string) =>
    logActivity('roadmap', 'ROADMAP_VIEWED', { roadmapType }),

  generateGuide: (topic: string) =>
    logActivity('roadmap', 'GUIDE_GENERATED', { topic }),

  selectRoadmap: (roadmapName: string) =>
    logActivity('roadmap', 'ROADMAP_SELECTED', { roadmapName }),

  viewLibrary: () =>
    logActivity('roadmap', 'LIBRARY_VIEWED', {}),
};

