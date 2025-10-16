import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Question, TestCase, Test } from "../lib/types";
import { db, auth } from "../Firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface CreateTestProps {
  onBack: () => void;
  onSaveTest?: (test: Omit<Test, "id" | "createdAt">) => void;
}

const CreateTest = ({ onBack, onSaveTest }: CreateTestProps) => {
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "",
      description: "",
      functionName: "",
      testCases: [{ input: "", output: "" }],
    },
  ]);

  // Add a new question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        title: "",
        description: "",
        functionName: "",
        testCases: [{ input: "", output: "" }],
      },
    ]);
  };

  // Remove a question
  const handleRemoveQuestion = (questionId: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId));
    } else {
      alert("A test must have at least one question.");
    }
  };

  // Handle question text changes
  const handleQuestionChange = (
    questionId: number,
    field: keyof Omit<Question, "id" | "testCases">,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  // Add a test case
  const handleAddTestCase = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, testCases: [...q.testCases, { input: "", output: "" }] }
          : q
      )
    );
  };

  // Remove a test case
  const handleRemoveTestCase = (questionId: number, testCaseIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          if (q.testCases.length > 1) {
            const newTestCases = q.testCases.filter(
              (_, index) => index !== testCaseIndex
            );
            return { ...q, testCases: newTestCases };
          } else {
            alert("A question must have at least one test case.");
          }
        }
        return q;
      })
    );
  };

  // Handle test case input/output change
  const handleTestCaseChange = (
    questionId: number,
    testCaseIndex: number,
    field: keyof TestCase,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newTestCases = q.testCases.map((tc, index) =>
          index === testCaseIndex ? { ...tc, [field]: value } : tc
        );
        return { ...q, testCases: newTestCases };
      })
    );
  };

  // Save test to Firestore
  const handleSave = async () => {
    if (!testName.trim()) {
      alert("Please provide a name for the test.");
      return;
    }

    if (questions.some((q) => !q.title.trim() || !q.functionName.trim())) {
      alert("Please ensure every question has a title and a function name.");
      return;
    }

    if (
      questions.some((q) =>
        q.testCases.some((tc) => !tc.input.trim() || !tc.output.trim())
      )
    ) {
      alert("Please ensure all test cases have both an input and an output.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in to create a test.");
      return;
    }

    setSaving(true);

    try {
      const testData = {
        name: testName,
        description: `${questions.length} question(s)`,
        duration,
        questions: questions.map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          functionName: q.functionName,
          testCases: q.testCases,
        })),
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
      };

      await addDoc(collection(db, "tests"), testData);

      alert("Test created successfully!");

      if (onSaveTest) {
        onSaveTest({ name: testName, duration, questions });
      }

      onBack();
    } catch (error) {
      // console.error("Error saving test:", error);
      alert("Failed to save test. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-slate-100"
          disabled={saving}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Create New Test</h1>
        <div className="w-48 sm:w-32" />
      </header>

      {/* Test Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
          <CardDescription>
            Provide the general information for this test.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              placeholder="e.g., Advanced Sorting Algorithms"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="60"
              value={duration}
              onChange={(e) =>
                setDuration(parseInt(e.target.value, 10) || 0)
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-2xl font-bold">Questions</h2>
        <Button variant="outline" onClick={handleAddQuestion} disabled={saving}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="w-full space-y-4"
      >
        {questions.map((question, qIndex) => (
          <AccordionItem
            value={`item-${question.id}`}
            key={question.id}
            className="border rounded-lg bg-white shadow-sm"
          >
            <AccordionTrigger className="p-4 font-semibold text-left hover:no-underline">
              <span className="flex-1">
                Question {qIndex + 1}: {question.title || "New Question"}
              </span>
            </AccordionTrigger>

            <AccordionContent className="p-6 border-t space-y-6">
              {/* Question Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`q-title-${question.id}`}>Question Title</Label>
                  <Input
                    id={`q-title-${question.id}`}
                    value={question.title}
                    onChange={(e) =>
                      handleQuestionChange(question.id, "title", e.target.value)
                    }
                    placeholder="e.g., Two Sum Problem"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`q-func-${question.id}`}>
                    Function Name
                  </Label>
                  <Input
                    id={`q-func-${question.id}`}
                    value={question.functionName}
                    onChange={(e) =>
                      handleQuestionChange(
                        question.id,
                        "functionName",
                        e.target.value
                      )
                    }
                    placeholder="e.g., findTwoSum"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`q-desc-${question.id}`}>Description</Label>
                <Textarea
                  id={`q-desc-${question.id}`}
                  value={question.description}
                  onChange={(e) =>
                    handleQuestionChange(
                      question.id,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the problem to be solved."
                  disabled={saving}
                />
              </div>

              {/* Test Cases */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Test Cases</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddTestCase(question.id)}
                    disabled={saving}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Case
                  </Button>
                </div>

                {question.testCases.map((tc, tcIndex) => (
                  <Card key={tcIndex} className="p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-medium">
                        Case {tcIndex + 1}
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100"
                        onClick={() =>
                          handleRemoveTestCase(question.id, tcIndex)
                        }
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`tc-input-${question.id}-${tcIndex}`}
                          className="text-sm"
                        >
                          Input
                        </Label>
                        <Textarea
                          id={`tc-input-${question.id}-${tcIndex}`}
                          value={tc.input}
                          onChange={(e) =>
                            handleTestCaseChange(
                              question.id,
                              tcIndex,
                              "input",
                              e.target.value
                            )
                          }
                          placeholder="[1, 2, 3], 5"
                          rows={2}
                          className="font-mono text-sm"
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`tc-output-${question.id}-${tcIndex}`}
                          className="text-sm"
                        >
                          Expected Output
                        </Label>
                        <Textarea
                          id={`tc-output-${question.id}-${tcIndex}`}
                          value={tc.output}
                          onChange={(e) =>
                            handleTestCaseChange(
                              question.id,
                              tcIndex,
                              "output",
                              e.target.value
                            )
                          }
                          placeholder="[0, 2]"
                          rows={2}
                          className="font-mono text-sm"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-right mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveQuestion(question.id)}
                  disabled={saving}
                >
                  Remove Question
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          size="lg"
          className="bg-slate-800 hover:bg-slate-700"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Entire Test"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateTest;
