import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, AlertTriangle, Download, Eye, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Submission as BaseSubmission } from '@/lib/supabase';

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

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data, error } = await supabase.from('assignments').select('*');
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

  useEffect(() => {
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
    fetchSubmissions();
  }, [selectedAssignment]);

  const handleViewSubmission = (submission: SubmissionWithExtras) => {
    setSelectedSubmission(submission);
    setShowViewDialog(true);
  };

  const handleEvaluateSubmission = async () => {
    if (!selectedSubmission || !user) return;
    try {
      const { error } = await supabase.from('feedback').insert({
        submission_id: selectedSubmission.id,
        reviewer_id: user.id,
        rating: evaluationRating,
        comments: evaluationComment
      });
      if (error) throw error;
      setShowViewDialog(false);
      setSelectedSubmission(null);
      setEvaluationComment('');
      setEvaluationRating(0);
    } catch (error) {
      console.error('Error evaluating submission:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'submitted').length}/{submissions.length}</p>
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
                <p className="text-2xl font-bold">{Math.round((submissions.filter(s => s.status === 'submitted').length / submissions.length) * 100)}%</p>
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

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Submissions for {assignments.find(a => a.id === selectedAssignment)?.title}</CardTitle>
              <CardDescription>
                Detailed view of all submissions and their status
              </CardDescription>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
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
                    <Button variant="ghost" size="sm" onClick={() => handleViewSubmission(submission)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label>Files</Label>
                <ul>
                  {selectedSubmission.files.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Comments</Label>
                <p>{selectedSubmission.comments || 'No comments'}</p>
              </div>
              <div>
                <Label>Evaluation</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={evaluationRating}
                  onChange={(e) => setEvaluationRating(Number(e.target.value))}
                />
                <Textarea
                  value={evaluationComment}
                  onChange={(e) => setEvaluationComment(e.target.value)}
                  placeholder="Add your evaluation comments..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEvaluateSubmission}>Submit Evaluation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 