import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Heart, Star, TrendingUp, Calendar, FileText, Upload, UserCheck, ClipboardList, BarChart3, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as BarChartIcon } from 'lucide-react';
import { SubmissionDialog } from '@/components/SubmissionDialog';

interface ExtendedUser extends SupabaseUser {
  user_metadata: {
    name: string;
  };
}

type Task = {
  id: string;
  assignment_id: string;
  due_date: string;
  status: string;
  description: string;
  assigned_to: string;
};

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: string;
  submissions: number;
  totalTeams: number;
  tasks: Task[];
}

type Feedback = {
  id: string;
  content: string;
  rating: number;
  sentiment: string;
  created_at: string;
  team: {
    name: string;
  };
};

interface TeamHealth {
  motivation: number;
  collaboration: number;
  communication: number;
  workload: number;
}

interface TimeRemaining {
  isOverdue: boolean;
  text: string;
}

type TeamMember = {
  id: string;
  name: string;
  description: string;
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamHealthData, setTeamHealthData] = useState<TeamHealth | null>(null);

  useEffect(() => {
    
    const fetchDashboardData = async () => {
      try {
        // Fetch recent feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('team_feedback')
          .select(`
            id,
            content,
            rating,
            sentiment,
            created_at,
            teams!team_feedback_team_id_fkey (
              name
            )
          `)
          .eq('to_user_id', user?.id)
          .order('created_at', { ascending: false })
          // .limit(3);

        if (feedbackError) throw feedbackError;
        setRecentFeedback(feedbackData?.map(f => ({
          id: f.id,
          content: f.content,
          rating: f.rating,
          sentiment: f.sentiment,
          created_at: f.created_at,
          team: { name: f.teams.name}
        })));
        

        // Fetch upcoming tasks
        

        const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, assignment_id, due_date, status, description, assigned_to')
        .eq('assigned_to', user?.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });
      
      

        if (tasksError) throw tasksError;
        console.log("Fetched tasks data:", tasksData);
console.log("Fetch tasks error:", tasksError);
console.log("Setting upcoming tasks", tasksData);

setUpcomingTasks(tasksData || []);

// Fetch assignments for mapping assignment_id to title
const { data: assignmentsData, error: assignmentsError } = await supabase
  .from('assignments')
  .select('id, title');
const map: Record<string, string> = {};
(assignmentsData || []).forEach((a: any) => {
  map[a.id] = a.title;
});
setAssignmentMap(map);

        
        // Fetch team members
        if ((user as any)?.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('team_members')
            .select(`
              id,
              user:users!team_members_user_id_fkey(
                id,
                name
              )
            `)
            .eq('team_id', (user as any).team_id);
          if (teamError) throw teamError;
          setTeamMembers(((teamData || []).filter((member: any) => member.user).map((member: any) => ({
            id: member.user.id,
            name: member.user.name
          })) as TeamMember[]));
        } else {
          setTeamMembers([]);
        }

        // Fetch user's teams
        const fetchTeams = async () => {
          const { data, error } = await supabase
            .from('team_members')
            .select('team:teams(id, name)')
            .eq('user_id', user?.id);
          if (!error && data) {
            const userTeams = data.map((tm: any) => tm.team);
            setTeams(userTeams);
            if (userTeams.length > 0) setSelectedTeamId(userTeams[0].id);
          }
        };
        if (user) fetchTeams();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const fetchTeamHealthData = async () => {
      if (!selectedTeamId) return;
      try {
        const { data, error } = await supabase
          .from('team_health_checks')
          .select('motivation, collaboration, communication, workload')
          .eq('team_id', selectedTeamId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          // Calculate averages and multiply by 10, rounded to 1 decimal place
          const avg = (key: keyof typeof data[0]) =>
            Math.round(((data.reduce((acc, curr) => acc + (curr[key] || 0), 0) / data.length) * 10) * 10) / 10;

          setTeamHealthData({
            motivation: avg('motivation'),
            collaboration: avg('collaboration'),
            communication: avg('communication'),
            workload: avg('workload'),
          });
        } else {
          setTeamHealthData(null);
        }
      } catch (error) {
        console.error('Error fetching team health data:', error);
      }
    };
    fetchTeamHealthData();
  }, [selectedTeamId]);

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

  // Calculate feedback analytics
  const totalFeedback = recentFeedback.length;
  const avgRating = totalFeedback > 0 ? (recentFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2) : 'N/A';
  const positiveCount = recentFeedback.filter(f => f.sentiment === 'positive').length;
  const neutralCount = recentFeedback.filter(f => f.sentiment === 'neutral').length;
  const constructiveCount = recentFeedback.filter(f => f.sentiment === 'constructive').length;

  // Prepare sentiment data for the chart
  const sentimentData = [
    { name: 'Positive', value: positiveCount, fill: '#22c55e' },
    { name: 'Neutral', value: neutralCount, fill: '#64748b' },
    { name: 'Constructive', value: constructiveCount, fill: '#eab308' }
  ];
  // Prepare radar data for team health
  const radarData = [
    { category: 'Motivation', score: teamHealthData?.motivation || 0, fullMark: 100 },
    { category: 'Collaboration', score: teamHealthData?.collaboration || 0, fullMark: 100 },
    { category: 'Communication', score: teamHealthData?.communication || 0, fullMark: 100 },
    { category: 'Workload', score: teamHealthData?.workload || 0, fullMark: 100 }
  ];

  const handleTaskSubmit = (task: Task) => {
    setSelectedTask(task);
    setShowSubmitDialog(true);
  };

  const handleSubmissionSuccess = () => {
    // Refresh tasks after successful submission
    fetchDashboardData();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Quick Actions
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/assignments">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                </div>
                <BarChartIcon className="h-8 w-8 text-pulse-purple" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/team">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-pulse-blue" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/feedback">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Feedback</p>
                  <p className="text-2xl font-bold">{recentFeedback.length}</p>
                </div>
                <Heart className="h-8 w-8 text-pulse-red" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/submissions">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Upload className="h-8 w-8 text-pulse-green" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div> */}
      
      {/* Feedback Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium text-muted-foreground">Positive Feedback</p>
              <p className="text-2xl font-bold text-green-600">{positiveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium text-muted-foreground">Neutral Feedback</p>
              <p className="text-2xl font-bold text-blue-600">{neutralCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium text-muted-foreground">Constructive Feedback</p>
              <p className="text-2xl font-bold text-yellow-600">{constructiveCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Health Analytics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Health Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length > 0 && (
            <select
              value={selectedTeamId || ''}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="mb-4 p-2 border rounded dark:bg-black dark:text-white bg-white text-black"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Motivation</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${teamHealthData?.motivation || 0}%` }}></div>
              </div>
              <p className="text-xs">{teamHealthData?.motivation || 0}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Collaboration</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${teamHealthData?.collaboration || 0}%` }}></div>
              </div>
              <p className="text-xs">{teamHealthData?.collaboration || 0}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Communication</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${teamHealthData?.communication || 0}%` }}></div>
              </div>
              <p className="text-xs">{teamHealthData?.communication || 0}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workload</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${teamHealthData?.workload || 0}%` }}></div>
              </div>
              <p className="text-xs">{teamHealthData?.workload || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Analysis of feedback sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Team Health Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Health Radar</CardTitle>
            <CardDescription>Visual overview of team health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Team Health" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {recentFeedback.slice(0, 5).map((feedback) => (
                  <div key={feedback.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{feedback.team.name}</Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {feedback.sentiment && (
                        <Badge
                          variant="secondary"
                          className={`${
                            feedback.sentiment === 'positive'
                              ? 'bg-green-100 text-green-800'
                              : feedback.sentiment === 'constructive'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {feedback.sentiment === 'positive' && '😊 Positive'}
                          {feedback.sentiment === 'neutral' && '😐 Neutral'}
                          {feedback.sentiment === 'constructive' && '🎯 Constructive'}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{feedback.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Feedback Yet"
                description="You haven't received any feedback yet. Feedback will appear here when your team members provide it."
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="border-b pb-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.description}</p>
                      <p className="text-xs text-muted-foreground">Assignment: {assignmentMap[task.assignment_id] || 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleTaskSubmit(task)}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Upcoming Tasks"
                description="You don't have any upcoming tasks. Tasks will appear here when they are assigned to you."
              />
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length > 0 ? (
              <ul>
                {teams.map(team => (
                  <li key={team.id} className="py-2 border-b">{team.name}</li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No Teams"
                description="You are not a member of any team yet."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Dialog */}
      {selectedTask && (
        <SubmissionDialog
          isOpen={showSubmitDialog}
          onClose={() => {
            setShowSubmitDialog(false);
            setSelectedTask(null);
          }}
          assignmentId={selectedTask.assignment_id}
          taskId={selectedTask.id}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
} 