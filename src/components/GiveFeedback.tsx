import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Star, Heart, Users, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ScrollArea } from '@/components/ui/scroll-area'

type Team = {
  id: string
  name: string
  description: string
}

type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'member'
  user: {
    id: string
    email: string
  }
}

export function GiveFeedback() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({})
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [user])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      // First get all teams where the user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id)

      if (memberError) throw memberError

      if (!memberData || memberData.length === 0) {
        setTeams([])
        setTeamMembers({})
        return
      }

      const teamIds = memberData.map(m => m.team_id)

      // Then get the team details for those teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds)

      if (teamsError) throw teamsError

      setTeams(teamsData || [])

      // Fetch members for each team
      const membersPromises = teamIds.map(teamId =>
        supabase
          .from('team_members')
          .select(`
            id,
            team_id,
            user_id,
            role,
            user:users!team_members_user_id_fkey (
              id,
              email
            )
          `)
          .eq('team_id', teamId)
      )

      const membersResults = await Promise.all(membersPromises)
      const membersData = membersResults.reduce((acc, result) => {
        if (result.error) throw result.error
        const teamId = result.data[0]?.team_id
        if (teamId) {
          acc[teamId] = result.data
        }
        return acc
      }, {})

      setTeamMembers(membersData)
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sentimentOptions = [
    { value: 'positive', label: '😊 Positive', color: 'bg-green-100 text-green-800' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-100 text-gray-800' },
    { value: 'constructive', label: '🎯 Constructive', color: 'bg-blue-100 text-blue-800' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !selectedMember || !rating || !feedback) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          team_id: selectedTeam,
          to_user_id: selectedMember,
          from_user_id: user?.id,
          rating,
          content: feedback,
          sentiment,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Feedback submitted!",
        description: "Your anonymous feedback has been sent successfully.",
      })
      
      // Reset form
      setSelectedTeam('')
      setSelectedMember('')
      setRating(0)
      setFeedback('')
      setSentiment('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="mt-16">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Give Feedback</h1>
        <p className="text-muted-foreground">
          Share anonymous, constructive feedback to help your teammates grow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Anonymous Feedback Form
              </CardTitle>
              <CardDescription>
                Your feedback will be completely anonymous. Be honest and constructive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Select Team *</Label>
                  <ScrollArea className="h-20 w-full rounded-md border p-2">
                    <div className="flex gap-2">
                      {teams.map((team) => (
                        <Badge
                          key={team.id}
                          variant={selectedTeam === team.id ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedTeam(team.id)
                            setSelectedMember('')
                          }}
                        >
                          {team.name}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {selectedTeam && (
                  <div>
                    <Label>Select Team Member *</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teammate to give feedback to" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers[selectedTeam]?.map((member) => (
                          <SelectItem key={member.id} value={member.user_id}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {member.user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{member.user.email}</div>
                                <div className="text-sm text-muted-foreground">{member.role}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Overall Rating *</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground hover:text-warning'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating === 1 && 'Needs Improvement'}
                        {rating === 2 && 'Below Average'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Sentiment</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sentimentOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={sentiment === option.value ? "default" : "outline"}
                        className={`cursor-pointer ${
                          sentiment === option.value ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => setSentiment(sentiment === option.value ? '' : option.value)}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Your Feedback *</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share specific examples and constructive suggestions..."
                    className="mt-2 min-h-[120px]"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Be specific and focus on behaviors rather than personality traits.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Anonymous Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTeam && teamMembers[selectedTeam]?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{member.user.email}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Be specific about behaviors and situations</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Focus on growth and improvement</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Include both strengths and areas for development</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span>Keep it constructive and actionable</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 