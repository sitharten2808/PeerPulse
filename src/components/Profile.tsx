import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Users, Settings, LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ExtendedUser extends SupabaseUser {
  user_metadata: {
    name: string;
    avatar?: string;
  };
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  joinDate: string;
  studyYear: string;
  major: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
}

interface TeamStats {
  projectsCompleted: number;
  feedbackGiven: number;
  feedbackReceived: number;
  averageRating: number;
  currentTeams: number;
}

export function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: (user as ExtendedUser)?.user_metadata?.name || 'Demo User',
    email: user?.email || 'demo@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Computer Science student passionate about software development and team collaboration.',
    skills: ['React', 'JavaScript', 'Python', 'Node.js', 'MongoDB'],
    joinDate: '2024-01-15',
    studyYear: 'Junior',
    major: 'Computer Science'
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 1, title: 'Team Player', description: 'Received 5+ positive teamwork reviews', icon: Users, earned: true },
    { id: 2, title: 'Communication Expert', description: 'Consistently rated 4.5+ in communication', icon: Mail, earned: true },
    { id: 3, title: 'Project Leader', description: 'Led 3 successful team projects', icon: Award, earned: false },
    { id: 4, title: 'Mentor', description: 'Helped 5+ teammates with their tasks', icon: BookOpen, earned: false }
  ]);

  const [teamStats, setTeamStats] = useState<TeamStats>({
    projectsCompleted: 8,
    feedbackGiven: 24,
    feedbackReceived: 18,
    averageRating: 4.2,
    currentTeams: 3
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your profile and view your achievements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={(user as ExtendedUser)?.user_metadata?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <p className="text-muted-foreground">{profileData.major} • {profileData.studyYear}</p>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Projects Completed</span>
                <Badge variant="outline">{teamStats.projectsCompleted}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feedback Given</span>
                <Badge variant="outline">{teamStats.feedbackGiven}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Rating</span>
                <Badge className="bg-green-100 text-green-800">{teamStats.averageRating}/5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Teams</span>
                <Badge variant="outline">{teamStats.currentTeams}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="flex w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your earned badges and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`border rounded-lg p-4 ${
                          achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <achievement.icon className={`h-6 w-6 ${
                              achievement.earned ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            {achievement.earned && (
                              <Badge className="mt-2 bg-green-100 text-green-800">Earned</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions and feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Activity content would go here */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 