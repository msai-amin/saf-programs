import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

interface UniversityData {
  name: string;
  location: string;
  website: string;
  aiReadiness: 'Low' | 'Medium' | 'High';
  programs: {
    name: string;
    type: string;
    description: string;
  }[];
  curriculum: {
    gis: {
      courses: string[];
      level: string;
    };
    modeling: {
      courses: string[];
      level: string;
    };
    dataScience: {
      courses: string[];
      level: string;
    };
  };
  faculty: {
    name: string;
    expertise: string[];
    research: string[];
  }[];
  centers: {
    name: string;
    focus: string;
    description: string;
  }[];
  specializations: {
    name: string;
    type: string;
    description: string;
  }[];
}

async function processUniversityFile(filePath: string): Promise<UniversityData> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const root = parse(content);
  
  // Extract data from the HTML content
  // This is a simplified example - you'll need to adjust the selectors based on your actual file structure
  const name = root.querySelector('.university-name')?.text || '';
  const location = root.querySelector('.university-location')?.text || '';
  const website = root.querySelector('.university-website')?.text || '';
  
  // Extract other data...
  // This is where you'll need to implement the specific parsing logic for your files
  
  return {
    name,
    location,
    website,
    aiReadiness: 'Medium', // Default value, should be extracted from file
    programs: [],
    curriculum: {
      gis: { courses: [], level: 'Introductory' },
      modeling: { courses: [], level: 'Introductory' },
      dataScience: { courses: [], level: 'Introductory' },
    },
    faculty: [],
    centers: [],
    specializations: [],
  };
}

async function insertUniversityData(data: UniversityData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert university
    const universityResult = await client.query(
      'INSERT INTO universities (name, location, website_url, overall_assessment) VALUES ($1, $2, $3, $4) RETURNING id',
      [data.name, data.location, data.website, data.aiReadiness]
    );
    const universityId = universityResult.rows[0].id;
    
    // Insert programs
    for (const program of data.programs) {
      const programResult = await client.query(
        'INSERT INTO programs (university_id, name, degree_type, description) VALUES ($1, $2, $3, $4) RETURNING id',
        [universityId, program.name, program.type, program.description]
      );
      const programId = programResult.rows[0].id;
      
      // Insert curriculum integration
      for (const [category, courses] of Object.entries(data.curriculum)) {
        for (const course of courses.courses) {
          await client.query(
            'INSERT INTO curriculum_integration (program_id, category, course_name, level) VALUES ($1, $2, $3, $4)',
            [programId, category, course, courses.level]
          );
        }
      }
      
      // Insert specializations
      for (const spec of data.specializations) {
        await client.query(
          'INSERT INTO specializations (program_id, name, type, description) VALUES ($1, $2, $3, $4)',
          [programId, spec.name, spec.type, spec.description]
        );
      }
    }
    
    // Insert faculty
    for (const faculty of data.faculty) {
      await client.query(
        'INSERT INTO faculty_expertise (university_id, name, research_area, expertise_level, focus_areas) VALUES ($1, $2, $3, $4, $5)',
        [universityId, faculty.name, faculty.expertise.join(', '), 'Advanced', faculty.research]
      );
    }
    
    // Insert research centers
    for (const center of data.centers) {
      await client.query(
        'INSERT INTO research_centers (university_id, name, focus_area, description) VALUES ($1, $2, $3, $4)',
        [universityId, center.name, center.focus, center.description]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const dataDir = path.join(__dirname, '../../../data');
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.docx'));
  
  for (const file of files) {
    try {
      console.log(`Processing ${file}...`);
      const data = await processUniversityFile(path.join(dataDir, file));
      await insertUniversityData(data);
      console.log(`Successfully processed ${file}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  await pool.end();
}

main().catch(console.error); 