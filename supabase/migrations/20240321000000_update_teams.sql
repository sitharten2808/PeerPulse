-- Drop existing tables if they exist
drop table if exists public.team_members;
drop table if exists public.teams;

-- Create teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references public.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create team_members table
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  role text not null check (role in ('admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Create policies for teams table
create policy "Anyone can view teams"
  on public.teams for select
  using (true);

create policy "Authenticated users can create teams"
  on public.teams for insert
  with check (auth.uid() is not null);

create policy "Team creators can update their teams"
  on public.teams for update
  using (auth.uid() = created_by);

create policy "Team creators can delete their teams"
  on public.teams for delete
  using (auth.uid() = created_by);

-- Create policies for team_members table
create policy "Anyone can view team members"
  on public.team_members for select
  using (true);

create policy "Team creators can add members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.teams
      where id = team_members.team_id and created_by = auth.uid()
    )
  );

create policy "Team admins can add members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_id = team_members.team_id and user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Team admins can remove members"
  on public.team_members for delete
  using (
    exists (
      select 1 from public.team_members
      where team_id = team_members.team_id and user_id = auth.uid() and role = 'admin'
    )
  );

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  updated_at timestamp with time zone,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create function to handle new user
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, updated_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to call function on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 