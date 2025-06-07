
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Users, Plus, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Project Proposal Review',
      description: 'Review and provide feedback on team project proposals',
      dueDate: '2024-06-15',
      type: 'team',
      status: 'active',
      submissions: 5,
      totalTeams: 8
    },
    {
      id: 2,
      title: 'Peer Evaluation Round 1',
      description: 'Evaluate teammates based on their contributions this sprint',
      dueDate: '2024-06-20',
      type: 'individual',
      status: 'active',
      submissions: 12,
      totalStudents: 24
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'team',
    allowLateSubmissions: false
  });

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const assignment = {
      id: assignments.length + 1,
      ...newAssignment,
      status: 'active',
      submissions: 0,
      totalTeams: newAssignment.type === 'team' ? 8 : undefined,
      totalStudents: newAssignment.type === 'individual' ? 24 : undefined
    };
    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: '', description: '', dueDate: '', type: 'team', allowLateSubmissions: false });
    setShowCreateForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const isInstructor = user?.role === 'instructor' || true; // Demo: assume instructor

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for your teams</p>
        </div>
        {isInstructor && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && isInstructor && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Set up a new assignment for your students or teams</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  placeholder="Describe the assignment requirements..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="type">Assignment Type</Label>
                  <select
                    id="type"
                    value={newAssignment.type}
                    onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="team">Team Assignment</option>
                    <option value="individual">Individual Assignment</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assignment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {assignment.type === 'team' ? <Users className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    {assignment.title}
                  </CardTitle>
                  <CardDescription className="mt-2">{assignment.description}</CardDescription>
                </div>
                <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {assignment.type === 'team' ? 'Team Assignment' : 'Individual Assignment'}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Progress: </span>
                  {assignment.submissions}/{assignment.totalTeams || assignment.totalStudents} submitted
                  <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(assignment.submissions / (assignment.totalTeams || assignment.totalStudents)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {isInstructor && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssignmentManagement;
