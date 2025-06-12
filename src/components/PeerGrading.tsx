import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Users, TrendingUp, MessageSquare } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface GradingCriterion {
  id: string;
  label: string;
  weight: number;
}

interface AggregatedScores {
  [key: number]: {
    overall: number;
    scores: {
      [key: string]: number;
    };
    feedbackCount: number;
  };
}

interface Ratings {
  [key: number]: {
    [key: string]: number;
  };
}

interface Feedback {
  [key: number]: string;
}

export function PeerGrading() {
  const [activeTab, setActiveTab] = useState<'grade' | 'results'>('grade');
  const [ratings, setRatings] = useState<Ratings>({});
  const [feedback, setFeedback] = useState<Feedback>({});

  const teamMembers: TeamMember[] = [
    { id: 1, name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'Developer' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', avatar: '', role: 'Designer' },
    { id: 3, name: 'Alice Brown', email: 'alice@example.com', avatar: '', role: 'Product Manager' }
  ];

  const gradingCriteria: GradingCriterion[] = [
    { id: 'communication', label: 'Communication', weight: 20 },
    { id: 'collaboration', label: 'Team Collaboration', weight: 25 },
    { id: 'technical', label: 'Technical Contribution', weight: 30 },
    { id: 'reliability', label: 'Reliability & Timeliness', weight: 25 }
  ];

  const aggregatedScores: AggregatedScores = {
    1: { overall: 4.3, scores: { communication: 4.5, collaboration: 4.2, technical: 4.1, reliability: 4.4 }, feedbackCount: 3 },
    2: { overall: 3.8, scores: { communication: 3.9, collaboration: 4.0, technical: 3.5, reliability: 3.8 }, feedbackCount: 3 },
    3: { overall: 4.6, scores: { communication: 4.8, collaboration: 4.7, technical: 4.4, reliability: 4.5 }, feedbackCount: 3 }
  };

  const handleRatingChange = (memberId: number, criterion: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], [criterion]: rating }
    }));
  };

  const handleFeedbackChange = (memberId: number, text: string) => {
    setFeedback(prev => ({ ...prev, [memberId]: text }));
  };

  const renderStars = (rating: number, onRate: (rating: number) => void, disabled = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onRate(star)}
            disabled={disabled}
            className={`h-5 w-5 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`h-full w-full ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const submitGrading = () => {
    console.log('Submitting grades:', { ratings, feedback });
    alert('Peer grading submitted successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Peer Grading</h1>
        <p className="text-muted-foreground">Evaluate your teammates and view aggregated feedback</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <Button
          variant={activeTab === 'grade' ? 'default' : 'outline'}
          onClick={() => setActiveTab('grade')}
        >
          Grade Teammates
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
        >
          View Results
        </Button>
      </div>

      {activeTab === 'grade' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Grade Your Teammates
              </CardTitle>
              <CardDescription>
                Provide honest feedback to help your team members improve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {teamMembers.map(member => (
                  <div key={member.id} className="border rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {gradingCriteria.map(criterion => (
                        <div key={criterion.id} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{criterion.label}</span>
                            <span className="text-sm text-muted-foreground ml-2">({criterion.weight}%)</span>
                          </div>
                          {renderStars(
                            ratings[member.id]?.[criterion.id] || 0,
                            (rating) => handleRatingChange(member.id, criterion.id, rating)
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-2">
                        Written Feedback (Optional)
                      </label>
                      <Textarea
                        placeholder="Share specific feedback about this team member's contributions..."
                        value={feedback[member.id] || ''}
                        onChange={(e) => handleFeedbackChange(member.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={submitGrading} className="px-8">
                  Submit Peer Grading
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aggregated Peer Scores
              </CardTitle>
              <CardDescription>
                Anonymous feedback from your teammates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamMembers.map(member => {
                  const scores = aggregatedScores[member.id];
                  return (
                    <div key={member.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{scores.overall}/5</div>
                          <div className="text-sm text-muted-foreground">
                            Based on {scores.feedbackCount} reviews
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gradingCriteria.map(criterion => (
                          <div key={criterion.id} className="flex items-center justify-between">
                            <span className="text-sm">{criterion.label}</span>
                            <div className="flex items-center gap-2">
                              {renderStars(scores.scores[criterion.id], () => {}, true)}
                              <span className="text-sm font-medium w-8">
                                {scores.scores[criterion.id]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Anonymous Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-2">
                    "Great communication skills and always willing to help team members understand complex concepts."
                  </p>
                  <Badge variant="outline">For: Jane Smith</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-2">
                    "Excellent technical contributions, but could improve on meeting deadlines."
                  </p>
                  <Badge variant="outline">For: Bob Johnson</Badge>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-2">
                    "Outstanding leadership and project management. Always keeps the team organized and on track."
                  </p>
                  <Badge variant="outline">For: Alice Brown</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 