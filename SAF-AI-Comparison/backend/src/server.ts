import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Routes
app.get('/api/universities', async (req, res) => {
  try {
    const { name, location, programType, aiReadiness, specialization } = req.query;
    let query = 'SELECT * FROM universities';
    const params: any[] = [];
    const conditions: string[] = [];

    if (name) {
      conditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${name}%`);
    }

    if (location) {
      conditions.push(`location ILIKE $${params.length + 1}`);
      params.push(`%${location}%`);
    }

    if (aiReadiness) {
      conditions.push(`overall_assessment = $${params.length + 1}`);
      params.push(aiReadiness);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/universities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const universityQuery = 'SELECT * FROM universities WHERE id = $1';
    const programsQuery = 'SELECT * FROM programs WHERE university_id = $1';
    const curriculumQuery = `
      SELECT ci.*, p.name as program_name 
      FROM curriculum_integration ci 
      JOIN programs p ON ci.program_id = p.id 
      WHERE p.university_id = $1
    `;
    const facultyQuery = 'SELECT * FROM faculty_expertise WHERE university_id = $1';
    const centersQuery = 'SELECT * FROM research_centers WHERE university_id = $1';
    const specializationsQuery = `
      SELECT s.*, p.name as program_name 
      FROM specializations s 
      JOIN programs p ON s.program_id = p.id 
      WHERE p.university_id = $1
    `;

    const [
      universityResult,
      programsResult,
      curriculumResult,
      facultyResult,
      centersResult,
      specializationsResult,
    ] = await Promise.all([
      pool.query(universityQuery, [id]),
      pool.query(programsQuery, [id]),
      pool.query(curriculumQuery, [id]),
      pool.query(facultyQuery, [id]),
      pool.query(centersQuery, [id]),
      pool.query(specializationsQuery, [id]),
    ]);

    if (universityResult.rows.length === 0) {
      return res.status(404).json({ error: 'University not found' });
    }

    const university = {
      ...universityResult.rows[0],
      programs: programsResult.rows,
      curriculum: curriculumResult.rows,
      faculty: facultyResult.rows,
      centers: centersResult.rows,
      specializations: specializationsResult.rows,
    };

    res.json(university);
  } catch (error) {
    console.error('Error fetching university details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 