# Central Hack - Implementation Plan

## Priority 1: Content Module and Videos ✅
- [x] Create `src/lib/lessons-data.ts` with "Basics of Money" course structure
  - Module 1: Understanding Money (Unlocked) - "What is Money?"
  - Module 2: Savings & Goals (Unlocked) - "Why Saving Matters" + "Savings Goals"
  - Module 3: Needs vs Wants (Locked) - Unlocks after completing previous modules
  - Module 4: Advanced Concepts (Locked) - Compound Interest, Inflation
  - Used the specified YouTube video IDs from the task

- [ ] OPTIONAL: Update Academy page to use lessons-data.ts instead of database
- [ ] OPTIONAL: Update database video URLs to match lessons-data.ts

## Priority 2: Quiz and XP System ✅
- [x] Create `src/components/LessonXpTracker.tsx` component
  - Track video completion (10 XP)
  - Track quiz completion (15 XP only if 100% correct)
  - Progress persistence in Supabase

- [ ] OPTIONAL: Integrate LessonXpTracker into LessonPage.tsx
  - Replace existing quiz with LessonXpTracker
  - Use the new XP system (10 for video, 15 for 100% quiz)

## Notes
- The existing Academy page already works with database courses
- The existing LessonPage already has quiz and XP functionality
- The new files (lessons-data.ts, LessonXpTracker.tsx) provide enhanced features
- To use new features, integrate LessonXpTracker into LessonPage.tsx
- The lessons-data.ts can be used to populate/update the database with correct videos
