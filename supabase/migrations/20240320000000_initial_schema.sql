-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('student', 'instructor')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  leader_id uuid references public.users on delete cascade not null,
  invite_code text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_members table
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  role text not null check (role in ('leader', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Create assignments table
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  due_date timestamp with time zone not null,
  type text not null check (type in ('team', 'individual')),
  status text not null check (status in ('active', 'completed', 'cancelled')),
  allow_late_submissions boolean not null default false,
  max_files integer not null default 1,
  accepted_formats text[] not null default array['pdf', 'doc', 'docx'],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create submissions table
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  team_id uuid references public.teams on delete cascade,
  status text not null check (status in ('submitted', 'draft', 'graded')),
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  files text[] not null default array[]::text[],
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feedback table
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions on delete cascade not null,
  reviewer_id uuid references public.users on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comments text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create peer_grading table
create table public.peer_grading (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments on delete cascade not null,
  grader_id uuid references public.users on delete cascade not null,
  graded_user_id uuid references public.users on delete cascade not null,
  scores jsonb not null default '{"communication": 0, "collaboration": 0, "technical": 0, "reliability": 0}'::jsonb,
  comments text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(assignment_id, grader_id, graded_user_id)
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.feedback enable row level security;
alter table public.peer_grading enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Teams policies
create policy "Anyone can view teams"
  on public.teams for select
  using (true);

create policy "Team leaders can create teams"
  on public.teams for insert
  with check (auth.uid() = leader_id);

create policy "Team leaders can update their teams"
  on public.teams for update
  using (auth.uid() = leader_id);

-- Team members policies
create policy "Anyone can view team members"
  on public.team_members for select
  using (true);

create policy "Team leaders can add members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.teams
      where id = team_id and leader_id = auth.uid()
    )
  );

create policy "Team leaders can remove members"
  on public.team_members for delete
  using (
    exists (
      select 1 from public.teams
      where id = team_id and leader_id = auth.uid()
    )
  );

-- Assignments policies
create policy "Instructors can view all assignments"
  on public.assignments for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'instructor'
    )
  );

create policy "Students can view active assignments"
  on public.assignments for select
  using (
    status = 'active' and
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'student'
    )
  );

create policy "Instructors can create assignments"
  on public.assignments for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'instructor'
    )
  );

create policy "Instructors can update assignments"
  on public.assignments for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'instructor'
    )
  );

-- Submissions policies
create policy "Users can view their own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

create policy "Instructors can view all submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'instructor'
    )
  );

create policy "Users can create their own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own submissions"
  on public.submissions for update
  using (auth.uid() = user_id);

-- Feedback policies
create policy "Users can view feedback on their submissions"
  on public.feedback for select
  using (
    exists (
      select 1 from public.submissions
      where id = submission_id and user_id = auth.uid()
    )
  );

create policy "Instructors can view all feedback"
  on public.feedback for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'instructor'
    )
  );

create policy "Users can create feedback"
  on public.feedback for insert
  with check (auth.uid() = reviewer_id);

-- Peer grading policies
create policy "Users can view their peer grades"
  on public.peer_grading for select
  using (auth.uid() = graded_user_id);

create policy "Users can create peer grades"
  on public.peer_grading for insert
  with check (auth.uid() = grader_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 