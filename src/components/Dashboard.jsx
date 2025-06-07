
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Users, Heart, Star, TrendingUp, Calendar, FileText, Upload, UserCheck, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const recentFeedback = [
    { from: 'Anonymous', rating: 5, comment: 'Great communication skills and always helpful!', date: '2 days ago' },
    { from: 'Anonymous', rating: 4, comment: 'Shows strong leadership but could improve on time management.', date: '1 week ago' },
    { from: 'Anonymous', rating: 5, comment: 'Excellent problem-solving abilities and team collaboration.', date: '1 week ago' },
  ];

  const teamHealth = {
    motivation: 85,
    collaboration: 78,
    communication: 92,
    workload: 65
  };

  // New assignment and team data
  const upcomingAssignments = [
    { title: 'Project Proposal Review', dueDate: '2024-06-15', type: 'team' },
    { title: 'Peer Evaluation Round 1', dueDate: '2024-06-20', type: 'individual' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your team feedback overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Heart className="h-8 w-8 text-pulse-purple" />
            </div>
            <p className="text-xs text-success">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Users className="h-8 w-8 text-pulse-blue" />
            </div>
            <p className="text-xs text-muted-foreground">2 assignments pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
            <p className="text-xs text-warning">1 due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Health</p>
                <p className="text-2xl font-bold">80%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <p className="text-xs text-success">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Feedback
            </CardTitle>
            <CardDescription>Feedback you've received from teammates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeedback.map((feedback, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{feedback.from}</Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'fill-warning text-warning' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{feedback.comment}</p>
                <p className="text-xs text-muted-foreground">{feedback.date}</p>
              </div>
            ))}
            <Link to="/feedback">
              <Button variant="outline" className="w-full">
                View All Feedback
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>Assignments due soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssignments.map((assignment, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{assignment.title}</h4>
                  <Badge variant={assignment.type === 'team' ? 'default' : 'secondary'}>
                    {assignment.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            <Link to="/my-assignments">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                View All Assignments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Team Health Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Team Health Overview
          </CardTitle>
          <CardDescription>Current team performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(teamHealth).map(([metric, value]) => (
              <div key={metric}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{metric}</span>
                  <span className="text-sm text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
          <Link to="/team">
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Take Health Check
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with team activities and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/feedback">
              <Button className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <Heart className="h-8 w-8" />
                <span>Give Feedback</span>
                <span className="text-xs opacity-80">Share anonymous feedback</span>
              </Button>
            </Link>
            <Link to="/assignments">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <FileText className="h-8 w-8" />
                <span>Manage Assignments</span>
                <span className="text-xs opacity-80">Create and track assignments</span>
              </Button>
            </Link>
            <Link to="/team-management">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <Users className="h-8 w-8" />
                <span>Manage Teams</span>
                <span className="text-xs opacity-80">Organize student teams</span>
              </Button>
            </Link>
            <Link to="/peer-grading">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <UserCheck className="h-8 w-8" />
                <span>Peer Grading</span>
                <span className="text-xs opacity-80">Rate teammate contributions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
