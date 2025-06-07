
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, AlertTriangle, Download, Eye, FileText, Users } from 'lucide-react';

const SubmissionTracking = () => {
  const [selectedAssignment, setSelectedAssignment] = useState('1');
  
  const assignments = [
    { id: '1', title: 'Project Proposal Review', type: 'team' },
    { id: '2', title: 'Peer Evaluation Round 1', type: 'individual' }
  ];

  const submissions = {
    '1': [
      {
        id: 1,
        teamName: 'Alpha Team',
        submitterName: 'John Doe',
        submittedAt: '2024-06-14T14:30:00',
        status: 'submitted',
        isLate: false,
        fileCount: 2,
        comments: 'Updated proposal with feedback from initial review'
      },
      {
        id: 2,
        teamName: 'Beta Squad',
        submitterName: 'Charlie Wilson',
        submittedAt: '2024-06-15T16:45:00',
        status: 'submitted',
        isLate: true,
        fileCount: 1,
        comments: 'Final version of the proposal'
      },
      {
        id: 3,
        teamName: 'Gamma Force',
        submitterName: null,
        submittedAt: null,
        status: 'pending',
        isLate: false,
        fileCount: 0,
        comments: null
      }
    ],
    '2': [
      {
        id: 4,
        studentName: 'Alice Brown',
        submittedAt: '2024-06-19T10:15:00',
        status: 'submitted',
        isLate: false,
        rating: 4.2,
        comments: 'Completed peer evaluation for all team members'
      },
      {
        id: 5,
        studentName: 'Bob Johnson',
        submittedAt: null,
        status: 'pending',
        isLate: false,
        rating: null,
        comments: null
      }
    ]
  };

  const getStatusIcon = (status, isLate) => {
    if (status === 'submitted') {
      return isLate ? 
        <AlertTriangle className="h-4 w-4 text-orange-500" /> : 
        <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'submitted') {
      return (
        <Badge variant={isLate ? 'destructive' : 'default'}>
          {isLate ? 'Late' : 'Submitted'}
        </Badge>
      );
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const currentAssignment = assignments.find(a => a.id === selectedAssignment);
  const currentSubmissions = submissions[selectedAssignment] || [];
  const submittedCount = currentSubmissions.filter(s => s.status === 'submitted').length;
  const totalCount = currentSubmissions.length;
  const lateCount = currentSubmissions.filter(s => s.status === 'submitted' && s.isLate).length;

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
                <p className="text-2xl font-bold">{submittedCount}/{totalCount}</p>
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
                <p className="text-2xl font-bold">{Math.round((submittedCount / totalCount) * 100)}%</p>
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
                <p className="text-2xl font-bold">{lateCount}</p>
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
                <p className="text-2xl font-bold">{totalCount - submittedCount}</p>
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
              <CardTitle>Submissions for {currentAssignment?.title}</CardTitle>
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
                <TableHead>{currentAssignment?.type === 'team' ? 'Team/Submitter' : 'Student'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Files/Rating</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {currentAssignment?.type === 'team' 
                            ? submission.teamName?.charAt(0) 
                            : submission.studentName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {currentAssignment?.type === 'team' 
                            ? submission.teamName 
                            : submission.studentName}
                        </p>
                        {currentAssignment?.type === 'team' && submission.submitterName && (
                          <p className="text-sm text-muted-foreground">by {submission.submitterName}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status, submission.isLate)}
                      {getStatusBadge(submission.status, submission.isLate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.submittedAt ? (
                      <div>
                        <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.status === 'submitted' ? (
                      currentAssignment?.type === 'team' ? (
                        <span>{submission.fileCount} files</span>
                      ) : (
                        <span>{submission.rating ? `${submission.rating}/5` : 'No rating'}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">
                        {submission.comments || <span className="text-muted-foreground">No comments</span>}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'submitted' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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
    </div>
  );
};

export default SubmissionTracking;
