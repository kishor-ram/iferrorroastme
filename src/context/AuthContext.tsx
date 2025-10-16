import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase/config";

interface UserData {
  email: string;
  role: "admin" | "testAttendee";
  name?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTestAttendee: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isTestAttendee: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log("🔐 Setting up auth listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // console.log("👤 User found:", firebaseUser.email);
        setUser(firebaseUser);

        try {
          const userDocRef = doc(db, "users", firebaseUser.email!);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              email: firebaseUser.email!,
              role: data.role,
              name: firebaseUser.displayName || data.name,
              photoURL: firebaseUser.photoURL || data.photoURL,
            });
            // console.log("✅ User data loaded:", data.role);
          } else {
            // console.error("❌ User document not found");
            await auth.signOut();
            setUser(null);
            setUserData(null);
          }
        } catch (error) {
          // console.error("💥 Error fetching user data:", error);
          await auth.signOut();
          setUser(null);
          setUserData(null);
        }
      } else {
        // console.log("🚪 No user logged in");
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user && !!userData,
    isAdmin: userData?.role === "admin",
    isTestAttendee: userData?.role === "testAttendee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};