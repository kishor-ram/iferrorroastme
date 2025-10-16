import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { Test } from "../lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadedTetsProps {
  tests: Test[];
  onDeleteTest: (testId: string) => Promise<void>;
}

const UploadedTets = ({ tests, onDeleteTest }: UploadedTetsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (test: Test) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;

    setDeleting(true);
    try {
      await onDeleteTest(testToDelete.id);
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    } catch (error) {
      // console.error("Error deleting test:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    
    try {
      // Handle Firestore Timestamp
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getTimeRemaining = (endDate: any) => {
    if (!endDate) return null;
    
    try {
      const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) return "Expired";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
      } else {
        return "Less than 1 hour left";
      }
    } catch (error) {
      return null;
    }
  };

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Tests</CardTitle>
          <CardDescription>Tests you've created will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No tests created yet</p>
            <p className="text-sm text-slate-400 mt-2">Create your first test to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Tests</CardTitle>
          <CardDescription>Manage and monitor your created assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => {
              const timeRemaining = getTimeRemaining(test.endDate);
              const isExpiringSoon = timeRemaining && 
                (timeRemaining.includes("hour") || 
                 (timeRemaining.includes("day") && parseInt(timeRemaining) <= 1));
              
              return (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {test.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {test.description || `${test.questions?.length || 0} questions`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(test)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{test.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{test.questions?.length || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(test.createdAt)}</span>
                      </div>
                    </div>

                    {test.endDate && (
                      <div className="mt-4 flex items-center gap-2">
                        {isExpiringSoon && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <Badge 
                          variant={isExpiringSoon ? "destructive" : "secondary"}
                          className={isExpiringSoon ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : ""}
                        >
                          {timeRemaining === "Expired" ? (
                            "Expired - Will be deleted"
                          ) : (
                            `Expires: ${formatDate(test.endDate)} (${timeRemaining})`
                          )}
                        </Badge>
                      </div>
                    )}

                    {test.createdByName && (
                      <p className="text-xs text-slate-500 mt-3">
                        Created by: {test.createdByName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Test
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>"{testToDelete?.name}"</strong>?
              </p>
              <p className="text-red-600 font-medium">
                This will also delete all associated student results and submissions. 
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UploadedTets;