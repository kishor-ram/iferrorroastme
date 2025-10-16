export interface TestCase {
  input: string;
  output: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  functionName: string;
  testCases: TestCase[];
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  duration: number;
  questions: Question[];
  createdAt: Date | any; // Can be Firestore Timestamp or Date
  endDate?: Date | any; // Can be Firestore Timestamp or Date
  createdBy?: string;
  createdByName?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testName: string;
  userName: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: Date | any;
  answers: {
    questionId: number;
    userCode: string;
    passed: boolean;
    testResults: {
      passed: boolean;
      expected: string;
      actual: string;
    }[];
  }[];
}