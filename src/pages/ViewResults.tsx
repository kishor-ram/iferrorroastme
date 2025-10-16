// ViewResults.tsx - Fixed to match your database structure
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  User,
  FileText,
  Trophy,
  Code2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { db } from "../Firebase/config";
import { collectionGroup, getDocs, query, orderBy } from "firebase/firestore";

interface ViewResultsProps {
  onBack: () => void;
}

const ViewResults = ({ onBack }: ViewResultsProps) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // console.log("🔍 Fetching all student results...");
        
        // Query the collection group for all test results
        const q = collectionGroup(db, "tests");
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // console.log("❌ No results found for any users.");
          setResults([]);
          setLoading(false);
          return;
        }

        // console.log("📊 Found", snapshot.docs.length, "results");

        const data = snapshot.docs
          .filter((doc) => {
            const data = doc.data();
            // Only include documents that have submittedAt (actual test submissions)
            return data.submittedAt && data.testName;
          })
          .map((doc) => {
            const data = doc.data();
            const userEmail = doc.ref.parent.parent?.id || "Unknown";
            
            // console.log("📄 Processing result:", {
            //   userEmail,
            //   testName: data.testName,
            //   overallScore: data.overallScore,
            //   questionResults: data.questionResults
            // });

            return {
              id: doc.id,
              userEmail: userEmail,
              testId: data.testId || doc.id,
              testName: data.testName || "Unknown Test",
              overallScore: data.overallScore || 0,
              totalQuestions: data.totalQuestions || 0,
              attemptedQuestions: data.attemptedQuestions || 0,
              questionResults: data.questionResults || {},
              language: data.language || "python",
              submittedAt: data.submittedAt,
              autoSubmit: data.autoSubmit || false,
              timeSpent: data.timeSpent || 0,
            };
          });

        // Sort by submission date (most recent first)
        data.sort((a, b) => {
          const dateA = typeof a.submittedAt === 'string' ? new Date(a.submittedAt) : a.submittedAt?.toDate?.() || new Date(0);
          const dateB = typeof b.submittedAt === 'string' ? new Date(b.submittedAt) : b.submittedAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        // console.log("✅ Processed results:", data);
        setResults(data);
      } catch (error) {
        // console.error("❌ Error fetching all results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return { label: "Mass! 🔥", className: "bg-green-100 text-green-800" };
    if (score >= 75)
      return { label: "Semma! 💪", className: "bg-blue-100 text-blue-800" };
    if (score >= 60)
      return { label: "Nalladhu 👍", className: "bg-yellow-100 text-yellow-800" };
    if (score >= 50)
      return { label: "Pass 😊", className: "bg-orange-100 text-orange-800" };
    return { label: "Fail 😓", className: "bg-red-100 text-red-800" };
  };

  const isPassed = (score: number) => score >= 50;

  const getTotalTestCases = (questionResults: any) => {
    let total = 0;
    let passed = 0;
    Object.values(questionResults || {}).forEach((result: any) => {
      if (result.totalTests) total += result.totalTests;
      if (result.passedTests) passed += result.passedTests;
    });
    return { total, passed };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-xl font-semibold text-slate-700">
            Loading results da... Wait pannu! 🚀
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Student Results 📊</h1>
          <div className="w-48" />
        </header>

        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Innum yaarum test eluthala da! 😅
            </h3>
            <p className="text-slate-500">
              Student results will appear here once they start submitting tests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate overall statistics
  const validScores = results.filter((r) => typeof r.overallScore === "number");
  const averageScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((acc, r) => acc + (r.overallScore || 0), 0) /
            validScores.length
        )
      : 0;

  const passedCount = validScores.filter((r) => isPassed(r.overallScore)).length;
  const passRate = validScores.length
    ? Math.round((passedCount / validScores.length) * 100)
    : 0;

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Student Results 📊</h1>
        <div className="w-48" />
      </header>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-slate-900">
                  {results.length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Average Score</p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    averageScore
                  )}`}
                >
                  {averageScore}%
                </p>
              </div>
              <Trophy className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pass Rate</p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(passRate)}`}
                >
                  {passRate}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results List */}
      <div className="space-y-4">
        {results.map((result) => {
          const scoreBadge = getScoreBadge(result.overallScore);
          const passed = isPassed(result.overallScore);
          const isExpanded = expandedIds.includes(result.id);
          const testCases = getTotalTestCases(result.questionResults);

          return (
            <Card
              key={`${result.userEmail}-${result.id}`}
              className={`border-l-4 transition-all hover:shadow-lg ${
                passed ? "border-green-500" : "border-red-500"
              }`}
            >
              <CardContent className="p-6">
                {/* Header Section - Clickable */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleExpand(result.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <User className="w-5 h-5 text-slate-500" />
                        <h4 className="font-bold text-lg text-slate-900">
                          {result.userEmail}
                        </h4>
                        <Badge className={scoreBadge.className}>
                          {scoreBadge.label}
                        </Badge>
                        {result.autoSubmit && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Auto-Submit ⏰
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Test: {result.testName}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" /> Submitted:{" "}
                        {formatDate(result.submittedAt)}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <TrendingUp className="w-4 h-4" /> Time Spent:{" "}
                        {formatTime(result.timeSpent)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {passed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <span
                          className={`text-4xl font-bold ${getScoreColor(
                            result.overallScore
                          )}`}
                        >
                          {result.overallScore}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {result.attemptedQuestions} / {result.totalQuestions} questions
                      </p>
                      <p className="text-xs text-slate-500">
                        {testCases.passed} / {testCases.total} test cases
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <div className="flex items-center justify-center pt-2 border-t">
                    <Button variant="ghost" size="sm" className="text-slate-600">
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          View Full Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="w-5 h-5 text-primary" />
                      <h5 className="font-semibold text-lg">Question-wise Breakdown</h5>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-slate-50">
                        <CardContent className="p-4">
                          <div className="text-sm text-slate-600 mb-1">Questions Attempted</div>
                          <div className="text-2xl font-bold text-primary">
                            {result.attemptedQuestions} / {result.totalQuestions}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-50">
                        <CardContent className="p-4">
                          <div className="text-sm text-slate-600 mb-1">Test Cases Passed</div>
                          <div className="text-2xl font-bold text-green-600">
                            {testCases.passed} / {testCases.total}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-50">
                        <CardContent className="p-4">
                          <div className="text-sm text-slate-600 mb-1">Language Used</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {result.language.toUpperCase()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Individual Questions */}
                    {Object.entries(result.questionResults || {}).map(
                      ([questionId, qResult]: [string, any], index) => (
                        <Card
                          key={`${result.userEmail}-${result.id}-q${questionId}`}
                          className={`${
                            qResult.passed
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h6 className="font-semibold text-slate-900">
                                    Question {questionId}
                                  </h6>
                                  <p className="text-xs text-slate-600">
                                    Test Cases: {qResult.passedTests}/{qResult.totalTests}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    qResult.passed
                                      ? "bg-green-600 text-white"
                                      : "bg-red-600 text-white"
                                  }
                                >
                                  {qResult.score}%
                                </Badge>
                                {qResult.passed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            </div>

                            {/* Code Section */}
                            {qResult.code && (
                              <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Code2 className="w-4 h-4 text-slate-600" />
                                  <p className="text-sm font-semibold text-slate-700">
                                    Submitted Code:
                                  </p>
                                </div>
                                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                                  <code>{qResult.code}</code>
                                </pre>
                              </div>
                            )}

                            {/* Performance Indicator */}
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs text-slate-600 italic">
                                {qResult.passed
                                  ? "✅ All test cases passed! Semma! 🔥"
                                  : `❌ ${qResult.totalTests - qResult.passedTests} test case(s) failed. Try pannu da! 💪`}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}

                    {/* Overall Feedback */}
                    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                      <p className="text-sm text-slate-700 font-medium">
                        📝 Overall Performance:
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {passed
                          ? "Romba nalla pannirkanga! Keep up the good work! 🚀"
                          : "Next time konjam improve pannalam. All the best! 💪"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ViewResults;