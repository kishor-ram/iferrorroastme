import { useState, useEffect } from "react";
import AdminDashboard from "./admindash";
import CreateTest from "./CreateTest";
import { Test } from "@/lib/types";
import { db, auth } from "../Firebase/config";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ViewResults from "./ViewResults";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

const AdminPortal = () => {
  const [view, setView] = useState("dashboard");
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Admin',
          photoURL: currentUser.photoURL || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time tests listener with automatic deletion of expired tests
  useEffect(() => {
    if (!user) return;

    const testsQuery = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
      const now = new Date();
      const testsData: Test[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const testData = {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to Date
          createdAt: data.createdAt?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || null
        } as Test;

        // Check if test has expired
        if (testData.endDate && new Date(testData.endDate) < now) {
         
          deleteDoc(doc.ref).catch(err => console.error("Error deleting expired test:", err));
        } else {
          testsData.push(testData);
        }
      });

      setTests(testsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time results listener
  useEffect(() => {
    if (!user) return;

    const resultsQuery = query(collection(db, 'results'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
      const resultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(resultsData);
    });

    return () => unsubscribe();
  }, [user]);

  // Function to handle deleting a test
  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete the test document
      await deleteDoc(doc(db, 'tests', testId));

      // Optionally: Delete all results associated with this test
      const resultsQuery = query(collection(db, 'results'), where('testId', '==', testId));
      const resultsSnapshot = await getDocs(resultsQuery);
      
      const deletePromises = resultsSnapshot.docs.map(resultDoc => 
        deleteDoc(doc(db, 'results', resultDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      alert("Test and associated results deleted successfully!");
    } catch (error) {
      // console.error("Error deleting test:", error);
      alert("Failed to delete test. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-2xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Please login to access admin portal</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "create":
        return <CreateTest onBack={() => setView("dashboard")} />;
      case "results":
        return <ViewResults onBack={() => setView("dashboard")} />; 
      case "dashboard":
      default:
        return (
          <AdminDashboard
            adminName={user.displayName}
            tests={tests}
            results={results}
            user={user}
            onNavigate={setView}
            onSignOut={handleSignOut}
            onDeleteTest={handleDeleteTest}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {renderContent()}
    </div>
  );
};

export default AdminPortal;