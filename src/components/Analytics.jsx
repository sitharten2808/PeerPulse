
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Heart, MessageSquare, BarChart3, Target } from 'lucide-react';

const Analytics = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [radarData, setRadarData] = useState([]);

  // Mock feedback data - in real app, this would come from API
  const mockFeedback = [
    { id: 1, comment: "Great communication skills and always helpful!", rating: 5, category: 'communication', date: '2024-06-01' },
    { id: 2, comment: "Shows strong leadership but could improve on time management.", rating: 4, category: 'leadership', date: '2024-06-02' },
    { id: 3, comment: "Excellent problem-solving abilities and team collaboration.", rating: 5, category: 'teamwork', date: '2024-06-03' },
    { id: 4, comment: "Sometimes late to meetings but contributes great ideas.", rating: 3, category: 'punctuality', date: '2024-06-04' },
    { id: 5, comment: "Very organized and detail-oriented work.", rating: 5, category: 'organization', date: '2024-06-05' },
    { id: 6, comment: "Could be more proactive in team discussions.", rating: 3, category: 'participation', date: '2024-06-06' },
  ];

  // Simple sentiment analysis function
  const analyzeSentiment = (text) => {
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'helpful', 'strong', 'good', 'best', 'outstanding', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'weak', 'could improve', 'late', 'slow', 'difficult'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  // Extract common themes/words
  const extractThemes = (feedback) => {
    const allText = feedback.map(f => f.comment).join(' ').toLowerCase();
    const words = allText.split(/\W+/).filter(word => word.length > 3);
    const wordCount = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  };

  useEffect(() => {
    setFeedbackData(mockFeedback);
    
    // Analyze sentiment
    const sentiments = mockFeedback.map(f => ({
      ...f,
      sentiment: analyzeSentiment(f.comment)
    }));
    
    const sentimentCounts = sentiments.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    setSentimentData([
      { name: 'Positive', value: sentimentCounts.positive || 0, fill: '#22c55e' },
      { name: 'Neutral', value: sentimentCounts.neutral || 0, fill: '#64748b' },
      { name: 'Negative', value: sentimentCounts.negative || 0, fill: '#ef4444' }
    ]);
    
    // Extract themes
    setWordCloudData(extractThemes(mockFeedback));
    
    // Radar chart data
    setRadarData([
      { category: 'Communication', score: 85, fullMark: 100 },
      { category: 'Teamwork', score: 90, fullMark: 100 },
      { category: 'Leadership', score: 75, fullMark: 100 },
      { category: 'Problem Solving', score: 88, fullMark: 100 },
      { category: 'Organization', score: 82, fullMark: 100 },
      { category: 'Participation', score: 70, fullMark: 100 }
    ]);
  }, []);

  const chartConfig = {
    positive: { label: "Positive", color: "#22c55e" },
    neutral: { label: "Neutral", color: "#64748b" },
    negative: { label: "Negative", color: "#ef4444" }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Feedback Analytics</h1>
        <p className="text-muted-foreground">Advanced insights into your team feedback patterns</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{feedbackData.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.2</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Sentiment</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improvement Areas</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sentiment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="themes">Common Themes</TabsTrigger>
          <TabsTrigger value="radar">Skills Radar</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Analysis of feedback sentiment over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-positive)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <CardTitle>Common Themes</CardTitle>
              <CardDescription>Most frequently mentioned topics in feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wordCloudData.map((theme, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{theme.word}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{theme.count} mentions</Badge>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(theme.count / Math.max(...wordCloudData.map(t => t.count))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle>Skills Assessment Radar</CardTitle>
              <CardDescription>Your performance across different skill categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <CardDescription>Your feedback ratings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feedbackData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
