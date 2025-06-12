import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Plus, Trash2, Edit2, UserPlus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Team = {
  id: string
  name: string
  description: string
  created_at: string
  created_by: string
}

type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'member'
  user: {
    id: string
    email: string
    user_metadata: {
      name: string
      avatar_url?: string
    }
  }
}

type PendingMember = {
  email: string
  role: 'admin' | 'member'
}

export function TeamManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({})
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showEditTeam, setShowEditTeam] = useState<Team | null>(null)
  const [showAddMember, setShowAddMember] = useState<string | null>(null)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showViewMembers, setShowViewMembers] = useState<string | null>(null)

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

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive"
      })
      return
    }

    try {
      // First create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          {
            name: newTeam.name,
            description: newTeam.description,
            created_by: user?.id
          }
        ])
        .select()
        .single()

      if (teamError) throw teamError

      // Add the creator as an admin member
      const { error: creatorError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user?.id,
          role: 'admin'
        })

      if (creatorError) {
        await supabase
          .from('teams')
          .delete()
          .eq('id', teamData.id)
        throw creatorError
      }

      // Add all pending members
      for (const member of pendingMembers) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', member.email)
          .single()

        if (userData) {
          await supabase
            .from('team_members')
            .insert({
              team_id: teamData.id,
              user_id: userData.id,
              role: member.role
            })
        }
      }

      // Refresh the teams list
      await fetchTeams()
      
      setShowCreateTeam(false)
      setNewTeam({ name: '', description: '' })
      setPendingMembers([])
      
      toast({
        title: "Success",
        description: "Team created successfully!",
      })
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create team. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTeam = async (team: Team) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          description: team.description
        })
        .eq('id', team.id)

      if (error) throw error

      await fetchTeams()
      setShowEditTeam(null)
      
      toast({
        title: "Success",
        description: "Team updated successfully!",
      })
    } catch (error) {
      console.error('Error updating team:', error)
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      await fetchTeams()
      toast({
        title: "Success",
        description: "Team deleted successfully!",
      })
    } catch (error) {
      console.error('Error deleting team:', error)
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAddPendingMember = () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }

    // Check if email is already in pending members
    if (pendingMembers.some(m => m.email === newMemberEmail)) {
      toast({
        title: "Error",
        description: "This email is already in the list",
        variant: "destructive"
      })
      return
    }

    setPendingMembers([...pendingMembers, { email: newMemberEmail, role: 'member' }])
    setNewMemberEmail('')
  }

  const handleRemovePendingMember = (email: string) => {
    setPendingMembers(pendingMembers.filter(m => m.email !== email))
  }

  const handleTogglePendingMemberRole = (email: string) => {
    setPendingMembers(pendingMembers.map(m => 
      m.email === email 
        ? { ...m, role: m.role === 'admin' ? 'member' : 'admin' }
        : m
    ))
  }

  const handleAddMember = async (teamId: string) => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }
  
    try {
      // Check if current user is an admin of the team
      const { data: currentUserRole, error: roleError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user?.id)
        .single()
  
      if (roleError || !currentUserRole || currentUserRole.role !== 'admin') {
        toast({
          title: "Error",
          description: "Only team admins can add members.",
          variant: "destructive"
        })
        return
      }
  
      // Get the user by email using the users table (not profiles)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', newMemberEmail)
        .single()
  
      if (userError || !userData) {
        toast({
          title: "Error",
          description: "User not found. Please check the email address.",
          variant: "destructive"
        })
        return
      }
  
      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userData.id)
        .single()
  
      if (existingMember) {
        toast({
          title: "Error",
          description: "User is already a member of this team.",
          variant: "destructive"
        })
        return
      }
  
      // Add the user as a team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userData.id,
          role: 'member'
        })
  
      if (memberError) throw memberError
  
      await fetchTeams()
      setShowAddMember(null)
      setNewMemberEmail('')
      
      toast({
        title: "Success",
        description: "Member added successfully!",
      })
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      // Check if current user is an admin of the team
      const { data: currentUserRole, error: roleError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user?.id)
        .single()

      if (roleError || !currentUserRole || currentUserRole.role !== 'admin') {
        toast({
          title: "Error",
          description: "Only team admins can remove members.",
          variant: "destructive"
        })
        return
      }

      // Don't allow removing the last admin
      const { count: adminCount, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('role', 'admin')

      if (countError) throw countError

      if (adminCount === 1) {
        const { data: memberToRemove, error: memberError } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', userId)
          .single()

        if (memberError) throw memberError

        if (memberToRemove.role === 'admin') {
          toast({
            title: "Error",
            description: "Cannot remove the last admin of the team.",
            variant: "destructive"
          })
          return
        }
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      await fetchTeams()
      toast({
        title: "Success",
        description: "Member removed successfully!",
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="mt-24">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamMembers[team.id]?.length || 0} members
                  </Badge>
                  {teamMembers[team.id]?.find(m => m.user_id === user?.id)?.role === 'admin' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEditTeam(team)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMember(team.id)}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowViewMembers(team.id)}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Members
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team and add members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter team description"
              />
            </div>
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member's email"
                />
                <Button onClick={handleAddPendingMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {pendingMembers.map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{member.email}</span>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => handleTogglePendingMemberRole(member.email)}
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemovePendingMember(member.email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!showEditTeam} onOpenChange={() => setShowEditTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={showEditTeam?.name || ''}
                onChange={(e) => setShowEditTeam(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={showEditTeam?.description || ''}
                onChange={(e) => setShowEditTeam(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Enter team description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTeam(null)}>
              Cancel
            </Button>
            <Button onClick={() => showEditTeam && handleUpdateTeam(showEditTeam)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={!!showAddMember} onOpenChange={() => setShowAddMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to the team by their email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter member's email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(null)}>
              Cancel
            </Button>
            <Button onClick={() => showAddMember && handleAddMember(showAddMember)}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={!!showViewMembers} onOpenChange={() => setShowViewMembers(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Members</DialogTitle>
            <DialogDescription>
              View and manage team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {showViewMembers && teamMembers[showViewMembers]?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {member.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{member.role}</Badge>
                  {teamMembers[showViewMembers]?.find(m => m.user_id === user?.id)?.role === 'admin' && 
                   member.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(showViewMembers, member.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 