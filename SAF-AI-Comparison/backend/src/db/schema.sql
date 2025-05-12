-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universities Table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    website_url VARCHAR(255),
    overall_assessment VARCHAR(50) CHECK (overall_assessment IN ('Low', 'Medium', 'High')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs Table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    degree_type VARCHAR(50),
    accreditation_status BOOLEAN DEFAULT true,
    program_url VARCHAR(255),
    description TEXT
);

-- Curriculum Integration Table
CREATE TABLE curriculum_integration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('GIS/RS', 'Biometrics/Modeling', 'Data Science/AI/ML')),
    course_name VARCHAR(255),
    course_type VARCHAR(50) CHECK (course_type IN ('Required', 'Elective')),
    level VARCHAR(50) CHECK (level IN ('Introductory', 'Intermediate', 'Advanced')),
    description TEXT
);

-- Faculty Expertise Table
CREATE TABLE faculty_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255),
    research_area VARCHAR(255),
    expertise_level VARCHAR(50) CHECK (expertise_level IN ('Basic', 'Intermediate', 'Advanced')),
    focus_areas TEXT[]
);

-- Research Centers Table
CREATE TABLE research_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255),
    focus_area VARCHAR(255),
    description TEXT,
    website_url VARCHAR(255)
);

-- Specializations Table
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('Minor', 'Certificate', 'Concentration')),
    description TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_programs_university_id ON programs(university_id);
CREATE INDEX idx_curriculum_program_id ON curriculum_integration(program_id);
CREATE INDEX idx_faculty_university_id ON faculty_expertise(university_id);
CREATE INDEX idx_centers_university_id ON research_centers(university_id);
CREATE INDEX idx_specializations_program_id ON specializations(program_id); 