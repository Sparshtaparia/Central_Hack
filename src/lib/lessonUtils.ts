/**
 * Lesson unlocking utilities for progressive learning
 */

/**
 * Determines if a lesson is locked based on completion of previous lessons
 * @param lessonOrderIndex - The order index of the current lesson
 * @param userProgress - User's progress data keyed by lesson ID
 * @param allLessonsInModule - All lessons in the current module, sorted by order_index
 * @returns boolean - true if lesson is locked, false if unlocked
 */
export function isLessonLocked(
    lessonOrderIndex: number,
    userProgress: Record<string, any>,
    allLessonsInModule: any[]
  ): boolean {
    // First lesson is always unlocked
    if (lessonOrderIndex === 0) {
      return false;
    }
  
    // Get the previous lesson
    const previousLesson = allLessonsInModule[lessonOrderIndex - 1];
    if (!previousLesson) {
      return false;
    }
  
    // Check if previous lesson is completed
    const previousLessonCompleted = userProgress[previousLesson.id]?.completed || false;
    return !previousLessonCompleted;
  }
  
  /**
   * Calculates the level based on current XP
   * Level formula: floor(xp / 100) + 1
   * @param xp - Current XP
   * @returns number - Current level
   */
  export function calculateLevel(xp: number): number {
    return Math.floor(xp / 100) + 1;
  }
  
  /**
   * Calculates XP needed for next level
   * @param currentLevel - Current level
   * @returns number - Total XP needed for next level
   */
  export function getXpForNextLevel(currentLevel: number): number {
    return currentLevel * 100;
  }
  
  /**
   * Calculates XP progress within current level
   * @param totalXp - Total XP earned
   * @returns number - XP within current level (0-99 for level calculation purposes)
   */
  export function getXpInCurrentLevel(totalXp: number): number {
    const currentLevel = calculateLevel(totalXp);
    return totalXp % (currentLevel * 100);
  }
  
  /**
   * Calculates the percentage progress toward next level
   * @param totalXp - Total XP earned
   * @returns number - Percentage (0-100)
   */
  export function getXpProgressPercentage(totalXp: number): number {
    const currentLevel = calculateLevel(totalXp);
    const xpInLevel = getXpInCurrentLevel(totalXp);
    const xpForLevel = getXpForNextLevel(currentLevel);
    return (xpInLevel / xpForLevel) * 100;
  }
  
  /**
   * Determines if user should get a streak reward
   * @param lastActiveDate - Last active date (YYYY-MM-DD format)
   * @param currentStreak - Current streak count
   * @returns object - { newStreak: number, streakBroken: boolean }
   */
  export function updateStreak(
    lastActiveDate: string | null,
    currentStreak: number
  ): { newStreak: number; streakBroken: boolean } {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  
    if (lastActiveDate === today) {
      // Already active today
      return { newStreak: currentStreak, streakBroken: false };
    } else if (lastActiveDate === yesterday) {
      // Consecutive day
      return { newStreak: currentStreak + 1, streakBroken: false };
    } else {
      // Streak broken, reset to 1
      return { newStreak: 1, streakBroken: true };
    }
  }
  