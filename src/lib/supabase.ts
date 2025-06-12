import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgieoeiqqbkvysqckocw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaWVvZWlxcWJrdnlzcWNrb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzM5OTYsImV4cCI6MjA2NTE0OTk5Nn0.CrRzWf9NyxZyHO7NL6glVVoyH-609ONUWKLHHoJnqj0'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
})

// Database types
export type User = {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export type Team = {
  id: string
  name: string
  leader_id: string
  invite_code: string
  created_at: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'leader' | 'member'
  joined_at: string
}

export type Assignment = {
  id: string
  title: string
  description: string
  due_date: string
  type: 'team' | 'individual'
  status: 'active' | 'completed' | 'cancelled'
  allow_late_submissions: boolean
  max_files: number
  accepted_formats: string[]
  created_at: string
  team_id?: string
}

export type Submission = {
  id: string
  assignment_id: string
  user_id: string
  team_id?: string
  status: 'submitted' | 'draft' | 'graded'
  submitted_at: string
  files: string[]
  comments?: string
}

export type Feedback = {
  id: string
  submission_id: string
  reviewer_id: string
  rating: number
  comments: string
  created_at: string
}

export type PeerGrading = {
  id: string
  assignment_id: string
  grader_id: string
  graded_user_id: string
  scores: {
    communication: number
    collaboration: number
    technical: number
    reliability: number
  }
  comments: string
  created_at: string
}

// Database queries
export const db = {
  // User queries
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, created_at')
        .eq('id', id)
        .single()
      if (error) {
        console.error('Error fetching user:', error)
        throw error
      }
      return data as User
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, created_at')
      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }
      return data as User[]
    },
    update: async (id: string, updates: Partial<User>) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select('id, email, name, avatar_url, created_at')
        .single()
      if (error) {
        console.error('Error updating user:', error)
        throw error
      }
      return data as User
    }
  },

  // Team queries
  teams: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, leader:users(*), members:team_members(user:users(*))')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, leader:users(*), members:team_members(user:users(*))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    create: async (team: Omit<Team, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single()
      if (error) throw error
      return data as Team
    },
    update: async (id: string, updates: Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Team
    }
  },

  // Assignment queries
  assignments: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Assignment[]
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Assignment
    },
    create: async (assignment: Omit<Assignment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single()
      if (error) throw error
      return data as Assignment
    },
    update: async (id: string, updates: Partial<Assignment>) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Assignment
    }
  },

  // Submission queries
  submissions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*), user:users(*), team:teams(*)')
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data
    },
    getByAssignmentId: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*), user:users(*), team:teams(*)')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data
    },
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*), user:users(*), team:teams(*)')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data
    },
    create: async (submission: Omit<Submission, 'id'>) => {
      const { data, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select()
        .single()
      if (error) throw error
      return data as Submission
    },
    update: async (id: string, updates: Partial<Submission>) => {
      const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Submission
    }
  },

  // Feedback queries
  feedback: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, submission:submissions(*), reviewer:users(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    getBySubmissionId: async (submissionId: string) => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, submission:submissions(*), reviewer:users(*)')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    create: async (feedback: Omit<Feedback, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert(feedback)
        .select()
        .single()
      if (error) throw error
      return data as Feedback
    }
  },

  // Peer grading queries
  peerGrading: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('peer_grading')
        .select('*, assignment:assignments(*), grader:users(*), graded_user:users(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    getByAssignmentId: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from('peer_grading')
        .select('*, assignment:assignments(*), grader:users(*), graded_user:users(*)')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    create: async (grading: Omit<PeerGrading, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('peer_grading')
        .insert(grading)
        .select()
        .single()
      if (error) throw error
      return data as PeerGrading
    }
  }
} 