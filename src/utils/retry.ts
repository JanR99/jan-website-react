const FIRST_PAUSE = 3_000;
const LONGEST_PAUSE = 60_000;

/**
 * How long to wait before trying something again that keeps failing: 3 seconds after the first
 * failure, then twice as long each time, a minute at most.
 */
export const retryPause = (failedTries: number) => Math.min(FIRST_PAUSE * 2 ** (failedTries - 1), LONGEST_PAUSE);
