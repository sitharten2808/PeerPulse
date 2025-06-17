-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create teams table
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Create assignments table
CREATE TABLE public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('team', 'individual')),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    allow_late_submissions BOOLEAN NOT NULL DEFAULT false,
    max_files INTEGER NOT NULL DEFAULT 1,
    accepted_formats TEXT[] NOT NULL DEFAULT ARRAY['pdf', 'doc', 'docx'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'draft', 'graded')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    files TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create peer_grading table
CREATE TABLE public.peer_grading (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments ON DELETE CASCADE NOT NULL,
    grader_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    graded_user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    scores JSONB NOT NULL DEFAULT '{"communication": 0, "collaboration": 0, "technical": 0, "reliability": 0}'::JSONB,
    comments TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(assignment_id, grader_id, graded_user_id)
);

-- Create team_health_checks table
CREATE TABLE public.team_health_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
    motivation INTEGER NOT NULL CHECK (motivation >= 0 AND motivation <= 100),
    collaboration INTEGER NOT NULL CHECK (collaboration >= 0 AND collaboration <= 100),
    communication INTEGER NOT NULL CHECK (communication >= 0 AND communication <= 100),
    workload INTEGER NOT NULL CHECK (workload >= 0 AND workload <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, user_id, created_at::date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_grading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_health_checks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Anyone can view teams"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team creators can update their teams"
    ON public.teams FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams"
    ON public.teams FOR DELETE
    USING (auth.uid() = created_by);

-- Team members policies
CREATE POLICY "Anyone can view team members"
    ON public.team_members FOR SELECT
    USING (true);

CREATE POLICY "Team creators can add members"
    ON public.team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE id = team_members.team_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Team admins can add members"
    ON public.team_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Team admins can remove members"
    ON public.team_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Assignments policies
CREATE POLICY "Anyone can view assignments"
    ON public.assignments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create assignments"
    ON public.assignments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Assignment creators can update assignments"
    ON public.assignments FOR UPDATE
    USING (auth.uid() = created_by);

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Team members can view team submissions"
    ON public.submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = submissions.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
    ON public.submissions FOR UPDATE
    USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view feedback on their submissions"
    ON public.feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions
            WHERE id = submission_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Peer grading policies
CREATE POLICY "Users can view their peer grades"
    ON public.peer_grading FOR SELECT
    USING (auth.uid() = graded_user_id);

CREATE POLICY "Users can create peer grades"
    ON public.peer_grading FOR INSERT
    WITH CHECK (auth.uid() = grader_id);

-- Team health checks policies
CREATE POLICY "Team members can view team health checks"
    ON public.team_health_checks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_health_checks.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create team health checks"
    ON public.team_health_checks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_grading_updated_at
    BEFORE UPDATE ON peer_grading
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();