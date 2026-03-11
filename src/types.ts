export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Test {
  _id: string;
  name: string;
  code: string;
  createdBy: string;
  isActive: boolean;
  showCorrectAnswer: boolean;
  durationMinutes: number;
  createdAt?: string;
}

export interface Subject {
  _id: string;
  testId: string;
  name: string;
  order: number;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  _id: string;
  subjectId: string;
  text: string;
  imageUrl: string | null;
  options: QuestionOption[];
  correctKey: string;
  order: number;
}

export interface JoinInfo {
  testId: string;
  name: string;
  code: string;
  durationMinutes: number;
  showCorrectAnswer: boolean;
  subjects: { id: string; name: string; order: number }[];
}

export interface JoinResponse {
  sessionId: string;
  testId: string;
  testName: string;
  durationMinutes: number;
  showCorrectAnswer: boolean;
  subjects: Subject[];
  questions: (Omit<Question, 'correctKey'>)[];
}

export interface ResultRow {
  sessionId: string;
  studentName: string;
  studentSurname: string;
  subjectStats: {
    subjectId: string;
    name: string;
    cells: { status: 'correct' | 'wrong' | 'unanswered' }[];
    correct: number;
    wrong: number;
    unanswered: number;
    total: number;
    percent: number;
  }[];
  totalCorrect: number;
  totalQuestions: number;
  totalPercent: number;
}

export interface ResultsResponse {
  test: { name: string; code: string; isActive: boolean };
  subjects: Subject[];
  rows: ResultRow[];
}
