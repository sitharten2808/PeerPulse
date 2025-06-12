import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Plus, Trash2, Edit2, User } from 'lucide-react'

type Feedback = {
  id: string
  content: string
  type: 'praise' | 'suggestion' | 'concern'
  team_id: string
  created_by: string
  created_at: string
}

export function Feedback() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [showCreateFeedback, setShowCreateFeedback] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    content: '',
    type: 'praise' as 'praise' | 'suggestion' | 'concern',
    team_id: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedbacks()
  }, [user])

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedbacks(data || [])
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch feedbacks. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFeedback = async () => {
    if (!newFeedback.content.trim()) {
      toast({
        title: "Error",
        description: "Feedback content is required",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          {
            content: newFeedback.content,
            type: newFeedback.type,
            team_id: newFeedback.team_id,
            created_by: user?.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setFeedbacks(prev => [data, ...prev])
      setShowCreateFeedback(false)
      setNewFeedback({
        content: '',
        type: 'praise',
        team_id: ''
      })
      
      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
      })
    } catch (error) {
      console.error('Error creating feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId)

      if (error) throw error

      setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId))
      toast({
        title: "Success",
        description: "Feedback deleted successfully!",
      })
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="mt-16">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Feedback</h1>
          <p className="text-muted-foreground">
            Share and receive feedback to improve team performance.
          </p>
        </div>
        <Button onClick={() => setShowCreateFeedback(true)}>
          Give Feedback
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{feedback.type}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteFeedback(feedback.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{feedback.content}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Anonymous</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {feedbacks.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Feedback Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Be the first to share feedback with your team.
              </p>
              <Button onClick={() => setShowCreateFeedback(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreateFeedback} onOpenChange={setShowCreateFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Give Feedback</DialogTitle>
            <DialogDescription>
              Share your feedback with the team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Feedback Type</Label>
              <select
                id="type"
                value={newFeedback.type}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, type: e.target.value as 'praise' | 'suggestion' | 'concern' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="praise">Praise</option>
                <option value="suggestion">Suggestion</option>
                <option value="concern">Concern</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Feedback</Label>
              <Input
                id="content"
                value={newFeedback.content}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your feedback"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFeedback(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFeedback}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 