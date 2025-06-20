import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  role: string;
}

interface Feedback {
  id: string;
  content: string;
  rating: number;
  sentiment: string;
  created_at: string;
  from_user: {
    email: string;
  };
  team: {
    name: string;
  };
}

interface Evaluation {
  id: string;
  rating: number;
  comments: string;
  created_at: string;
  submission: {
    assignment: {
      title: string;
    };
  };
}

interface Stats {
  averageRating: number;
  totalFeedback: number;
  totalEvaluations: number;
  teamCount: number;
  submissionsCount: number;
  completionRate: number;
}

interface TeamMember {
  team: {
    id: string;
    name: string;
  };
  role: string;
}

interface FeedbackResponse {
  id: string;
  content: string;
  rating: number;
  sentiment: string;
  created_at: string;
  from_user: {
    email: string;
  };
  team: {
    name: string;
  };
}

export function Profile() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<Stats>({
    averageRating: 0,
    totalFeedback: 0,
    totalEvaluations: 0,
    teamCount: 0,
    submissionsCount: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchFeedback();
      fetchEvaluations();
      fetchSubmissions();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('team:teams(id, name), role')
        .eq('user_id', user?.id);

      if (error) throw error;
      const formattedTeams = (data || []).map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        role: item.role
      }));
      setTeams(formattedTeams);
      setStats(prev => ({ ...prev, teamCount: formattedTeams.length }));
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      // Fetch received feedback
      const { data: received, error: receivedError } = await supabase
        .from('team_feedback')
        .select(`
          id,
          content,
          rating,
          sentiment,
          created_at,
          from_user:from_user_id(email),
          team:team_id(name)
        `)
        .eq('to_user_id', user?.id);

      if (receivedError) throw receivedError;
      
      // Transform the data to match the Feedback interface
      const formattedFeedback = (received || []).map((feedback: any) => ({
        id: feedback.id,
        content: feedback.content,
        rating: feedback.rating,
        sentiment: feedback.sentiment,
        created_at: feedback.created_at,
        from_user: {
          email: feedback.from_user?.email || 'Anonymous'
        },
        team: {
          name: feedback.team?.name || 'Unknown Team'
        }
      })) as Feedback[];
      
      setReceivedFeedback(formattedFeedback);

      // Calculate average rating
      const totalRating = formattedFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = formattedFeedback.length ? totalRating / formattedFeedback.length : 0;

      setStats(prev => ({
        ...prev,
        averageRating,
        totalFeedback: formattedFeedback.length
      }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, submission:submissions(assignment:assignments(title))')
        .eq('evaluator_id', user?.id);

      if (error) throw error;
      setEvaluations(data || []);
      setStats(prev => ({ ...prev, totalEvaluations: data?.length || 0 }));
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      const submissions = data || [];
      setStats(prev => ({
        ...prev,
        submissionsCount: submissions.length,
        completionRate: submissions.filter(s => s.status === 'submitted').length / submissions.length * 100 || 0
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'constructive':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mt-14 mb-2">Profile</h1>
        <p className="text-muted-foreground">View your feedback, evaluations, and team information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl">
                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.user_metadata?.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {teams.map(team => (
                      <Badge key={team.id} variant="secondary">
                        {team.name} • {team.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Rating</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.averageRating.toFixed(1)}/5
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feedback Received</span>
                <Badge variant="outline">{stats.totalFeedback}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Evaluations Given</span>
                <Badge variant="outline">{stats.totalEvaluations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Submissions</span>
                <Badge variant="outline">{stats.submissionsCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <Badge className="bg-green-100 text-green-800">
                  {stats.completionRate.toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="feedback" className="space-y-6">
            <TabsList className="flex w-full">
              <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
              <TabsTrigger value="evaluations" className="flex-1">Evaluations</TabsTrigger>
              <TabsTrigger value="teams" className="flex-1">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback History</CardTitle>
                  <CardDescription>Feedback received from team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {receivedFeedback.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div>
                            {/* <p className="font-medium">{feedback.from_user.email}</p> */}
                            <p className="text-sm text-muted-foreground">
                              {feedback.team.name} • {new Date(feedback.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge
                            variant="outline"
                            className={getSentimentColor(feedback.sentiment)}
                          >
                            {feedback.sentiment === 'positive' && '😊 Positive'}
                            {feedback.sentiment === 'neutral' && '😐 Neutral'}
                            {feedback.sentiment === 'constructive' && '🎯 Constructive'}
                          </Badge>
                        </div>
                        <p className="text-sm">{feedback.content}</p>
                      </div>
                    ))}
                    {receivedFeedback.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No feedback received yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation History</CardTitle>
                  <CardDescription>Evaluations you've provided for submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {evaluations.map((evaluation) => (
                      <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <p className="font-medium">{evaluation.submission.assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(evaluation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= evaluation.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm">{evaluation.comments}</p>
                      </div>
                    ))}
                    {evaluations.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No evaluations provided yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams">
              <Card>
                <CardHeader>
                  <CardTitle>Team Memberships</CardTitle>
                  <CardDescription>Teams you're currently part of</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div key={team.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">Role: {team.role}</p>
                          </div>
                          <Badge variant="secondary">{team.role}</Badge>
                        </div>
                      </div>
                    ))}
                    {teams.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Not part of any teams yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 