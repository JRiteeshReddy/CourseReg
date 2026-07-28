-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    max_seats INTEGER NOT NULL,
    seats INTEGER NOT NULL
);

-- Insert initial courses
INSERT INTO public.courses (id, name, category, max_seats, seats) VALUES
('SP01', 'Basketball', 'Sports', 25, 25),
('SP02', 'Tennis', 'Sports', 25, 25),
('SP03', 'Swimming', 'Sports', 25, 25),
('SP04', 'Football', 'Sports', 25, 25),
('SL01', 'Photography', 'Student Life', 25, 25),
('SL02', 'Music Band', 'Student Life', 25, 25),
('SL03', 'Debate Club', 'Student Life', 25, 25),
('SL04', 'Art Workshop', 'Student Life', 25, 25)
ON CONFLICT (id) DO NOTHING;

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    email TEXT PRIMARY KEY,
    session1_course_id TEXT REFERENCES public.courses(id),
    session2_course_id TEXT REFERENCES public.courses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create RPC function for atomic registration
CREATE OR REPLACE FUNCTION register_course(
    student_email TEXT,
    course_id TEXT,
    session_num INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    course_record public.courses%ROWTYPE;
BEGIN
    -- Start a transaction implicitly
    
    -- Lock the course row for update to prevent concurrent modifications
    SELECT * INTO course_record
    FROM public.courses
    WHERE id = course_id
    FOR UPDATE;

    -- Check if course exists and has seats
    IF NOT FOUND OR course_record.seats <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Decrement the seat count
    UPDATE public.courses
    SET seats = seats - 1
    WHERE id = course_id;

    -- Upsert the registration record
    IF session_num = 1 THEN
        INSERT INTO public.registrations (email, session1_course_id)
        VALUES (student_email, course_id)
        ON CONFLICT (email) 
        DO UPDATE SET session1_course_id = course_id;
    ELSIF session_num = 2 THEN
        INSERT INTO public.registrations (email, session2_course_id)
        VALUES (student_email, course_id)
        ON CONFLICT (email) 
        DO UPDATE SET session2_course_id = course_id;
    ELSE
        RAISE EXCEPTION 'Invalid session number';
    END IF;

    RETURN TRUE;
END;
$$;
