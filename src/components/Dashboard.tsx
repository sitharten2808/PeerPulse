
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Users, Heart, Star, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
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
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <Star className="h-8 w-8 text-warning" />
            </div>
            <p className="text-xs text-success">+0.3 from last month</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Users className="h-8 w-8 text-pulse-blue" />
            </div>
            <p className="text-xs text-muted-foreground">No change</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Team Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Team Health Overview
            </CardTitle>
            <CardDescription>Current team performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(teamHealth).map(([metric, value]) => (
              <div key={metric}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{metric}</span>
                  <span className="text-sm text-muted-foreground">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
            <Link to="/team">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Take Health Check
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with team activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/feedback">
              <Button className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <Heart className="h-8 w-8" />
                <span>Give Feedback</span>
                <span className="text-xs opacity-80">Share anonymous feedback with teammates</span>
              </Button>
            </Link>
            <Link to="/team">
              <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
                <Users className="h-8 w-8" />
                <span>Team Health Check</span>
                <span className="text-xs opacity-80">Quick pulse survey for the team</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto p-6 flex flex-col items-center gap-2">
              <BarChart className="h-8 w-8" />
              <span>View Insights</span>
              <span className="text-xs opacity-80">Detailed analytics and trends</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
