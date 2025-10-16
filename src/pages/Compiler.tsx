
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, Play, Send, ArrowLeft, Clock, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import Editor from "@monaco-editor/react";
import gsap from "gsap";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../Firebase/config";

const roastMessages = [
  "Seri seri Tension aagatha poi oru Black Coffee potu vaa! ☕",
  "Error da! Konjam yosichu podu da 😅",
  "Code fail aagiduchu da! Black coffee kudichu vaa da 😭",
  "Syntax error ah? Basic ah kuda theriyala? 🤦",
  "Runtime error da! Test case-a paathuttu code pannu 😤",
  "Enna da idhu? Logic ey illa! 🤔",
  "Semicolon miss panna? Aiyo kadavule 😂",
  "Indha code-a paathu nadichuku da! 😱",
  "Nee ippo enna panra? Google-la search pannu da! 🔍",
  "Error-ku error add pannitu iruka? Comedy-ah? 🎭",
  "Code-ah illa comedy-ah? Puriyala da! 😵",
  "Idhu enna da logic? Reverse-la yosikura? 🔄",
  "Test case fail! Nee pass aaga maatenga pola! 📉"
];

const successMessages = [
  "Nee jeichita maaraa 💥",
  "Semma da! Code vera level 🔥",
  "Mass da mass! All test cases passed 🎯",
  "Champion da nee! Next Sundar Pichai confirmed 😎",
  "Perfect execution da! Thalaivar level 🌟",
  "Appadiye kalakiteenga boss! 🦁",
  "Romba nalla pannirukenga! 👏",
  "Idhu dhaan coding-nu solluvaanga! 💪",
  "Superstar da nee! 🌠",
  "En magan-a nee pola oru coder-ah irundhurunda! 👨‍💻"
];

const prayerMessages = [
  "Saami kitta pray panniko, ella test casum pass aaganumnu! 🙏",
  "Kadavul kitta kumbidu da, code work aaganum! 🕉️",
  "Murugan-a nenachi run pannu, test pass aagidum! 🔱",
  "Pray pannu da, logic correct-ah irukanum! 🙏",
  "Bhagwan-a nenachi submit pannu! 🌟",
  "Temple ponnu da, code-ku blessing venum! 🛕"
];

const pythonTemplate = (functionName: string) => `def ${functionName}:
    # Inga unoda logic eluthu da! 🤔
    pass`;

const javaTemplate = (functionName: string) => {
  const funcName = functionName.split('(')[0];
  return `public static void ${functionName} {
    // Inga unoda logic eluthu da! 🤔
}`;
};

const Compiler = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testData, setTestData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [hasWarned5Min, setHasWarned5Min] = useState(false);
  const [hasWarned1Min, setHasWarned1Min] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [questionCodes, setQuestionCodes] = useState<{ [key: number]: string }>({});
  const [questionResults, setQuestionResults] = useState<{ [key: number]: any }>({});

  const currentQuestion = testData?.questions?.[currentQuestionIndex];

  const getCurrentCode = () => {
    if (!currentQuestion) return "";
    return questionCodes[currentQuestion.id] || getDefaultTemplate();
  };

  const getDefaultTemplate = () => {
    if (!currentQuestion) return "";
    return language === "python"
      ? pythonTemplate(currentQuestion.functionName)
      : javaTemplate(currentQuestion.functionName);
  };

  useEffect(() => {
    fetchTestData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }

          if (prev === 300 && !hasWarned5Min) {
            toast.warning("Ayyo! 5 minutes dha maachiruchu! Seekiram pannu da! ⚠️", {
              duration: 5000
            });
            setHasWarned5Min(true);
          }

          if (prev === 60 && !hasWarned1Min) {
            toast.error("Oru nimisham dhan da! Time waste pannaadheenga! 🚨", {
              duration: 5000
            });
            setHasWarned1Min(true);
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeLeft, hasWarned5Min, hasWarned1Min]);

  const fetchTestData = async () => {
    try {
      const testDoc = await getDoc(doc(db, "tests", testId!));
      if (testDoc.exists()) {
        const data = testDoc.data();
        setTestData(data);
        if (data.questions && data.questions.length > 0) {
          const initialCodes: { [key: number]: string } = {};
          data.questions.forEach((q: any) => {
            const template = language === "python"
              ? pythonTemplate(q.functionName)
              : javaTemplate(q.functionName);
            initialCodes[q.id] = template;
          });
          setQuestionCodes(initialCodes);
        }

        setTimeLeft(data.duration * 60);
      } else {
        toast.error("Test data kaanomla da! 😕");
        navigate("/dashboard");
      }
    } catch (error) {
      // console.error("Error fetching test:", error);
      toast.error("Enna aachu-nu theriyala! Try pannu again! 🤷");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (testData?.questions) {
      const newCodes: { [key: number]: string } = {};
      testData.questions.forEach((q: any) => {
        const template = value === "python"
          ? pythonTemplate(q.functionName)
          : javaTemplate(q.functionName);
        newCodes[q.id] = template;
      });
      setQuestionCodes(newCodes);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!currentQuestion || !value) return;
    setQuestionCodes(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Real-time code execution
  const executeCodeRealTime = async (userCode: string, testCase: any) => {
    try {
      if (language === "python") {
        return await executePython(userCode, testCase);
      } else {
        return await executeJava(userCode, testCase);
      }
    } catch (error: any) {
      return {
        passed: false,
        error: `Runtime error da! 💥\n${error.message || error}`,
        line: error.line || "Unknown"
      };
    }
  };

  const executePython = async (userCode: string, testCase: any) => {
    try {
      const funcMatch = currentQuestion.functionName.match(/(\w+)\((.*?)\)/);
      if (!funcMatch) {
        return { passed: false, error: "Function name parse aagala da! 😓" };
      }

      const funcName = funcMatch[1];
      const params = funcMatch[2].split(',').map((p: string) => p.trim());

      const inputs = testCase.input.split(',').map((i: string) => i.trim());

      const fullCode = `
${userCode}

try:
    result = ${funcName}(${inputs.join(', ')})
    print(result)
except SyntaxError as e:
    print(f"Syntax error da line {e.lineno}: {e.msg} 😅")
except NameError as e:
    print(f"Variable define pannala da: {e} 🤦")
except TypeError as e:
    print(f"Type match aagala da: {e} 😰")
except Exception as e:
    print(f"Error da: {e} 💥")
`;
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{
            content: fullCode
          }]
        })
      });

      const result = await response.json();

      if (result.run.stderr) {
        // Parse error line number
        const lineMatch = result.run.stderr.match(/line (\d+)/);
        const line = lineMatch ? lineMatch[1] : "Unknown";
        return {
          passed: false,
          error: `Error da line ${line}-la! 😅\n${result.run.stderr}`,
          line: line
        };
      }

      const output = result.run.stdout.trim();
      const expected = testCase.output.trim();

      if (output === expected) {
        return { passed: true, output: output };
      } else {
        return {
          passed: false,
          expected: expected,
          got: output,
          error: "Output match aagala da! Check pannu! 😓"
        };
      }
    } catch (error: any) {
      return {
        passed: false,
        error: `Execution error da! 💥\n${error.message}`,
        line: "Unknown"
      };
    }
  };

  const executeJava = async (userCode: string, testCase: any) => {
    try {
      const funcMatch = currentQuestion.functionName.match(/(\w+)\((.*?)\)/);
      if (!funcMatch) {
        return { passed: false, error: "Function name parse aagala da! 😓" };
      }

      const funcName = funcMatch[1];
      const inputs = testCase.input.split(',').map((i: string) => i.trim());

      const fullCode = `
public class Main {
    ${userCode}
    
    public static void main(String[] args) {
        try {
            Object result = ${funcName}(${inputs.join(', ')});
            System.out.println(result);
        } catch (Exception e) {
            System.err.println("Error da: " + e.getMessage() + " 💥");
            e.printStackTrace();
        }
    }
}
`;

      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'java',
          version: '15.0.2',
          files: [{
            name: 'Main.java',
            content: fullCode
          }]
        })
      });

      const result = await response.json();

      if (result.run.stderr) {
        const lineMatch = result.run.stderr.match(/Main.java:(\d+)/);
        const line = lineMatch ? lineMatch[1] : "Unknown";
        return {
          passed: false,
          error: `Error da line ${line}-la! 😅\n${result.run.stderr}`,
          line: line
        };
      }

      const output = result.run.stdout.trim();
      const expected = testCase.output.trim();

      if (output === expected) {
        return { passed: true, output: output };
      } else {
        return {
          passed: false,
          expected: expected,
          got: output,
          error: "Output match aagala da! Check pannu! 😓"
        };
      }
    } catch (error: any) {
      return {
        passed: false,
        error: `Execution error da! 💥\n${error.message}`,
        line: "Unknown"
      };
    }
  };

  const handleRunCode = async () => {
    const prayer = prayerMessages[Math.floor(Math.random() * prayerMessages.length)];
    toast(prayer, { duration: 2000 });

    setIsRunning(true);
    setOutput("Running test cases da... Wait pannu! ⏳\n\n");

    const userCode = getCurrentCode();

    if (!currentQuestion || !currentQuestion.testCases) {
      setOutput("Test cases kaanomla da! 😕");
      setIsRunning(false);
      return;
    }

    // Check if code is still template
    if (userCode.includes("pass") && userCode.split('\n').length < 5) {
      setOutput("Dei! Code elutha maranthutiya? 😅");
      setIsRunning(false);
      toast.error("Code eluthu da first! 🤦");
      return;
    }

    let passedCount = 0;
    let outputText = "";

    for (let i = 0; i < currentQuestion.testCases.length; i++) {
      const testCase = currentQuestion.testCases[i];
      const result = await executeCodeRealTime(userCode, testCase);

      if (result.passed) {
        passedCount++;
        outputText += `✅ Test Case ${i + 1}: Passed (Semma!)\n`;
        outputText += `   Input: ${testCase.input}\n`;
        outputText += `   Output: ${result.output}\n\n`;
      } else {
        outputText += `❌ Test Case ${i + 1}: Failed (Aiyoo!)\n`;
        outputText += `   Input: ${testCase.input}\n`;
        if (result.expected) {
          outputText += `   Expected: ${result.expected}\n`;
          outputText += `   Got: ${result.got}\n`;
        }
        outputText += `   Error: ${result.error}\n\n`;
      }
    }

    const allPassed = passedCount === currentQuestion.testCases.length;

    if (allPassed) {
      const successMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
      setOutput(`✅ Appadiye mass! Ella test cases-um passed! 🎉\n\n${successMsg}\n\n${outputText}`);
      toast.success(successMsg);
      setFailCount(0);
      setShowHint(false);

      setQuestionResults(prev => ({
        ...prev,
        [currentQuestion.id]: {
          passed: true,
          code: userCode,
          passedTests: passedCount,
          totalTests: currentQuestion.testCases.length,
          score: 100
        }
      }));
    } else {
      const roastMsg = roastMessages[Math.floor(Math.random() * roastMessages.length)];
      setOutput(`❌ Konjam test cases fail aagiduchu! 😓\n\n${roastMsg}\n\n${outputText}`);
      toast.error(roastMsg);

      const newFailCount = failCount + 1;
      setFailCount(newFailCount);

      if (newFailCount >= 3) {
        setShowHint(true);
      }

      const percentage = Math.round((passedCount / currentQuestion.testCases.length) * 100);
      setQuestionResults(prev => ({
        ...prev,
        [currentQuestion.id]: {
          passed: false,
          code: userCode,
          passedTests: passedCount,
          totalTests: currentQuestion.testCases.length,
          score: percentage
        }
      }));
    }

    if (resultRef.current) {
      gsap.from(resultRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
    }

    setIsRunning(false);
  };
const GEMINI_API_KEY = "AIzaSyBZQJiCUYpo0JLoNXsfJMxq5oRUKT-Pc0M";
const MODEL_NAME = "gemini-2.5-flash-lite"; // Updated model name

const getAIHint = async () => {
  toast.loading("AI kitta hint kekkuthu da... Wait pannu! 🤖");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Give a helpful coding hint in Tamil-English mix style for this problem:

Problem: ${currentQuestion.description}
Function: ${currentQuestion.functionName}
Test Cases: ${JSON.stringify(currentQuestion.testCases.slice(0, 2))}

Give a step-by-step hint without revealing the complete solution. Use funny Tamil-English style like "Seri da, ippadi try pannu:"`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    // console.log("Raw AI Response:", data);

    let hint = "";
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      hint = data.candidates[0].content.parts[0].text;
    } else if (data.outputText) {
      hint = data.outputText;
    } else {
      throw new Error("AI response illa da!");
    }

    setAiHint(hint);
    toast.dismiss();
    toast.success("AI hint ready da! Paathuko! 🎯");
  } catch (error) {
    // console.error("AI Error:", error);
    toast.dismiss();

    const fallbackHint = `Seri da, ippadi try pannu:

1. ${currentQuestion.functionName}-ku proper input pass pannu
2. Logic-a step by step think pannu
3. Edge cases-a handle pannanum
4. Return statement correct-ah irukanum

Ippadi try pannu, work aagum! 💡`;

    setAiHint(fallbackHint);
    toast.success("Hint ready da! (Offline mode) 🎯");
  }
};

  const handleQuestionNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setOutput("");
      setShowHint(false);
      setAiHint("");
      setFailCount(0);
    } else if (direction === 'next' && currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setOutput("");
      setShowHint(false);
      setAiHint("");
      setFailCount(0);
    }
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    toast.error("Time mudinjiduchu da! Auto-submit aagiduchu! ⏰", { duration: 5000 });
    await saveResults(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  const handleSubmit = async () => {
    if (confirm("Confirm-ah submit pannanum? Changes panna mudiyaadhu! 🤔")) {
      await saveResults(false);
    }
  };

  const saveResults = async (autoSubmit: boolean = false) => {
    try {
      const user = auth.currentUser;
      if (!user?.email) {
        toast.error("Login pannala da! 😕");
        return;
      }

      // Calculate overall score
      const allResults = Object.values(questionResults);
      const totalScore = allResults.length > 0
        ? Math.round(allResults.reduce((sum: number, r: any) => sum + r.score, 0) / allResults.length)
        : 0;

      const resultData = {
        testId: testId,
        testName: testData.name,
        questionResults: questionResults,
        totalQuestions: testData.questions.length,
        attemptedQuestions: Object.keys(questionResults).length,
        overallScore: totalScore,
        language: language,
        submittedAt: new Date().toISOString(),
        autoSubmit: autoSubmit,
        timeSpent: (testData.duration * 60) - timeLeft
      };

      await setDoc(doc(db, "results", user.email, "tests", testId!), resultData);

      if (!autoSubmit) {
        if (totalScore === 100) {
          toast.success(`Mass da! Perfect score: ${totalScore}%! 🎉`);
        } else if (totalScore >= 50) {
          toast.success(`Nalladhu! ${totalScore}% score! 📊`);
        } else {
          toast.warning(`${totalScore}% dhan. Next time better pannu! 💪`);
        }
      }

      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1500);
    } catch (error) {
      // console.error("Error saving:", error);
      toast.error("Results save aagala! Try again! 😓");
    }
  };

  if (!testData || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-lg">
        Loading test data... ⏳
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Exit aaganum? Progress save aagadhu! 😰")) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  navigate("/dashboard");
                }
              }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">{testData.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5 text-destructive" />
              <span className={timeLeft < 300 ? "text-destructive animate-pulse" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 shadow-sm overflow-auto max-h-[calc(100vh-200px)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Question {currentQuestionIndex + 1}/{testData.questions.length}: {currentQuestion.title}
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuestionNavigation('prev')}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuestionNavigation('next')}
                disabled={currentQuestionIndex === testData.questions.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {currentQuestion.description}
            </p>
          </div>

          {currentQuestion.testCases?.slice(0, 2).map((testCase: any, index: number) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-lg">Example {index + 1}:</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                <div><span className="text-primary font-semibold">Input:</span> {testCase.input}</div>
                <div><span className="text-green-600 font-semibold">Output:</span> {testCase.output}</div>
              </div>
            </div>
          ))}

          <div className="bg-accent/50 p-4 rounded-lg border border-accent">
            <p className="text-sm font-medium mb-2">💡 Function Name:</p>
            <code className="bg-background px-3 py-2 rounded block font-mono text-sm">
              {currentQuestion.functionName}
            </code>
            <p className="text-sm mt-3 text-muted-foreground">
              Neeyum function body mathum eluthu! Function name um parameters um already iruku! 😎
            </p>
          </div>

          {showHint && (
            <Card className="p-4 border-2 border-primary bg-primary/5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">
                    3 times fail aagiduchu! Hint venum-ah? 😅
                  </h4>
                  {aiHint ? (
                    <div className="bg-background p-3 rounded mt-2 text-sm whitespace-pre-wrap">
                      {aiHint}
                    </div>
                  ) : (
                    <Button size="sm" onClick={getAIHint} className="mt-2">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      AI Hint Kudu! 🤖
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4 shadow-sm">
            <Editor
              height="400px"
              language={language}
              value={getCurrentCode()}
              onChange={handleCodeChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </Card>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Run (Odi Paaru!)"}
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={handleSubmit}
              disabled={isRunning}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit (Mudichuten!)
            </Button>
          </div>

          {output && (
            <Card ref={resultRef} className="p-4 shadow-sm">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Output:
              </h3>
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg max-h-[300px] overflow-auto">
                {output}
              </pre>
            </Card>
          )}

          {/* Question Progress Indicator */}
          <Card className="p-4 shadow-sm">
            <h3 className="font-semibold mb-3 text-sm">Question Progress:</h3>
            <div className="flex gap-2 flex-wrap">
              {testData.questions.map((q: any, idx: number) => {
                const result = questionResults[q.id];
                const isActive = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setOutput("");
                      setShowHint(false);
                      setAiHint("");
                      setFailCount(0);
                    }}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${isActive
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                      : result?.passed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : result
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              🟢 = Passed | 🟠 = Attempted | ⚪ = Not Attempted
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Compiler;