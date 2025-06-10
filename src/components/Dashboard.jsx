import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Users, Heart, Star, TrendingUp, Calendar, FileText, Upload, UserCheck, ClipboardList, BarChart3, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockAssignments = [
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
            assignedTo: 'John Doe',
            status: 'pending',
            dueDate: '2024-06-20',
            submission: null
          },
          {
            id: 2,
            title: 'Code Review',
            description: 'Review the implementation code',
            assignedTo: 'Jane Smith',
            status: 'pending',
            dueDate: '2024-06-25',
            submission: null
          }
        ]
      }
    ];

    // Get all tasks assigned to the current user
    const userTasks = mockAssignments.flatMap(assignment => 
      assignment.tasks.filter(task => task.assignedTo === user?.name)
    );

    // Sort tasks by due date
    const sortedTasks = userTasks.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    setUpcomingTasks(sortedTasks);
  }, [user]);

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

  const getTimeRemaining = (dueDate) => {
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

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Your upcoming tasks and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task) => {
              const timeRemaining = getTimeRemaining(task.dueDate);
              return (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={timeRemaining.isOverdue ? 'destructive' : 'outline'}>
                      {timeRemaining.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            <Link to="/my-assignments">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                View All Tasks
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            {Object.entries(teamHealth).map(([metric, value]) => (
              <div key={metric}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{metric}</span>
                  <span className="text-sm text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} className="h-2 mb-2" />
              </div>
            ))}
          </div>
          <Link to="/team">
            <Button variant="outline" className="w-full mt-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/feedback">
              <Button variant='outline' className="w-full h-auto p-6  flex flex-col items-center gap-2">
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
            <Link to="/analytics">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                <span>Analytics</span>
                <span className="text-xs opacity-80">View feedback insights</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <User className="h-8 w-8" />
                <span>Profile</span>
                <span className="text-xs opacity-80">Manage your profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
