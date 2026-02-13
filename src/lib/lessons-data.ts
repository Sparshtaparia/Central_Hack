/**
 * Central Hack - Lessons Data
 * "Basics of Money" Course with 4 Modules
 * 
 * This file contains the course structure for the gamified financial education platform.
 * Each module has lessons with YouTube video IDs.
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  xpReward: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isLocked: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

// XP Rewards
export const VIDEO_XP = 10;
export const QUIZ_XP = 15;

// YouTube Video IDs from the playlist
const VIDEO_IDS = {
  whatIsMoney: "VxmTTvGezro",
  whySavingMatters: "QQgOJoZduRc",
  savingsGoals: "v-mlEQ7KW5Q",
  needsVsWants: "J0GVg3-2rUY",
  compoundInterest: "d-mKp1qZjek",
  inflation: "3I81-P_lwvw",
};

// "Basics of Money" Course
export const BASICS_OF_MONEY_COURSE: Course = {
  id: "basics-of-money",
  title: "Basics of Money",
  description: "Learn the fundamentals of money management, saving, and financial literacy",
  icon: "💰",
  color: "#58CC02",
  modules: [
    {
      id: "module-1",
      title: "Understanding Money",
      description: "Learn what money is and why it matters",
      isLocked: false, // Unlocked by default
      lessons: [
        {
          id: "lesson-1-1",
          title: "What is Money?",
          description: "Understanding the concept of money and its importance in our daily lives",
          videoId: VIDEO_IDS.whatIsMoney,
          duration: "5:30",
          xpReward: VIDEO_XP,
        },
      ],
    },
    {
      id: "module-2",
      title: "Savings & Goals",
      description: "Learn why saving matters and how to set savings goals",
      isLocked: false, // Unlocked by default
      lessons: [
        {
          id: "lesson-2-1",
          title: "Why Saving Matters",
          description: "Discover the importance of saving money for your future",
          videoId: VIDEO_IDS.whySavingMatters,
          duration: "6:15",
          xpReward: VIDEO_XP,
        },
        {
          id: "lesson-2-2",
          title: "Savings Goals for Kids",
          description: "Learn how to set and achieve savings goals",
          videoId: VIDEO_IDS.savingsGoals,
          duration: "4:45",
          xpReward: VIDEO_XP,
        },
      ],
    },
    {
      id: "module-3",
      title: "Needs vs Wants",
      description: "Understand the difference between needs and wants",
      isLocked: true, // Unlocks after completing Module 2
      lessons: [
        {
          id: "lesson-3-1",
          title: "Needs vs Wants",
          description: "Learn to distinguish between things you need and things you want",
          videoId: VIDEO_IDS.needsVsWants,
          duration: "7:00",
          xpReward: VIDEO_XP,
        },
      ],
    },
    {
      id: "module-4",
      title: "Advanced Concepts",
      description: "Learn about compound interest and inflation",
      isLocked: true, // Unlocks after completing Module 3
      lessons: [
        {
          id: "lesson-4-1",
          title: "What is Compound Interest?",
          description: "Understand how your money can grow over time",
          videoId: VIDEO_IDS.compoundInterest,
          duration: "8:30",
          xpReward: VIDEO_XP,
        },
        {
          id: "lesson-4-2",
          title: "What is Inflation?",
          description: "Learn about inflation and how it affects your money",
          videoId: VIDEO_IDS.inflation,
          duration: "6:45",
          xpReward: VIDEO_XP,
        },
      ],
    },
  ],
};

// Export all courses (currently just Basics of Money)
export const COURSES: Course[] = [BASICS_OF_MONEY_COURSE];

// Helper function to get course by ID
export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((course) => course.id === courseId);
}

// Helper function to get module by ID
export function getModuleById(courseId: string, moduleId: string): Module | undefined {
  const course = getCourseById(courseId);
  return course?.modules.find((module) => module.id === moduleId);
}

// Helper function to get lesson by ID
export function getLessonById(courseId: string, moduleId: string, lessonId: string): Lesson | undefined {
  const module = getModuleById(courseId, moduleId);
  return module?.lessons.find((lesson) => lesson.id === lessonId);
}

// Helper function to get total XP for a course
export function getTotalCourseXP(course: Course): number {
  return course.modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      return moduleTotal + lesson.xpReward;
    }, 0);
  }, 0);
}

// Helper function to check if a module should be unlocked
export function shouldModuleUnlock(
  moduleIndex: number,
  completedLessons: string[]
): boolean {
  // First two modules are always unlocked
  if (moduleIndex <= 1) {
    return true;
  }
  
  // For modules 3 and above, check if previous module is completed
  // This is a simplified check - in a real app, you'd check the actual completion status
  return true;
}

// Default quiz questions (can be customized per lesson)
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is money used for?",
    options: [
      "Only for buying food",
      "A medium of exchange for goods and services",
      "Only for rich people",
      "Nothing important"
    ],
    correctAnswer: 1,
  },
  {
    id: "q2",
    question: "Why is saving money important?",
    options: [
      "It's not important",
      "To spend it all immediately",
      "For emergencies and future goals",
      "To impress others"
    ],
    correctAnswer: 2,
  },
  {
    id: "q3",
    question: "What is the difference between a need and a want?",
    options: [
      "There is no difference",
      "Needs are essential, wants are desires",
      "Wants are more important",
      "Needs are for adults only"
    ],
    correctAnswer: 1,
  },
];
