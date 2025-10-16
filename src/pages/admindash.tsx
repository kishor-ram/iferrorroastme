import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Trophy, Users } from "lucide-react";
import UploadedTets from "./UploadedTets";
import { Test } from "../lib/types";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AdminDashboardProps {
  adminName: string;
  tests: Test[];
  results: any[];
  user: User;
  onNavigate: (view: 'create' | 'results') => void;
  onSignOut: () => void;
  onDeleteTest: (testId: string) => Promise<void>;
}

const AdminDashboard = ({ 
  adminName, 
  tests, 
  results, 
  user, 
  onNavigate, 
  onSignOut,
  onDeleteTest 
}: AdminDashboardProps) => {
  const totalQuestions = tests.reduce((acc, test) => acc + (test.questions?.length || 0), 0);

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome back, {adminName}!
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            What would you like to do today?
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={adminName} 
              className="w-12 h-12 rounded-full border-2 border-slate-300"
            />
          )}
          <Button onClick={onSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FilePlus2 className="w-8 h-8 text-slate-500" />
                  <span>Create New Test</span>
                </CardTitle>
                <CardDescription>
                  Design a new assessment with multiple questions and test cases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onNavigate('create')} className="w-full bg-slate-800 hover:bg-slate-700">
                  Create Test
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Trophy className="w-8 h-8 text-slate-500" />
                  <span>View Results</span>
                </CardTitle>
                <CardDescription>
                  Analyze student submissions and track their performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onNavigate('results')} className="w-full bg-slate-800 hover:bg-slate-700">
                  View Student Results
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Uploaded Tests List */}
          <UploadedTets tests={tests} onDeleteTest={onDeleteTest} />
        </div>

        {/* Sidebar/Info Area */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-800 text-white">
            <CardHeader>
              <CardTitle>Admin Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Tests Created</span>
                <span className="font-bold text-2xl">{tests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Questions</span>
                <span className="font-bold text-2xl">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Submissions</span>
                <span className="font-bold text-2xl">{results.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No submissions yet</p>
              ) : (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div key={result.id} className="py-2 border-b last:border-b-0">
                      <p className="text-sm font-medium">{result.userName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">Score: {result.score}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;