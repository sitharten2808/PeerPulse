-- Create evaluations table
CREATE TABLE evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, evaluator_id)
);

-- Add RLS policies
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view evaluations
CREATE POLICY "Allow authenticated users to view evaluations"
    ON evaluations FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to create evaluations for other users' submissions
CREATE POLICY "Allow users to create evaluations"
    ON evaluations FOR INSERT
    TO authenticated
    WITH CHECK (
        evaluator_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM submissions s
            WHERE s.id = submission_id
            AND s.user_id != auth.uid()
        )
    );

-- Allow users to update their own evaluations
CREATE POLICY "Allow users to update their own evaluations"
    ON evaluations FOR UPDATE
    TO authenticated
    USING (evaluator_id = auth.uid())
    WITH CHECK (evaluator_id = auth.uid());

-- Allow users to delete their own evaluations
CREATE POLICY "Allow users to delete their own evaluations"
    ON evaluations FOR DELETE
    TO authenticated
    USING (evaluator_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 