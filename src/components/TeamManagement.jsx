
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Crown, Mail, Link2, Shuffle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Alpha Team',
      leader: { id: 1, name: 'John Doe', email: 'john@example.com', avatar: '' },
      members: [
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'member' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: '', role: 'member' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: '', role: 'member' }
      ],
      inviteCode: 'ALPHA2024',
      createdAt: '2024-06-01'
    },
    {
      id: 2,
      name: 'Beta Squad',
      leader: { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', avatar: '' },
      members: [
        { id: 6, name: 'Diana Prince', email: 'diana@example.com', avatar: '', role: 'member' },
        { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', avatar: '', role: 'member' }
      ],
      inviteCode: 'BETA2024',
      createdAt: '2024-06-01'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(null);

  const isInstructor = user?.role === 'instructor' || true; // Demo: assume instructor

  const handleCreateTeam = (e) => {
    e.preventDefault();
    const newTeam = {
      id: teams.length + 1,
      name: newTeamName,
      leader: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      members: [],
      inviteCode: `TEAM${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setShowCreateForm(false);
  };

  const generateInviteLink = (code) => {
    return `${window.location.origin}/join-team/${code}`;
  };

  const copyInviteLink = (code) => {
    navigator.clipboard.writeText(generateInviteLink(code));
    // In a real app, you'd show a toast notification here
    alert('Invite link copied to clipboard!');
  };

  const autoGenerateTeams = () => {
    // Demo: Auto-generate teams logic would go here
    alert('Auto-generate teams feature would randomly assign students to teams');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">Organize and manage student teams</p>
        </div>
        {isInstructor && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={autoGenerateTeams}>
              <Shuffle className="h-4 w-4 mr-2" />
              Auto-Generate
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        )}
      </div>

      {/* Create Team Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
            <CardDescription>Set up a new team for collaboration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Team</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <CardDescription>
                    {team.members.length + 1} members • Created {new Date(team.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(team.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team Leader */}
              <div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarImage src={team.leader.avatar} />
                    <AvatarFallback>{team.leader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team.leader.name}</span>
                      <Badge variant="secondary">
                        <Crown className="h-3 w-3 mr-1" />
                        Leader
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{team.leader.email}</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Team Members</h4>
                {team.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No members yet. Send invites to add members.</p>
                ) : (
                  team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Invite Section */}
              {showInviteModal === team.id && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Invite Members</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value={team.inviteCode} readOnly className="font-mono text-sm" />
                      <Button size="sm" onClick={() => copyInviteLink(team.inviteCode)}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this code or link for others to join the team
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email Invite
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowInviteModal(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
