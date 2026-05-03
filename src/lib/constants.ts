export const STRINGS = {
  META: {
    TITLE: "SQLearn",
    DESCRIPTION: "A gamified SQL e-learning platform",
  },
  BRAND: {
    NAME: "SQLearn",
  },
  HOME: {
    TAGLINE_LEAD:
      "Master SQL through hands-on exercises and real-time feedback. A structured path from your first",
    TAGLINE_SNIPPET: "SELECT *",
    TAGLINE_TAIL: "to confident querying.",
    CTA_PRIMARY: "Get started",
    CTA_SECONDARY: "Log in",
    FOOTER_NOTE:
      "Built for curious minds learning SQL — no prior experience required",
  },
  LOGIN: {
    HEADING: "Welcome back",
    SUBHEADING: "Sign in to pick up where you left off.",
    CAPTION: "Tables · Joins · Aggregations",
    FOOTER_PROMPT: "Don't have an account?",
    FOOTER_LINK: "Register",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "you@example.com",
    PASSWORD_LABEL: "Password",
    PASSWORD_PLACEHOLDER: "••••••••",
    FORGOT_LINK: "Forgot password?",
    SUBMIT: "Sign in",
    SUBMIT_PENDING: "Signing in…",
    ERRORS: {
      EMAIL_REQUIRED: "Enter your email.",
      PASSWORD_REQUIRED: "Enter your password.",
      FALLBACK: "We couldn't sign you in. Please try again.",
    },
  },
  REGISTER: {
    HEADING: "Create your account",
    SUBHEADING: "Start your SQL journey in minutes.",
    CAPTION: "Schemas · Relations · Results",
    FOOTER_PROMPT: "Already have an account?",
    FOOTER_LINK: "Log in",
    FIRST_NAME_LABEL: "First name",
    FIRST_NAME_PLACEHOLDER: "John",
    LAST_NAME_LABEL: "Last name",
    LAST_NAME_PLACEHOLDER: "Doe",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "you@example.com",
    PASSWORD_LABEL: "Password",
    PASSWORD_PLACEHOLDER: "At least 8 characters",
    SUBMIT: "Create account",
    SUBMIT_PENDING: "Creating account…",
    ERRORS: {
      FIRST_NAME_REQUIRED: "Enter your first name.",
      LAST_NAME_REQUIRED: "Enter your last name.",
      EMAIL_REQUIRED: "Enter your email.",
      PASSWORD_REQUIRED: "Choose a password.",
      FALLBACK:
        "We couldn't create your account. Please check the form and try again.",
    },
  },
  FORGOT_PASSWORD: {
    HEADING: "Forgot your password?",
    SUBHEADING:
      "Enter the email you signed up with and we'll send you a reset link.",
    CAPTION: "Recover · Reset · Resume",
    SUCCESS:
      "If an account exists for that email, a reset link is on its way. Check your inbox.",
    SUBMIT: "Send reset link",
    SUBMIT_PENDING: "Sending…",
    BACK_PROMPT: "Remembered it?",
    BACK_LINK: "Back to log in",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "you@example.com",
    ERRORS: {
      EMAIL_REQUIRED: "Enter your email.",
      FALLBACK: "Something went wrong. Please try again.",
    },
  },
  RESET_PASSWORD: {
    HEADING: "Choose a new password",
    SUBHEADING: "Pick something you'll remember.",
    CAPTION: "Secure · Save · Sign in",
    SUCCESS: "Your password is updated. You can sign in with it now.",
    SUBMIT: "Update password",
    SUBMIT_PENDING: "Updating…",
    BACK_TO_LOGIN: "Go to log in",
    NEW_PASSWORD_LABEL: "New password",
    NEW_PASSWORD_PLACEHOLDER: "At least 8 characters",
    CONFIRM_PASSWORD_LABEL: "Confirm password",
    CONFIRM_PASSWORD_PLACEHOLDER: "Re-enter your new password",
    REQUEST_NEW_LINK: "Request a new link.",
    ERRORS: {
      PASSWORD_REQUIRED: "Enter a new password.",
      PASSWORD_MISMATCH: "Passwords don't match.",
      FALLBACK: "We couldn't update your password. Please try again.",
    },
  },
  PASSWORD: {
    HINT: "At least 8 characters with an uppercase letter, a lowercase letter, a number, and a symbol.",
    MISSING_PREFIX: "Password must include ",
    MISSING_SUFFIX: ".",
    MISSING_LENGTH: (n: number) => `at least ${n} characters`,
    MISSING_UPPERCASE: "an uppercase letter",
    MISSING_LOWERCASE: "a lowercase letter",
    MISSING_NUMBER: "a number",
    MISSING_SYMBOL: "a symbol",
  },
  DASHBOARD: {
    EYEBROW: "Your SQLearn",
    HEADING: "Dashboard",
    SUBHEADING: "Your learning progress at a glance.",
    GREETING: (name: string) => `Welcome back, ${name}.`,
    GREETING_GUEST: "Welcome back.",
    SUB: "Pick up where you left off, or aim for your next level.",
    LEVEL_CARD: {
      EYEBROW: "Level",
      XP_LABEL: "XP",
      TO_NEXT: (n: number) => `${n.toLocaleString()} XP to next level`,
      MAX_LEVEL: "You've reached the top level. Masterful.",
    },
    STREAK_CARD: {
      EYEBROW: "Streak",
      DAYS: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
      BEST: (n: number) => `Best: ${n} ${n === 1 ? "day" : "days"}`,
      TAGLINE: "Show up tomorrow to keep the flame.",
      NONE_TAGLINE: "Complete an exercise to start a streak.",
    },
    BADGES_CARD: {
      EYEBROW: "Recent badges",
      EMPTY: "Your first badge is a query away.",
      VIEW_ALL: "View all badges",
    },
    PROGRESS_CARD: {
      EYEBROW: "Overall progress",
      CHAPTERS: (done: number, total: number) =>
        `${done} / ${total} chapters`,
      LESSONS: (done: number, total: number) =>
        `${done} / ${total} lessons`,
      EXERCISES: (done: number, total: number) =>
        `${done} / ${total} exercises`,
      COLLECTION: (done: number, total: number) =>
        `${done} / ${total} badges`,
    },
    CONTINUE: {
      EYEBROW: "Continue learning",
      FALLBACK_EYEBROW: "Start learning",
      CTA: "Open curriculum",
      RESUME_CTA: "Resume",
      BEGIN_CTA: "Begin",
      COMPLETE_STATE: "You've cleared every published exercise.",
      COMPLETE_CTA: "Review curriculum",
    },
    LOADING: "Loading your dashboard…",
    LOAD_ERROR: "We couldn't load your dashboard. Refresh to try again.",
    CTA_LEADERBOARD: "See the leaderboard",
    CTA_PROFILE: "View your profile",
  },
  LEADERBOARD: {
    EYEBROW: "Standings",
    HEADING: "Leaderboard",
    SUBHEADING:
      "Top learners by XP. Keep solving exercises to climb the ranks.",
    HEADERS: {
      RANK: "Rank",
      LEARNER: "Learner",
      LEVEL: "Level",
      XP: "XP",
      BADGES: "Badges",
    },
    YOU: "You",
    PAGER: {
      PREV: "Previous",
      NEXT: "Next",
      PAGE: (current: number, total: number) => `Page ${current} of ${total}`,
    },
    EMPTY: "The leaderboard is empty. Be the first to earn XP.",
    LOAD_ERROR:
      "We couldn't load the leaderboard. Refresh to try again.",
    LOADING: "Loading rankings…",
    CURRENT_USER_ROW: "Your current standing",
  },
  PROFILE: {
    LOADING: "Loading profile…",
    LOAD_ERROR: "We couldn't load this profile. Refresh to try again.",
    LEVEL: "Level",
    STATS: {
      XP: "Total XP",
      STREAK: "Current streak",
      LONGEST_STREAK: "Longest streak",
      EXERCISES: "Exercises solved",
      BADGES: "Badges earned",
    },
    DAYS: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
    BADGES_HEADING: "Badge collection",
    BADGES_EMPTY:
      "No badges yet. Every badge tells a story — complete exercises to start collecting.",
    BADGES_COUNT: (done: number, total: number) =>
      `${done} of ${total} earned`,
    CATEGORIES: {
      milestone: "Milestones",
      skill: "Skill",
      streak: "Streak",
      fun: "Fun",
    },
    NOT_EARNED: "Not earned yet",
  },
  XP: {
    LABEL: "XP",
    FIRST_ATTEMPT: "First try",
    STREAK: "Streak",
    LEVEL_UP_EYEBROW: "Level up",
    LEVEL_UP_HEADING: (level: number) => `You reached level ${level}`,
    LEVEL_UP_BODY: (title: string) => `You're now a ${title}.`,
  },
  LESSON_COMPLETE: {
    LESSON_EYEBROW: "Lesson complete",
    QUIZ_EYEBROW: "Chapter mastered",
    QUIZ_HEADING: "Chapter mastered",
    QUIZ_BODY: (title: string) =>
      `You've conquered every exercise in ${title}. The next chapter is open.`,
    XP_EARNED: "XP earned",
    BADGES_EARNED_LABEL: "New badges",
  },
  LEARN: {
    EYEBROW: "Curriculum",
    HEADING: "Your SQL journey",
    SUBHEADING:
      "Work through chapters at your own pace. Each lesson ends with hands-on exercises in the sandbox.",
    EMPTY_HEADING: "No chapters are published yet.",
    EMPTY_BODY:
      "Ask an instructor to publish the first chapter, or check back shortly.",
    LOADING: "Gathering your chapters…",
    LOAD_ERROR: "We couldn't load your chapters. Refresh to try again.",
    SUMMARY_EXERCISES: (done: number, total: number) =>
      `${done} of ${total} exercises mastered`,
    CHAPTER_LABEL: "Chapter",
    EXERCISES_LABEL: "exercises",
    NOT_STARTED: "Start chapter",
    IN_PROGRESS: "Resume",
    COMPLETE: "Review",
    EMPTY_CHAPTER: "This chapter has no lessons yet.",
    STATUS: {
      not_started: "Not started",
      attempted: "In progress",
      completed: "Completed",
    },
  },
  LESSON: {
    BACK: "Back to curriculum",
    EXERCISES_HEADING: "Exercises",
    QUIZZES_HEADING: "Chapter quiz",
    NO_EXERCISES: "This lesson has no exercises yet.",
    LESSON_PROGRESS: (done: number, total: number) =>
      `${done} / ${total} exercises`,
    PREV_LESSON: "Previous Lesson",
    NEXT_LESSON: "Next Lesson",
    LOADING: "Loading lesson…",
    LOAD_ERROR: "We couldn't load this lesson. Refresh to try again.",
    THEORY_EMPTY: "No theory content has been written for this lesson yet.",
    DIFFICULTY: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
    CHAPTER_QUIZ_BADGE: "Quiz",
    NOT_STARTED: "Start",
    IN_PROGRESS: "Continue",
    COMPLETE: "Done",
  },

  EXERCISE: {
    TABS: {
      THEORY: "Theory",
      EXERCISE_SHORT: "Ex",
    },
    OVERVIEW_HEADING: "Practice",
    OVERVIEW_SUBHEADING:
      "Pick an exercise to start writing SQL. Your progress saves automatically.",
    LOAD_ERROR: "We couldn't load this exercise. Refresh to try again.",
    BRIEF: {
      EXERCISE_EYEBROW: "Exercise",
      QUIZ_EYEBROW: "Chapter quiz",
      ALREADY_SOLVED: "Already solved",
      EMPTY_INSTRUCTIONS:
        "This exercise doesn't have written instructions yet.",
    },
    EDITOR: {
      TAB_LABEL: "query.sql",
      RUN: "Run query",
      RUN_PENDING: "Running…",
      RUN_SHORTCUT_NOTE: "to run",
      RESET: "Reset",
      PLACEHOLDER:
        "-- Start typing your SQL here. Press ⌘+Enter to run.",
      EMPTY_SQL: "Write a query first — the editor is empty.",
      SUBMIT_ERROR:
        "We couldn't submit your query. Check your connection and try again.",
    },
    RESULTS: {
      IDLE_BODY:
        "Run your query to see results, row-by-row, with a side-by-side diff when something is off.",
      IDLE_HINT: "Ready when you are",
      RUNNING: "Executing your query…",
      YOUR_RESULT: "Your result",
      EXPECTED_RESULT: "Expected result",
      EMPTY: "The query returned no columns.",
      NO_ROWS: "No rows returned.",
      TABLE_META: (rows: number, cols: number) =>
        `${rows} ${rows === 1 ? "row" : "rows"} · ${cols} ${cols === 1 ? "column" : "columns"}`,
      TRUNCATED: (shown: number, total: number) =>
        `Showing the first ${shown} of ${total} rows.`,
    },
    BANNER: {
      CORRECT_TITLE: "Correct",
      CORRECT_BODY: "Your query returned the expected result.",
      INCORRECT_GENERIC: "Close, but not quite",
      INCORRECT_COLUMNS: "Columns don't match",
      INCORRECT_ROW_COUNT: "Row count is off",
      INCORRECT_ROWS: "Rows don't match",
      SYNTAX_TITLE: "Syntax error",
      EXECUTION_TITLE: "Query couldn't run",
      TIMEOUT_TITLE: "Query took too long",
      FORBIDDEN_TITLE: "Query not allowed here",
    },
    HINTS: {
      HEADING: "Hints",
      COUNTER: (revealed: number, total: number) => `${revealed} / ${total}`,
      EMPTY_BODY:
        "Stuck? Reveal the first hint for a gentle nudge in the right direction.",
      REVEAL_FIRST: "Reveal first hint",
      REVEAL_NEXT: "Reveal next hint",
      ALL_REVEALED: "You've revealed every hint for this exercise.",
    },
    XP: {
      LABEL: "XP",
      FIRST_ATTEMPT: "First try",
    },
    COMPLETE: {
      EYEBROW: "Lesson complete",
      HEADING: "You finished every exercise",
      BODY: (title: string, count: number) =>
        `You completed all ${count} ${count === 1 ? "exercise" : "exercises"} in ${title}. Take a breath, then keep going.`,
      NEXT_LESSON: "Next lesson",
      BACK_TO_CURRICULUM: "Back to curriculum",
      STAY_HERE: "Stay on this lesson",
    },
  },

  FORM: {
    SHOW_PASSWORD: "Show password",
    HIDE_PASSWORD: "Hide password",
  },

  MENTOR: {
    EYEBROW: "AI Mentor",
    HEADING: "Sit with the problem.",
    SUBHEADING:
      "Ask for a nudge, a deeper hint, or an explanation of an error. Your conversation stays here while you work on this exercise.",
    OPEN_FAB: "Open AI Mentor",
    OPEN_FAB_BADGE: "Stuck?",
    CLOSE: "Close mentor",
    RESET: "Clear conversation",
    EXPLAIN_FROM_BANNER: "Explain with AI",
    HINT_BUTTON: "Ask AI for a hint",
    HINT_BUTTON_FIRST: "Ask AI for help",
    HINT_BUTTON_NEXT: "Ask for a deeper hint",
    HINT_COUNTER: (used: number, total: number) =>
      `Hint ${used} of ${total}`,
    HINT_REMAINING: (left: number) =>
      `${left} ${left === 1 ? "AI hint" : "AI hints"} left`,
    HINT_CAP_REACHED: "No more AI hints available for this exercise.",
    HINT_CAP_HELPER:
      "Try writing a query and use Explain Error if it doesn't work.",
    NL_INPUT_LABEL: "Describe the query in plain English",
    NL_INPUT_PLACEHOLDER:
      "e.g. Top three customers by total order value last month",
    NL_SEND: "Generate SQL",
    NL_SEND_PENDING: "Thinking…",
    EXPLAIN_PENDING: "Reading the error…",
    HINT_PENDING: "Composing a hint…",
    INSERT_INTO_EDITOR: "Insert into editor",
    INSERTED: "Pasted into editor",
    EMPTY_TITLE: "How can I help?",
    EMPTY_BODY:
      "Ask for a hint when you feel stuck, or click “Explain with AI” when a query fails.",
    EMPTY_HINT_TIP: "Tip: AI hints get more specific each time you ask.",
    OFFLINE_TITLE: "Mentor is offline",
    SENDING: "Sending…",
    USER_LABEL: "You",
    MENTOR_LABEL: "Mentor",
    YOU_ASKED_HINT: (level: number) =>
      level === 1
        ? "I'd like a gentle hint."
        : `I'd like hint ${level} — go a little deeper.`,
    YOU_ASKED_EXPLAIN: "Can you walk me through this error?",
    OUTCOME_RATE_LIMITED: "Rate limit reached",
    OUTCOME_HINT_CAP: "Hint limit reached",
    OUTCOME_GEMINI_ERROR: "Mentor unavailable",
    OUTCOME_TIMEOUT: "Mentor timed out",
    OUTCOME_INVALID: "Couldn't process that input",
  },
} as const;
