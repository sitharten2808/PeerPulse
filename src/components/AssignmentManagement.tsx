import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Team, Assignment, User } from '@/lib/supabase';
import { Plus, Trash2, Edit2, CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface TaskInput {
  assigned_to: string;
  description: string;
  due_date: Date | null;
}

interface Task {
  id: string;
  assignment_id: string;
  assigned_to: string;
  status: string;
  description: string;
  user?: { id: string; name: string; email: string };
}

// Add custom styles for DatePicker
const datePickerStyles = {
  base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  calendar: "bg-white text-popover-foreground border border-border rounded-md shadow-md",
};

export function AssignmentManagement() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assignment form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<TaskInput[]>([]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [editTeam, setEditTeam] = useState('');

  // Add Task to Assignment dialog state
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [addTaskAssignment, setAddTaskAssignment] = useState<Assignment | null>(null);
  const [addTaskMember, setAddTaskMember] = useState('');
  const [addTaskDescription, setAddTaskDescription] = useState('');
  const [addTaskDueDate, setAddTaskDueDate] = useState<Date | null>(null);

  // Tasks for all assignments
  const [assignmentTasks, setAssignmentTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    fetchAssignments();
    fetchTeams();
    fetchAllTasks();
  }, []);

  useEffect(() => {
    if (selectedTeam) fetchTeamMembers(selectedTeam);
    else setTeamMembers([]);
  }, [selectedTeam]);

  useEffect(() => {
    if (editTeam) fetchTeamMembers(editTeam);
  }, [editTeam]);

  useEffect(() => {
    if (addTaskAssignment && addTaskAssignment.team_id) fetchTeamMembers(addTaskAssignment.team_id);
  }, [addTaskAssignment]);

  async function fetchAssignments() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError('Failed to fetch assignments');
    else setAssignments(data || []);
    setLoading(false);
  }

  async function fetchTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    if (!error) setTeams(data || []);
  }

  async function fetchTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select('user:users(id, name, email)')
      .eq('team_id', teamId);
    if (!error) setTeamMembers((data || []).map((m: any) => m.user));
    else setTeamMembers([]);
  }

  async function fetchAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, assignment_id, assigned_to, status, description, due_date, user:users(id, name, email)');
    if (!error && data) {
      const grouped: Record<string, Task[]> = {};
      for (const task of data) {
        const normalizedTask = {
          ...task,
          user: Array.isArray(task.user) ? task.user[0] : task.user
        };
        if (!grouped[task.assignment_id]) grouped[task.assignment_id] = [];
        grouped[task.assignment_id].push(normalizedTask);
      }
      setAssignmentTasks(grouped);
    }
  }

  function handleAddTask() {
    setTasks([...tasks, { assigned_to: '', description: '', due_date: null }]);
  }

  function handleTaskChange(idx: number, field: keyof TaskInput, value: string | Date | null) {
    setTasks(tasks.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }

  function handleRemoveTask(idx: number) {
    setTasks(tasks.filter((_, i) => i !== idx));
  }

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        title,
        description,
        due_date: dueDate ? dueDate.toISOString() : null,
        type: 'team',
        status: 'active',
        allow_late_submissions: false,
        max_files: 1,
        accepted_formats: ['pdf', 'doc', 'docx'],
        team_id: selectedTeam
      })
      .select('*')
      .single();
    if (assignmentError || !assignment) {
      setError('Failed to create assignment');
      setLoading(false);
      return;
    }
    for (const task of tasks) {
      if (task.assigned_to && task.description && task.due_date) {
        await supabase.from('tasks').insert({
          assignment_id: assignment.id,
          assigned_to: task.assigned_to,
          status: 'pending',
          description: task.description,
          due_date: task.due_date.toISOString()
        });
      }
    }
    setShowDialog(false);
    setTitle('');
    setDescription('');
    setDueDate(null);
    setSelectedTeam('');
    setTasks([]);
    fetchAssignments();
    fetchAllTasks();
    setLoading(false);
  }

  function openEditDialog(assignment: Assignment) {
    setEditAssignment(assignment);
    setEditTitle(assignment.title);
    setEditDescription(assignment.description);
    setEditDueDate(assignment.due_date ? new Date(assignment.due_date) : null);
    setEditTeam(assignment.team_id || '');
    setShowEditDialog(true);
  }

  async function handleEditAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!editAssignment) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('assignments')
      .update({
        title: editTitle,
        description: editDescription,
        due_date: editDueDate ? editDueDate.toISOString() : null,
        team_id: editTeam
      })
      .eq('id', editAssignment.id);
    if (error) setError('Failed to update assignment');
    setShowEditDialog(false);
    setEditAssignment(null);
    fetchAssignments();
    setLoading(false);
  }

  async function handleDeleteAssignment(id: string) {
    setLoading(true);
    setError(null);
    await supabase.from('assignments').delete().eq('id', id);
    fetchAssignments();
    fetchAllTasks();
    setLoading(false);
  }

  function openAddTaskDialog(assignment: Assignment) {
    setAddTaskAssignment(assignment);
    setAddTaskMember('');
    setAddTaskDescription('');
    setAddTaskDueDate(null);
    setShowAddTaskDialog(true);
  }

  // Helper to get team name by id
  function getTeamName(teamId: string | undefined) {
    if (!teamId) return 'N/A';
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : teamId;
  }

  async function handleAddTaskToAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!addTaskAssignment) return;
    setLoading(true);
    setError(null);
    await supabase.from('tasks').insert({
      assignment_id: addTaskAssignment.id,
      assigned_to: addTaskMember,
      status: 'pending',
      description: addTaskDescription,
      due_date: addTaskDueDate ? addTaskDueDate.toISOString() : null
    });
    setShowAddTaskDialog(false);
    setAddTaskAssignment(null);
    setAddTaskMember('');
    setAddTaskDescription('');
    setAddTaskDueDate(null);
    fetchAllTasks();
    fetchAssignments();
    setLoading(false);
  }

  // Refetch tasks when add task dialog closes
  React.useEffect(() => {
    if (!showAddTaskDialog) fetchAllTasks();
  }, [showAddTaskDialog]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">Create and manage assignments for your teams</p>
      </div>
      <div className="mb-8">
        <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-1" />Create Assignment</Button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {assignments.map(a => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => openEditDialog(a)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDeleteAssignment(a.id)}><Trash2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => openAddTaskDialog(a)}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{a.description}</p>
              <p className="text-xs text-muted-foreground">Team: {getTeamName(a.team_id)}</p>
              {/* Task List */}
              <div className="mt-4">
                <p className="font-semibold mb-2">Tasks:</p>
                {assignmentTasks[a.id] && assignmentTasks[a.id].length > 0 ? (
                  <ul className="space-y-1">
                    {assignmentTasks[a.id].map(task => (
                      <li key={task.id} className="flex items-center gap-2 text-sm border-b last:border-b-0 py-1">
                        <span className="font-medium">{task.user?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground">- {task.description}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{task.status}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No tasks yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>Fill out the form to create a new assignment and assign tasks to team members.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div>
              <Label>Due Date</Label>
              <div className="relative">
                <DatePicker
                  selected={dueDate}
                  onChange={(date: Date | null) => setDueDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className={cn(datePickerStyles.base)}
                  calendarClassName={datePickerStyles.calendar}
                  placeholderText="Select due date"
                  required
                  popperClassName="z-50"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <Label>Assign to Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tasks</Label>
              {tasks.map((task, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Select value={task.assigned_to} onValueChange={val => handleTaskChange(idx, 'assigned_to', val)} required>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign to member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.name} ({member.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    placeholder="Task description"
                    value={task.description}
                    onChange={e => handleTaskChange(idx, 'description', e.target.value)}
                    required
                  />
                  <div className="relative w-36">
                    <DatePicker
                      selected={task.due_date}
                      onChange={(date: Date | null) => handleTaskChange(idx, 'due_date', date)}
                      dateFormat="MMMM d, yyyy"
                      className={cn(datePickerStyles.base)}
                      calendarClassName={datePickerStyles.calendar}
                      placeholderText="Select due date"
                      required
                      popperClassName="z-50"
                    />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveTask(idx)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="icon" onClick={handleAddTask}><Plus className="w-4 h-4" /></Button>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Create Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Assignment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>Edit the assignment details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAssignment} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} required />
            </div>
            <div>
              <Label>Due Date</Label>
              <div className="relative">
                <DatePicker
                  selected={editDueDate}
                  onChange={(date: Date | null) => setEditDueDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className={cn(datePickerStyles.base)}
                  calendarClassName={datePickerStyles.calendar}
                  placeholderText="Select due date"
                  required
                  popperClassName="z-50"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <Label>Assign to Team</Label>
              <Select value={editTeam} onValueChange={setEditTeam} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Task to Assignment Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task to Assignment</DialogTitle>
            <DialogDescription>Assign a new task to a team member for this assignment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTaskToAssignment} className="space-y-4">
            <div>
              <Label>Assign to Member</Label>
              <Select value={addTaskMember} onValueChange={setAddTaskMember} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name} ({member.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Task Description</Label>
              <Input value={addTaskDescription} onChange={e => setAddTaskDescription(e.target.value)} required />
            </div>
            <div>
              <Label>Due Date</Label>
              <div className="relative">
                <DatePicker
                  selected={addTaskDueDate}
                  onChange={(date: Date | null) => setAddTaskDueDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className={cn(datePickerStyles.base)}
                  calendarClassName={datePickerStyles.calendar}
                  placeholderText="Select due date"
                  required
                  popperClassName="z-50"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 