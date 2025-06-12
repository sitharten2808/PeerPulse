import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Users, Plus, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Task {
  id: number;
  title: string;
  description: string;
  assignedToId: string; // Changed from assignedTo
  status: 'pending' | 'completed';
  submission: {
    date: string;
    content: string;
    attachments: string[];
  } | null;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: 'active' | 'draft' | 'closed';
  submissions: number;
  totalTeams: number;
  tasks: Task[];
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const AssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      title: 'Project Proposal Review',
      description: 'Review and provide feedback on team project proposals',
      dueDate: '2024-06-15',
      assignedTo: 'John Doe',
      status: 'active',
      submissions: 5,
      totalTeams: 8,
      tasks: [
        {
          id: 1,
          title: 'Review Frontend Design',
          description: 'Review and provide feedback on the UI/UX design',
          assignedToId: '1', // Was 'John Doe'
          status: 'completed',
          submission: {
            date: '2024-06-10',
            content: 'The design looks good but needs some improvements in mobile responsiveness.',
            attachments: ['design-review.pdf']
          }
        },
        {
          id: 2,
          title: 'Code Review',
          description: 'Review the implementation code',
          assignedToId: '2', // Was 'Jane Smith'
          status: 'pending',
          submission: null
        }
      ]
    }
  ]);

  const teamMembers: TeamMember[] = [
    { id: 1, name: 'John Doe', role: 'Developer' },
    { id: 2, name: 'Jane Smith', role: 'Designer' },
    { id: 3, name: 'Mike Johnson', role: 'Developer' },
    { id: 4, name: 'Sarah Wilson', role: 'Project Manager' },
  ];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    allowLateSubmissions: false
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedToId: '', // Changed from assignedTo
    dueDate: ''
  });

  // Initialize a counter for unique task IDs
  const [nextTaskId, setNextTaskId] = useState(() => {
    let maxId = 0;
    assignments.forEach(assignment => {
      assignment.tasks.forEach(task => {
        if (task.id > maxId) {
          maxId = task.id;
        }
      });
    });
    return maxId + 1;
  });

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFeedbackSubmit = () => {
    // TODO: Send `feedbackText` to backend here
    console.log("Submitted feedback for task:", selectedAssignment?.id, feedbackText);

    // Close the dialog
    setFeedbackOpen(false);

    // Optional: Reset the textarea
    setFeedbackText("");
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const assignment: Assignment = {
      id: assignments.length + 1,
      ...newAssignment,
      status: 'active',
      submissions: 0,
      totalTeams: 8,
      tasks: []
    };
    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: '', description: '', dueDate: '', assignedTo: '', allowLateSubmissions: false });
    setShowCreateForm(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('selectedAssignment:', selectedAssignment);
    if (!selectedAssignment) return;

    const taskToAdd = {
      id: nextTaskId, // Use the global unique ID
      ...newTask,
      status: 'pending' as const,
      submission: null
    };
    console.log('newTask object:', taskToAdd);
    setNextTaskId(prevId => prevId + 1); // Increment for the next task

    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === selectedAssignment.id) {
        return {
          ...assignment,
          tasks: [...assignment.tasks, taskToAdd]
        };
      }
      return assignment;
    });
    console.log('updatedAssignments array:', updatedAssignments);
    setAssignments(updatedAssignments);
    setNewTask({ title: '', description: '', assignedToId: '', dueDate: '' }); // Changed from assignedTo
    setShowTaskForm(false);
  };

  React.useEffect(() => {
    console.log('assignments state updated:', assignments);
  }, [assignments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Determine if the current user is an instructor
  // Assumes user with id '1' is an instructor.
  // Handles user possibly being null (defaults to non-instructor).
  const isInstructor = user?.id === '1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for your teams</p>
        </div>
        {isInstructor && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
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
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <select
                    id="assignedTo"
                    value={newAssignment.assignedTo}
                    onChange={(e) => setNewAssignment({...newAssignment, assignedTo: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a team member</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-6">
        {assignments.map((assignment) => (
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
                  <Users className="h-4 w-4" />
                  Assigned to: {assignment.assignedTo}
                </div>
              </div>

              {/* Tasks Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  {isInstructor && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Setting selectedAssignment:', assignment);
                            setSelectedAssignment(assignment);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                          <div>
                            <Label htmlFor="taskTitle">Task Title</Label>
                            <Input
                              id="taskTitle"
                              value={newTask.title}
                              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="taskDescription">Description</Label>
                            <Textarea
                              id="taskDescription"
                              value={newTask.description}
                              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="taskAssignedToId">Assign To</Label>
                            <select
                              id="taskAssignedToId"
                              value={newTask.assignedToId} // Changed from assignedTo
                              onChange={(e) => setNewTask({...newTask, assignedToId: e.target.value})} // Changed from assignedTo
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              required
                            >
                              <option value="">Select a team member</option>
                              {teamMembers.map((member) => (
                                <option key={member.id} value={member.id.toString()}> {/* Value is now member.id */}
                                  {member.name} - {member.role}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="taskDueDate">Due Date</Label>
                            <Input
                              id="taskDueDate"
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="submit">Create Task</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-4">
                  {(() => {
                    let tasksToDisplay = assignment.tasks;
                    if (!isInstructor) {
                      // Filter by assignedToId and user.id
                      tasksToDisplay = assignment.tasks.filter(task => task.assignedToId === user?.id);
                    }
                    return tasksToDisplay.map((task) => {
                      // Find team member name for display
                      const assignedMember = teamMembers.find(member => member.id.toString() === task.assignedToId);
                      const assignedName = assignedMember?.name || 'Unknown User';

                      return (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{assignedName}</Badge> {/* Display name */}
                                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                    {task.status}
                                  </Badge>
                                </div>
                              </div>

                              {task.submission && (
                                <div className="flex flex-col items-end gap-2">
                                  {/* View Submission Dialog */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        View Submission
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Task Submission</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Submitted Date</Label>
                                          <p>{new Date(task.submission.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <Label>Content</Label>
                                          <p className="mt-1">{task.submission.content}</p>
                                        </div>
                                        {task.submission.attachments && (
                                          <div>
                                            <Label>Attachments</Label>
                                            <div className="mt-1">
                                              {task.submission.attachments.map((file, index) => (
                                                <Button key={index} variant="link" className="p-0">
                                                  {file}
                                                </Button>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {/* Give Feedback Dialog */}
                                  {isInstructor && ( // Only instructors can give feedback
                                    <Dialog open={feedbackOpen && selectedAssignment?.tasks.find(t => t.id === task.id) != null} onOpenChange={(isOpen) => {
                                      if (isOpen) {
                                        setSelectedAssignment(assignment);
                                      }
                                      setFeedbackOpen(isOpen);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button variant="secondary" size="sm" onClick={() => {
                                        }}>
                                          Give Feedback
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Give Feedback for {task.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor={`feedback-${task.id}`}>Your Feedback</Label>
                                            <textarea
                                              id={`feedback-${task.id}`}
                                              className="w-full text-black p-2 border rounded-md"
                                              rows={4}
                                              placeholder="Write your feedback here..."
                                              value={feedbackText}
                                              onChange={(e) => setFeedbackText(e.target.value)}
                                            ></textarea>
                                          </div>
                                          <div className="flex justify-end">
                                            <Button type="submit" onClick={() => {
                                              console.log("Submitting feedback for specific task:", task.id, feedbackText);
                                              handleFeedbackSubmit();
                                            }}>Submit Feedback</Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
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