import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart, TrendingUp, Users, Calendar, Heart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'

type Team = {
  id: string;
  name: string;
}

interface TeamHealth {
  motivation: number;
  collaboration: number;
  communication: number;
  workload: number;
}

export function TeamHealth() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responses, setResponses] = useState({
    motivation: [0],
    collaboration: [0],
    workload: [0],
    communication: [0],
    satisfaction: [0],
  })
  const [loading, setLoading] = useState(true)
  const [teamHealthData, setTeamHealthData] = useState<TeamHealth | null>(null)
  const [healthChecks, setHealthChecks] = useState<any[]>([])

  const { toast } = useToast()

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
  ]

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('team:teams(id, name)')
          .eq('user_id', user?.id);

        if (error) throw error;
        const userTeams = (data || []).map((item: any) => item.team);
        setTeams(userTeams);
        if (userTeams.length > 0) {
          setSelectedTeam(userTeams[0].id);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeams();
    }
  }, [user]);

  useEffect(() => {
    const fetchTeamHealthData = async () => {
      if (!selectedTeam) return;
      try {
        const { data, error } = await supabase
          .from('team_health_checks')
          .select('motivation, collaboration, communication, workload')
          .eq('team_id', selectedTeam)
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
  }, [selectedTeam]);

  const handleSliderChange = (questionId: string, value: number[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team first",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('team_health_checks')
        .insert([
          {
            team_id: selectedTeam,
            user_id: user?.id,
            motivation: responses.motivation[0],
            collaboration: responses.collaboration[0],
            workload: responses.workload[0],
            communication: responses.communication[0],
            satisfaction: responses.satisfaction[0]
          }
        ])

      if (error) throw error

      toast({
        title: "Health check submitted!",
        description: "Thank you for your feedback. Results will be compiled anonymously.",
      })
    } catch (error) {
      console.error('Error submitting health check:', error)
      toast({
        title: "Error",
        description: "Failed to submit health check. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent'
    if (score >= 7) return 'Good'
    if (score >= 5) return 'Average'
    return 'Needs Attention'
  }

  // Prepare radar data for team health
  const radarData = [
    { category: 'Motivation', score: teamHealthData?.motivation || 0, fullMark: 100 },
    { category: 'Collaboration', score: teamHealthData?.collaboration || 0, fullMark: 100 },
    { category: 'Communication', score: teamHealthData?.communication || 0, fullMark: 100 },
    { category: 'Workload', score: teamHealthData?.workload || 0, fullMark: 100 }
  ];

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-14">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Health Check</h1>
          <p className="text-muted-foreground">
            Weekly pulse survey to track team wellbeing and identify areas for improvement.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => navigate('/teams')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Team
          </Button>
        </div>
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
                disabled={isSubmitting || !selectedTeam}
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
                Team Health Analytics
              </CardTitle>
              <CardDescription>Detailed breakdown of team health metrics</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Health Radar
              </CardTitle>
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
  )
}
