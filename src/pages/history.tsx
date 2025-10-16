// History.tsx - Fixed to match your database structure
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Code2,
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  Eye
} from "lucide-react";
import gsap from "gsap";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../Firebase/config";

interface TestResult {
  testId: string;
  testName: string;
  overallScore: number;
  totalQuestions: number;
  attemptedQuestions: number;
  questionResults: any;
  language: string;
  submittedAt: string;
  autoSubmit: boolean;
  timeSpent: number;
  difficulty?: string;
}

interface HistoryProps {
  onNavigate: (path: string) => void;
}

const History = ({ onNavigate }: HistoryProps) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [userName, setUserName] = useState("Nanba");
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserName();
    fetchTestResults();
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (statsRef.current && results.length > 0) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "elastic.out(1, 0.5)" }
      );
    }

    if (cardsRef.current && cardsRef.current.children.length > 0) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [results]);

  const fetchUserName = async () => {
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const userDoc = await getDoc(doc(db, "users", user.email));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || "Nanba");
        }
      }
    } catch (error) {
      // console.error("Error fetching user name:", error);
    }
  };

  const fetchTestResults = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        navigate("/");
        return;
      }

      // console.log("📊 Fetching results for:", user.email);

      const resultsRef = collection(db, "results", user.email, "tests");
      const resultsSnapshot = await getDocs(resultsRef);

      // console.log("📊 Found", resultsSnapshot.docs.length, "test results");

      const resultsData = await Promise.all(
        resultsSnapshot.docs.map(async (resultDoc) => {
          const data = resultDoc.data();
          // console.log("📄 Test data:", data);

          // Fetch test details for difficulty
          let testData: any = {};
          try {
            const testDoc = await getDoc(doc(db, "tests", resultDoc.id));
            if (testDoc.exists()) {
              testData = testDoc.data();
            }
          } catch (error) {
            // console.log("Could not fetch test details:", error);
          }

          return {
            testId: resultDoc.id,
            testName: data.testName || "Test",
            overallScore: data.overallScore || 0,
            totalQuestions: data.totalQuestions || 0,
            attemptedQuestions: data.attemptedQuestions || 0,
            questionResults: data.questionResults || {},
            language: data.language || "python",
            submittedAt: data.submittedAt || new Date().toISOString(),
            autoSubmit: data.autoSubmit || false,
            timeSpent: data.timeSpent || 0,
            difficulty: testData.difficulty || "General"
          } as TestResult;
        })
      );

      // Sort by submission date (most recent first)
      resultsData.sort((a, b) => {
        const dateA = new Date(a.submittedAt);
        const dateB = new Date(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      });

      // console.log("✅ Processed results:", resultsData);
      setResults(resultsData);
      setLoading(false);
    } catch (error) {
      // console.error("❌ Error fetching test results:", error);
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500";
      case "Medium": return "text-yellow-500";
      case "Hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Mass-u! Vera Level! 🔥";
    if (score >= 75) return "Semma Performance! 💪";
    if (score >= 60) return "Nalla pannita! 👍";
    if (score >= 50) return "Decent-ah irukku! 😊";
    return "Next time mass-ah pannu! 💯";
  };

  const isPassed = (score: number) => score >= 50;

  const calculateStats = () => {
    if (results.length === 0) return { avgScore: 0, passRate: 0, totalTests: 0 };

    const totalTests = results.length;
    const passedTests = results.filter(r => isPassed(r.overallScore)).length;
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.overallScore, 0) / totalTests);
    const passRate = Math.round((passedTests / totalTests) * 100);

    return { avgScore, passRate, totalTests };
  };

  const getTotalTestCases = (questionResults: any) => {
    let total = 0;
    let passed = 0;
    Object.values(questionResults).forEach((result: any) => {
      if (result.totalTests) total += result.totalTests;
      if (result.passedTests) passed += result.passedTests;
    });
    return { total, passed };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading history-ah... Wait pannu! 🚀</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header ref={headerRef} className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Test History</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold">
            Un Journey, {userName}! 🎯
          </h2>
          <p className="text-muted-foreground text-lg">
            Ippovare nee panna ellam test results-um ivanga! 💪
          </p>
        </div>

        {/* Overall Stats */}
        {results.length > 0 && (
          <Card className="p-6 bg-card/50 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Overall Performance 📊</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" ref={statsRef}>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">{stats.totalTests}</div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-green-500 mb-1">{stats.avgScore}%</div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-blue-500 mb-1">{stats.passRate}%</div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-purple-500 mb-1">
                  {results.filter(r => isPassed(r.overallScore)).length}
                </div>
                <p className="text-sm text-muted-foreground">Tests Passed</p>
              </div>
            </div>
          </Card>
        )}

        {/* Test Results */}
        <div>
          <h3 className="text-2xl font-bold mb-6">
            All Test Results - Un Mass Performance! 🔥
          </h3>

          {results.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Innum onnum illa da! 😅</h3>
              <p className="text-muted-foreground mb-6">
                Test-eh attend pannala pola! Poi test ezhudhitu vaa!
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Card>
          ) : (
            <div ref={cardsRef} className="space-y-4">
              {results.map((result) => {
                const testCases = getTotalTestCases(result.questionResults);
                const passed = isPassed(result.overallScore);

                return (
                  <Card
                    key={result.testId}
                    className="p-6 border border-border hover:border-primary transition-all cursor-pointer"
                    onClick={() => setSelectedTest(selectedTest?.testId === result.testId ? null : result)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{result.testName}</h3>
                          <span className={`text-sm font-medium ${getDifficultyColor(result.difficulty)}`}>
                            {result.difficulty}
                          </span>
                          {passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          {result.autoSubmit && (
                            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">
                              Auto-submitted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getPerformanceMessage(result.overallScore)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
                          {result.overallScore}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {passed ? "Passed ✅" : "Failed ❌"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">
                          {result.attemptedQuestions}/{result.totalQuestions} questions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          {testCases.passed}/{testCases.total} test cases
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-muted-foreground">
                          {formatTime(result.timeSpent)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          {formatDate(result.submittedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedTest?.testId === result.testId && (
                      <div className="mt-6 pt-6 border-t border-border space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">Test Details (Full Info!) 📝</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4 bg-background">
                            <div className="text-sm text-muted-foreground mb-1">Questions</div>
                            <div className="text-2xl font-bold text-primary">
                              {result.attemptedQuestions} / {result.totalQuestions}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Questions attempted
                            </p>
                          </Card>

                          <Card className="p-4 bg-background">
                            <div className="text-sm text-muted-foreground mb-1">Test Cases</div>
                            <div className="text-2xl font-bold text-green-500">
                              {testCases.passed} / {testCases.total}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Test cases passed
                            </p>
                          </Card>

                          <Card className="p-4 bg-background">
                            <div className="text-sm text-muted-foreground mb-1">Language</div>
                            <div className="text-2xl font-bold text-blue-500">
                              {result.language.toUpperCase()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Programming language
                            </p>
                          </Card>
                        </div>

                        {/* Individual Question Results */}
                        <div className="space-y-3">
                          <h5 className="font-semibold text-sm">Question-wise Results:</h5>
                          {Object.entries(result.questionResults).map(([questionId, qResult]: [string, any]) => (
                            <Card key={questionId} className="p-4 bg-background">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Question {questionId}</span>
                                <div className="flex items-center gap-2">
                                  {qResult.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`font-bold ${qResult.passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {qResult.score}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                Test Cases: {qResult.passedTests}/{qResult.totalTests}
                              </div>
                              {qResult.code && (
                                <details className="mt-2">
                                  <summary
                                    className="cursor-pointer text-sm text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()} // ✅ Prevent click from being blocked
                                  >
                                    View Code
                                  </summary>
                                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto font-mono">
                                    {qResult.code}
                                  </pre>
                                </details>
                              )}

                            </Card>
                          ))}
                        </div>

                        <div className="pt-4">
                          <p className="text-sm text-muted-foreground italic">
                            💡 {passed
                              ? "Romba nalla pannita! Keep it up! 🚀"
                              : "Next time konjam improve pannalam! All the best! 💪"}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      {selectedTest?.testId === result.testId ? "Hide Details" : "View Full Details"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;