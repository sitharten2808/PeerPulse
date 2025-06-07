
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, TrendingUp, Users, Calendar, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeamHealth: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState({
    motivation: [7],
    collaboration: [8],
    workload: [6],
    communication: [9],
    satisfaction: [7],
  });

  const { toast } = useToast();

  const questions = [
    {
      id: 'motivation',
      label: 'How motivated have you felt this week?',
      description: 'Rate your personal motivation and energy levels',
    },
    {
      id: 'collaboration',
      label: 'How well is the team collaborating?',
      description: 'Rate team cooperation and working together',
    },
    {
      id: 'workload',
      label: 'How manageable is your current workload?',
      description: 'Rate your work-life balance and stress levels',
    },
    {
      id: 'communication',
      label: 'How clear is team communication?',
      description: 'Rate information sharing and transparency',
    },
    {
      id: 'satisfaction',
      label: 'How satisfied are you with team progress?',
      description: 'Rate overall team performance and achievements',
    },
  ];

  const previousWeeks = [
    { week: 'Week 1', motivation: 85, collaboration: 78, workload: 65, communication: 92, satisfaction: 80 },
    { week: 'Week 2', motivation: 82, collaboration: 85, workload: 70, communication: 88, satisfaction: 85 },
    { week: 'Week 3', motivation: 88, collaboration: 82, workload: 68, communication: 90, satisfaction: 82 },
    { week: 'Current', motivation: 87, collaboration: 88, workload: 72, communication: 94, satisfaction: 88 },
  ];

  const handleSliderChange = (questionId: string, value: number[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Health check submitted!",
      description: "Thank you for your feedback. Results will be compiled anonymously.",
    });
    
    setIsSubmitting(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Attention';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Health Check</h1>
        <p className="text-muted-foreground">
          Weekly pulse survey to track team wellbeing and identify areas for improvement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Weekly Health Survey
              </CardTitle>
              <CardDescription>
                Your responses are anonymous and help improve team dynamics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">{question.label}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Slider
                      value={responses[question.id as keyof typeof responses]}
                      onValueChange={(value) => handleSliderChange(question.id, value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 - Poor</span>
                      <Badge className={getScoreColor(responses[question.id as keyof typeof responses][0])}>
                        {responses[question.id as keyof typeof responses][0]} - {getScoreLabel(responses[question.id as keyof typeof responses][0])}
                      </Badge>
                      <span>10 - Excellent</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Health Check'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Team Trends
              </CardTitle>
              <CardDescription>Progress over the last 4 weeks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previousWeeks.map((week, index) => (
                <div key={week.week} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{week.week}</span>
                    <Badge variant={index === previousWeeks.length - 1 ? "default" : "outline"}>
                      {Math.round((week.motivation + week.collaboration + week.workload + week.communication + week.satisfaction) / 5)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={(week.motivation + week.collaboration + week.workload + week.communication + week.satisfaction) / 5} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+5%</div>
                  <div className="text-xs text-muted-foreground">vs Last Week</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Participation Rate</span>
                  <span className="font-medium">8/8 members</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border rounded-lg bg-muted/50">
                <div className="text-lg font-semibold">Friday, Dec 15</div>
                <div className="text-sm text-muted-foreground">Weekly team health survey</div>
                <Button variant="outline" size="sm" className="mt-3">
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamHealth;
