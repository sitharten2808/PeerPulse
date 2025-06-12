import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Submission as BaseSubmission } from '@/lib/supabase';

// Extend the imported Submission type for UI use if needed
interface SubmissionUI extends BaseSubmission {
  // Add any UI-specific fields here if needed
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  type: 'team' | 'individual';
  status: 'active' | 'completed' | 'cancelled';
  allowLateSubmissions: boolean;
  maxFiles: number;
  acceptedFormats: string[];
}

interface TimeRemaining {
  isOverdue: boolean;
  text: string;
}

export function StudentSubmission() {
  const [submissions, setSubmissions] = useState<Record<number, SubmissionUI>>({});
  const [files, setFiles] = useState<Record<number, File[]>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [addTaskDueDate, setAddTaskDueDate] = useState('');

  const assignments: Assignment[] = [
    {
      id: 1,
      title: 'Project Proposal Review',
      description: 'Review and provide feedback on team project proposals. Submit your teams refined proposal document.',
      dueDate: '2024-06-15T23:59:00',
      type: 'team',
      status: 'active',
      allowLateSubmissions: true,
      maxFiles: 3,
      acceptedFormats: ['.pdf', '.docx', '.txt']
    },
    {
      id: 2,
      title: 'Individual Reflection Essay',
      description: 'Write a 500-word reflection on your learning experience this semester.',
      dueDate: '2024-06-20T23:59:00',
      type: 'individual',
      status: 'active',
      allowLateSubmissions: false,
      maxFiles: 1,
      acceptedFormats: ['.pdf', '.docx']
    }
  ];

  const handleFileUpload = (assignmentId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => ({ ...prev, [assignmentId]: selectedFiles }));
  };

  const handleSubmit = (assignmentId: number) => {
    const assignmentFiles = files[assignmentId] || [];
    const comment = comments[assignmentId] || '';
    
    setSubmissions(prev => ({
      ...prev,
      [assignmentId]: {
        files: assignmentFiles,
        comment,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      }
    }));

    alert('Assignment submitted successfully!');
  };

  const getTimeRemaining = (dueDate: string): TimeRemaining => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return { isOverdue: true, text: 'Overdue' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return { isOverdue: false, text: `${days} day${days > 1 ? 's' : ''} remaining` };
    if (hours > 0) return { isOverdue: false, text: `${hours} hour${hours > 1 ? 's' : ''} remaining` };
    return { isOverdue: false, text: 'Due soon' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
        <p className="text-muted-foreground">View and submit your assignments</p>
      </div>

      <div className="space-y-6">
        {assignments.map(assignment => {
          const submission = submissions[assignment.id];
          const timeRemaining = getTimeRemaining(assignment.dueDate);
          const isSubmitted = submission?.status === 'submitted';
          
          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{assignment.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSubmitted ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Submitted
                      </Badge>
                    ) : timeRemaining.isOverdue ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeRemaining.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assignment Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Type: {assignment.type === 'team' ? 'Team Assignment' : 'Individual Assignment'}
                  </div>
                  <Badge variant="outline">
                    Max {assignment.maxFiles} file{assignment.maxFiles > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Submission Form or Status */}
                {isSubmitted ? (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Submitted on {new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Files:</strong> {submission.files.map(f => f.name).join(', ')}</p>
                      {submission.comment && (
                        <p><strong>Comments:</strong> {submission.comment}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Update Submission
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <Label htmlFor={`files-${assignment.id}`}>Upload Files</Label>
                      <div className="mt-2">
                        <Input
                          id={`files-${assignment.id}`}
                          type="file"
                          multiple={assignment.maxFiles > 1}
                          accept={assignment.acceptedFormats.join(',')}
                          onChange={(e) => handleFileUpload(assignment.id, e)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: {assignment.acceptedFormats.join(', ')} • Max {assignment.maxFiles} file{assignment.maxFiles > 1 ? 's' : ''}
                        </p>
                      </div>
                      {files[assignment.id] && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Selected files:</p>
                          <ul className="text-sm text-muted-foreground">
                            {files[assignment.id].map((file, index) => (
                              <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Comments */}
                    <div>
                      <Label htmlFor={`comments-${assignment.id}`}>Submission Comments (Optional)</Label>
                      <Textarea
                        id={`comments-${assignment.id}`}
                        placeholder="Add any comments about your submission..."
                        value={comments[assignment.id] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSubmit(assignment.id)}
                        disabled={!files[assignment.id] || files[assignment.id].length === 0}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Submit Assignment
                      </Button>
                    </div>

                    {timeRemaining.isOverdue && !assignment.allowLateSubmissions && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This assignment is overdue and no longer accepts submissions.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 