import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Chrome } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../Firebase/config";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const loginDialogues = [
    "Google account vachu ulra poi, seekiram login aagu da! ⚡",
    "Enna da waiting? Click pannu, pogalam! 🚀",
    "Login pannaama exam ezhudha mudiyadhu da thambi! 📝",
    "Fast ah login aagu, time waste pannaadhey! ⏰"
  ];

  const errorDialogues = [
    "Enna kanna login aagalaya? Poi Kishor ah kelu! 😅",
    "Google account register pannala pola... Admin ah contact pannu! 📧",
    "Server mood illaama iruku, konjam wait pannu! 🤦‍♂️",
    "Network ah check pannu da, WiFi connect aagutha? 📡"
  ];

  const successDialogues = {
    admin: "Mass ah admin login aagitta! Dashboard-ku polaam! 👑",
    testAttendee: "Seri da, test eluthura pora... All the best! 💪"
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && userData) {
      // console.log("✅ Already logged in, redirecting...");
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (userData.role === "testAttendee") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, userData, authLoading, navigate]);

  // Rotate dialogues
  useEffect(() => {
    const interval = setInterval(() => {
      setDialogueIndex((prev) => (prev + 1) % loginDialogues.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loginDialogues.length]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      // console.log("🔄 Starting Google Sign-In...");
      
      // Step 1: Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // console.log("✅ Google Sign-In successful:", {
      //   email: user.email,
      //   name: user.displayName,
      //   uid: user.uid
      // });

      // Check if email exists
      if (!user.email) {
        // console.error("❌ No email found in Google account");
        await auth.signOut();
        setError("Email illa da! Valid Google account use pannu! 📧");
        setLoading(false);
        return;
      }

      // console.log("🔍 Checking user in Firestore:", user.email);

      // Step 2: Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userDocRef);

      // console.log("📄 Firestore check result:", {
      //   exists: userDoc.exists(),
      //   email: user.email
      // });

      if (!userDoc.exists()) {
        // console.error("❌ User not found in database");
        await auth.signOut();
        setError(errorDialogues[1]); // "Admin ah contact pannu!"
        setLoading(false);
        return;
      }

      // Step 3: Get user role
      const userData = userDoc.data();
      const userRole = userData?.role;

      // console.log("👤 User data:", {
      //   role: userRole,
      //   allData: userData
      // });

      if (!userRole) {
        // console.error("❌ No role found for user");
        await auth.signOut();
        setError("Role illa da! Admin ah kelu! 🤔");
        setLoading(false);
        return;
      }

      // Step 4: Navigate based on role
      if (userRole === "admin") {
        // console.log("✅ Admin login successful");
        setError(successDialogues.admin);
        setTimeout(() => {
          navigate("/admin", { replace: true });
        }, 1000);
      } else if (userRole === "testAttendee") {
        // console.log("✅ Test attendee login successful");
        setError(successDialogues.testAttendee);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        // console.error("❌ Invalid role:", userRole);
        await auth.signOut();
        setError(`Invalid role: ${userRole}. Admin ah kelu! 🤔`);
        setLoading(false);
      }

    } catch (err: any) {
      // console.error("💥 Login Error:", err);
      // console.error("Error code:", err.code);
      // console.error("Error message:", err.message);
      
      // Handle specific errors
      if (err.code === "auth/popup-closed-by-user") {
        setError("Yen da cancel pannita? Retry pannu! 😅");
        setLoading(false);
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Popup cancel aachu! Matha try pannu! 🔄");
        setLoading(false);
      } else if (err.code === "auth/network-request-failed") {
        setError(errorDialogues[3]); // Network error
        setLoading(false);
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain authorized illa da! Firebase settings check pannu! 🔒");
        setLoading(false);
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Google sign-in enable pannala pola! Firebase console check pannu! ⚙️");
        setLoading(false);
      } else if (err.code === "permission-denied") {
        setError("Database permission illa! Admin ah kelu! 🔒");
        setLoading(false);
      } else if (err.message.includes("Firestore") || err.message.includes("firebase")) {
        setError("Database connection fail! Admin ah solu! 🗄️");
        setLoading(false);
      } else {
        setError(`Error: ${err.message || "Unknown error"} 😢`);
        setLoading(false);
      }
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="w-12 h-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Code2 className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold">If(Error) Roast();</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-muted-foreground">
            {loginDialogues[dialogueIndex]}
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="space-y-6">
            {error && (
              <Alert className={error.includes("Mass") || error.includes("All the best") ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}>
                <AlertDescription className="text-center font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Chrome className="w-5 h-5" />
              {loading ? "Loading..." : "Continue with Google"}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Oru click la login aagalam! 🎯</p>
              <p className="mt-2">No password, no tension! 😎</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Trouble login panradhula? Tech team ah torture pannu! 🛠️</p>
        </div>
      </div>
    </div>
  );
};

export default Login;