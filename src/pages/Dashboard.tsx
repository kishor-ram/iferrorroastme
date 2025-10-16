import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Plus, Play, User, LogOut, Clock, CheckCircle2, History, Trophy } from "lucide-react";
import gsap from "gsap";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../Firebase/config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "attendee">("attendee");
  const [userName, setUserName] = useState("Nanba");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTests, setCompletedTests] = useState<any[]>([]);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();
    fetchTestsAndResults();
  }, []);

  useEffect(() => {
    // Header animation - slides down from top
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (welcomeRef.current) {
      gsap.fromTo(
        welcomeRef.current.children,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, delay: 0.3, ease: "power2.out" }
      );
    }

    // ✅ Trigger this animation only when `tests` changes
    if (cardsRef.current && cardsRef.current.children.length > 0) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }

    // Stats animation
    if (statsRef.current && completedTests.length > 0) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [tests, completedTests]); // rerun when data changes
  ;

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.email!));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || "Nanba");
          setUserRole(userData.role || "attendee");
        }
      }
    } catch (error) {
      // console.error("Error fetching user data:", error);
    }
  };

  const fetchTestsAndResults = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return;

      // Fetch all tests
      const testsSnapshot = await getDocs(collection(db, "tests"));
      const allTests = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch completed tests for current user
      const resultsRef = collection(db, "results", user.email, "tests");
      const resultsSnapshot = await getDocs(resultsRef);
      const completedTestIds = resultsSnapshot.docs.map(doc => doc.id);

      // Get detailed completed tests data
      const completed = resultsSnapshot.docs.map(doc => ({
        testId: doc.id,
        ...doc.data()
      }));
      setCompletedTests(completed);

      // Filter out completed tests from available tests
      const availableTests = allTests.filter(test => !completedTestIds.includes(test.id));
      setTests(availableTests);
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching tests:", error);
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-success";
      case "Medium": return "text-primary";
      case "Hard": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Enna da ippadi panra? Keep coding, keep winning! 🔥",
      "Naan oru thadava commit panna, code-eh work aagum da! 💪",
      "Mind it da maamey! Your code should be 'Vera Level' 🚀",
      "Kabali da! Test elaam pass panniduven! 😎",
      "Ethana tests vandhaalum nan compile pannuven! 💯",
      "Naan ready... neenga ready-ah? Let's ace this! 🎯",
      "En vazhi thani vazhi! Code my way! 🌟",
      "Naan oru thadava test ezhuthinaa, pass than aagum! 💪",
      "Boss-u boss-u! Code panradhu-ku bayapadaadha! 🦁"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading-ah wait pannu da... 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header ref={headerRef} className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">If(Error) Roast();</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/history")}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <div ref={welcomeRef} className="space-y-2">
          <h2 className="text-4xl font-bold">
            Vanakkam {userName}!
          </h2>
          <p className="text-muted-foreground text-lg">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Completed Tests Summary */}
        {completedTests.length > 0 && (
          <Card className="p-6 bg-card/50 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Vera Level Performance! 🌟</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" ref={statsRef}>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-success mb-1">{completedTests.length}</div>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {completedTests.filter(t => t.passed).length}
                </div>
                <p className="text-sm text-muted-foreground">Passed (Mass! 🔥)</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round((completedTests.reduce((acc, t) => acc + (t.score || 0), 0) / completedTests.length) || 0)}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Score (Semma!)</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate("/history")}
            >
              <History className="w-4 h-4 mr-2" />
              View Full History (Flashback paakalam!)
            </Button>
          </Card>
        )}

        {/* Admin Actions */}
        {userRole === "admin" && (
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/create-test")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Test (Mass-ah oru test create pannu!)
            </Button>
          </div>
        )}

        <div>
          <h3 className="text-2xl font-bold mb-6">
            {tests.length > 0
              ? "Available Tests - Ready-ah? Seri Vaanga! 💪"
              : "Ellam complete pannita da! Romba nalla! 🎉"}
          </h3>

          {tests.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Appadiye Mass! 🔥</h3>
              <p className="text-muted-foreground">
                Ella tests-um complete pannita! Check history-la un mass performance-ah paaru!
              </p>
              <Button
                className="mt-6"
                onClick={() => navigate("/history")}
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Card>
          ) : (
            <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => {
                const isCompleted = completedTests.some(t => t.testId === test.id);

                return (
                  <Card
                    key={test.id}
                    className={`p-6 space-y-4 border border-border transition-all ${isCompleted
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-md hover:border-primary cursor-pointer"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold pr-4">{test.name}</h3>
                      <span className={`text-sm font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty || "General"}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm">
                      {test.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{test.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{test.questions?.length || 0} questions</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {isCompleted ? (
                        <Button className="w-full" variant="secondary" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed ✅
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="default"
                          onClick={() => navigate(`/compiler/${test.id}`)} 
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Arambikalama 🚀
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Stats */}
        {userRole === "admin" && (
          <div className="pt-8">
            <h3 className="text-2xl font-bold mb-6">Overview (Enna nadakkuthu-nu paapom!)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center border border-border">
                <div className="text-4xl font-bold text-primary mb-2">12</div>
                <p className="text-muted-foreground">Total Students (Namma Gang!)</p>
              </Card>
              <Card className="p-6 text-center border border-border">
                <div className="text-4xl font-bold text-success mb-2">8</div>
                <p className="text-muted-foreground">Tests Passed (Vera Level!)</p>
              </Card>
              <Card className="p-6 text-center border border-border">
                <div className="text-4xl font-bold text-destructive mb-2">4</div>
                <p className="text-muted-foreground">Needs Improvement (Konjam try pannu!)</p>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;