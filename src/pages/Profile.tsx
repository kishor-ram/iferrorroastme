import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/Firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; // adjust to your auth hook
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Target, Trophy, User, Clock, Flame } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 🔥 current Firebase user
  const [profile, setProfile] = useState<any>(null);
  const [proficiency, setProficiency] = useState("Beginner");
  const [todayLoggedIn, setTodayLoggedIn] = useState(false);

  // 🧩 Compute initials
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    let initials = parts.map((p) => p[0].toUpperCase()).join("");
    return initials.length > 3 ? initials.slice(0, 3) : initials;
  };

  // ⚙️ Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        }

        // Fetch test results
        const resultsSnap = await getDocs(
          collection(db, "results", user.email, "tests")
        );
        const testCount = resultsSnap.size;

        // 🎯 Calculate proficiency
        if (testCount < 5) setProficiency("Beginner");
        else if (testCount < 15) setProficiency("Intermediate");
        else setProficiency("Pro Coder");

        // ✅ Check if logged in today
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem("lastLoginDate");
        if (lastLogin === today) {
          setTodayLoggedIn(true);
        } else {
          setTodayLoggedIn(true);
          localStorage.setItem("lastLoginDate", today);
        }
      } catch (error) {
        // console.error("Error loading profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) return <div className="text-center p-10">Loading profile...</div>;

  const initials = getInitials(profile.name);

  return (
    <div className="min-h-screen bg-background text-center">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">My Profile</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Profile Card */}
        <Card className="p-8 shadow-card">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
              <p className="text-muted-foreground text-lg">{profile.email}</p>
              {todayLoggedIn && (
                <p className="text-green-600 font-medium mt-2">
                  ✅ Logged in today
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Proficiency */}
        <Card className="p-8 text-center shadow-card bg-primary text-white">
          <div className="flex flex-col items-center justify-center">
            <Flame className="w-10 h-10 mb-2" />
            <h3 className="text-2xl font-bold mb-2">Proficiency Level</h3>
            <p className="text-xl font-semibold mb-4">{proficiency}</p>
            <p className="text-white/90 text-lg">
              “Oru test fail aacha? Tension aagaadha da, next time jeichiralam! 🚀”
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
