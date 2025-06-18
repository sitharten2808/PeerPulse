import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, AlertTriangle, Download, Eye, FileText, Users, Upload, MessageSquare, ThumbsUp, Star, Send, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Submission as BaseSubmission } from '@/lib/supabase';
import { SubmissionDialog } from '@/components/SubmissionDialog';
import { toast } from '@/components/ui/use-toast';

interface Assignment {
  id: string;
  title: string;
  type: 'individual' | 'team';
}

// Extend the imported Submission type for UI use
interface SubmissionWithExtras extends BaseSubmission {
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  team?: {
    id: string;
    name: string;
  };
  assignment?: {
    id: string;
    title: string;
    type: 'individual' | 'team';
  };
  is_late?: boolean;
}

export function SubmissionTracking() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithExtras | null>(null);
  const [evaluationComment, setEvaluationComment] = useState('');
  const [evaluationRating, setEvaluationRating] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [sentiment, setSentiment] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const sentimentOptions = [
    { value: 'positive', label: '😊 Positive', color: 'bg-green-100 text-green-800' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-100 text-gray-800' },
    { value: 'constructive', label: '🎯 Constructive', color: 'bg-blue-100 text-blue-800' },
  ];

  useEffect(() => {
    const fetchAssignments = async () => {
      // First get the teams the user is a member of
      const { data: userTeams, error: teamsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (teamsError) {
        console.error('Error fetching team memberships:', teamsError);
        return;
      }

      // Then fetch assignments only for those teams
      const teamIds = userTeams?.map(t => t.team_id) || [];
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .in('team_id', teamIds);

      if (error) {
        console.error('Error fetching assignments:', error);
        return;
      }
      setAssignments(data || []);
      if (data && data.length > 0) {
        setSelectedAssignment(data[0].id);
      }
    };
    fetchAssignments();
  }, []);

    const fetchSubmissions = async () => {
      if (!selectedAssignment) return;
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*), user:users(*), team:teams(*)')
        .eq('assignment_id', selectedAssignment);
      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }
      setSubmissions(data || []);
    };

  const fetchTotalTasks = async () => {
    if (!selectedAssignment) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('assignment_id', selectedAssignment);
      
      if (error) throw error;
      setTotalTasks(data?.length || 0);
    } catch (error) {
      console.error('Error fetching total tasks:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchTotalTasks();
  }, [selectedAssignment]);

    const fetchTasks = async () => {
    if (!selectedAssignment || !user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, assignment_id, assigned_to, status, description, due_date')
        .eq('assignment_id', selectedAssignment)
        .eq('assigned_to', user.id);
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
    };

  useEffect(() => {
    fetchTasks();
  }, [selectedAssignment, user]);

  const fetchEvaluations = async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, evaluator:users(name, avatar_url)')
        .eq('submission_id', submissionId);

      if (error) throw error;
      setEvaluations(data || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleViewSubmission = async (submission: SubmissionWithExtras) => {
    setSelectedSubmission(submission);
    setShowViewDialog(true);
    await fetchEvaluations(submission.id);
  };

  const handleEvaluateSubmission = async () => {
    if (!selectedSubmission || !user || !evaluationRating || !evaluationComment) {
      toast({
        title: "Missing information",
        description: "Please provide both rating and comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('evaluations')
        .insert({
          submission_id: selectedSubmission.id,
          evaluator_id: user.id,
          rating: evaluationRating,
          comments: evaluationComment
        });

      if (error) throw error;

      toast({
        title: "Evaluation submitted!",
        description: "Your evaluation has been recorded successfully.",
      });

      setShowViewDialog(false);
      setSelectedSubmission(null);
      setEvaluationComment('');
      setEvaluationRating(0);
      // Refresh evaluations
      await fetchEvaluations(selectedSubmission.id);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    setShowSubmitDialog(true);
  };

  const handleSubmissionSuccess = () => {
    // Refresh submissions after successful submission
    fetchSubmissions();
  };

  const handleViewFeedback = (submission: SubmissionWithExtras) => {
    // Only show feedback dialog for other users' submissions
    if (submission.user_id === user?.id) {
      toast({
        title: "Cannot provide feedback",
        description: "You cannot provide feedback on your own submission.",
        variant: "destructive",
      });
      return;
    }
    setSelectedSubmission(submission);
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || !user || !feedbackRating || !feedbackComment) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, get the team_id from the assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('team_id')
        .eq('id', selectedSubmission.assignment_id)
        .single();

      if (assignmentError) throw assignmentError;

      if (!assignmentData?.team_id) {
        toast({
          title: "Error",
          description: "This assignment is not associated with a team.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('team_feedback')
        .insert({
          team_id: assignmentData.team_id,
          to_user_id: selectedSubmission.user_id,
          from_user_id: user.id,
          rating: feedbackRating,
          content: feedbackComment,
          sentiment,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Your feedback has been sent successfully.",
      });
      
      setShowFeedbackDialog(false);
      setSelectedSubmission(null);
      setFeedbackComment('');
      setFeedbackRating(0);
      setSentiment('');
      // Refresh submissions to show new feedback
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string, isLate: boolean) => {
    if (status === 'submitted') {
      return isLate ? 
        <AlertTriangle className="h-4 w-4 text-orange-500" /> : 
        <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === 'submitted') {
      return (
        <Badge variant={isLate ? 'destructive' : 'default'}>
          {isLate ? 'Late' : 'Submitted'}
        </Badge>
      );
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleTaskSubmit = async (task: any) => {
    try {
      // Create a submission from the task
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: task.assignment_id,
          user_id: user?.id,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          files: [], // You can add file handling here if needed
          comments: `Submission for task: ${task.description}`
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Update task status to completed
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // Refresh both tasks and submissions
      fetchTasks();
      fetchSubmissions();

      toast({
        title: "Success",
        description: "Task submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error",
        description: "Failed to submit task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
      <div className="mb-8 mt-14">
        <h1 className="text-3xl font-bold mb-2">Submission Tracking</h1>
        <p className="text-muted-foreground">Monitor assignment submissions and student progress</p>
      </div>

      {/* Assignment Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {assignments.map((assignment) => (
              <Button
                key={assignment.id}
                variant={selectedAssignment === assignment.id ? 'default' : 'outline'}
                onClick={() => setSelectedAssignment(assignment.id)}
                className="flex items-center gap-2"
              >
                {assignment.type === 'team' ? <Users className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {assignment.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tasks for Selected Assignment</CardTitle>
          </CardHeader>
          <CardContent>
          {tasks.filter(task => task.status !== 'completed').length > 0 ? (
              <ul className="space-y-2">
                {tasks
                          .filter(task => task.status !== 'completed')
                          .map(task => (
                  <li key={task.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span>{task.description}</span>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  {task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTaskSubmit(task)}
                    >
                      Submit
                    </Button>
                  )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tasks for this assignment.</p>
            )}
          </CardContent>
        </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'submitted').length}/{totalTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round((submissions.filter(s => s.status === 'submitted').length / totalTasks) * 100)}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Submissions</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'submitted' && s.is_late).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{submissions.length - submissions.filter(s => s.status === 'submitted').length}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Submissions for {assignments.find(a => a.id === selectedAssignment)?.title}</CardTitle>
              <CardDescription>
                Detailed view of all submissions and their status
              </CardDescription>
            </div>
            {/* <Button onClick={() => handleSubmit(selectedAssignment)}>
              <Upload className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {submission.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{submission.user?.name || 'Unknown'}</p>
                        {submission.team && (
                          <p className="text-sm text-muted-foreground">Team: {submission.team.name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status, false)}
                      {getStatusBadge(submission.status, false)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.submitted_at ? (
                      <div>
                        <p>{new Date(submission.submitted_at).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.files.length} files
                  </TableCell>
                  <TableCell>
                    {submission.comments || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSubmission(submission)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.user_id !== user?.id && (
                        <Button variant="ghost" size="sm" onClick={() => handleViewFeedback(submission)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Submission Dialog */}
      <SubmissionDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        assignmentId={selectedAssignment}
        onSuccess={handleSubmissionSuccess}
      />

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Provide Feedback
            </DialogTitle>
            <DialogDescription>
              Share your thoughts and suggestions about this submission. Be honest and constructive.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <Label>Overall Rating *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= feedbackRating
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground hover:text-warning'
                        }`}
                      />
                    </button>
                  ))}
                  {feedbackRating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {feedbackRating === 1 && 'Needs Improvement'}
                      {feedbackRating === 2 && 'Below Average'}
                      {feedbackRating === 3 && 'Good'}
                      {feedbackRating === 4 && 'Very Good'}
                      {feedbackRating === 5 && 'Excellent'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label>Sentiment</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sentimentOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={sentiment === option.value ? "default" : "outline"}
                      className={`cursor-pointer ${option.color} ${
                        sentiment === option.value ? 'bg-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => setSentiment(sentiment === option.value ? '' : option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Your Feedback *</Label>
                <Textarea
                  id="feedback"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share specific examples and constructive suggestions..."
                  className="mt-2 min-h-[120px]"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Be specific and focus on behaviors rather than personality traits.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitFeedback}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <Label>Files</Label>
                <ul className="mt-2 space-y-2">
                  {selectedSubmission.files.map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Comments</Label>
                <p className="mt-2">{selectedSubmission.comments || 'No comments'}</p>
              </div>

              {/* Evaluations Section */}
              <div>
                <Label>Evaluations</Label>
                <div className="mt-4 space-y-4">
                  {evaluations.length > 0 ? (
                    evaluations.map((evaluation) => (
                      <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          {/* <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {evaluation.evaluator?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar> */}
                          <div>
                            {/* <p className="font-medium">{evaluation.evaluator?.name || 'Unknown'}</p> */}
                            <p className="text-sm text-muted-foreground">
                              {new Date(evaluation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= evaluation.rating
                                  ? 'fill-warning text-warning'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm">{evaluation.comments}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No evaluations yet
                    </p>
                  )}
                </div>
              </div>

              {/* Evaluation Form - Only show for other users' submissions */}
              {selectedSubmission.user_id !== user?.id && (
                <div className="mt-6 border-t pt-6">
                  <Label>Provide Evaluation</Label>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEvaluationRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                star <= evaluationRating
                                  ? 'fill-warning text-warning'
                                  : 'text-muted-foreground hover:text-warning'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Comments</Label>
                      <Textarea
                        value={evaluationComment}
                        onChange={(e) => setEvaluationComment(e.target.value)}
                        placeholder="Provide your evaluation comments..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleEvaluateSubmission}>
                      Submit Evaluation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 