import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Users, Heart, Star, TrendingUp, Calendar, FileText, Upload, UserCheck, ClipboardList, BarChart3, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/EmptyState';

interface ExtendedUser extends SupabaseUser {
  user_metadata: {
    name: string;
  };
}

type Task = {
  id: string;
  title: string;
  due_date: string;
  status: string;
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
  role: string;
  avatar_url?: string;
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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
          .limit(3);

        if (feedbackError) throw feedbackError;
        setRecentFeedback(feedbackData?.map(f => ({
          id: f.id,
          content: f.content,
          rating: f.rating,
          sentiment: f.sentiment,
          created_at: f.created_at,
          team: { name: f.teams.name }
        })));

        // Fetch upcoming tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user?.id)
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true })
          .limit(3)

        if (tasksError) throw tasksError;
        setUpcomingTasks(tasksData || []);

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select(`
            id,
            user:users!team_members_user_id_fkey(
              id,
              name,
              role,
              avatar_url
            )
          `)
          .eq('team_id', (user as any)?.team_id)

        if (teamError) throw teamError;
        setTeamMembers(teamData?.map(member => ({
          id: member.user[0].id,
          name: member.user[0].name,
          role: member.user[0].role,
          avatar_url: member.user[0].avatar_url
        })) || []);

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

  const teamHealth: TeamHealth = {
    motivation: 85,
    collaboration: 78,
    communication: 92,
    workload: 65
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/assignments">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                </div>
                <FileText className="h-8 w-8 text-pulse-purple" />
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
                {recentFeedback.map((feedback) => (
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
                  <div key={task.id} className="border-b pb-4">
                    <p className="font-medium">{task.title}</p>
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
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Team Members"
                description="You haven't been added to any team yet. Team members will appear here when you're added to a team."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 