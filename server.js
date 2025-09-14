const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sis_db',
  password: '12345678',
  port: 5432
});

// ---------------- STUDENTS ----------------
app.get('/students', async (req, res) => {
  const result = await pool.query('SELECT * FROM students ORDER BY id');
  res.json(result.rows);
});

app.post('/students', async (req, res) => {
  const { name, email } = req.body;
  const result = await pool.query(
    'INSERT INTO students(name,email) VALUES($1,$2) RETURNING *',
    [name, email]
  );
  res.json(result.rows[0]);
});

app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM students WHERE id=$1', [id]);
  res.sendStatus(204);
});

// ---------------- COURSES ----------------
app.get('/courses', async (req, res) => {
  const result = await pool.query('SELECT * FROM courses ORDER BY id');
  res.json(result.rows);
});

app.post('/courses', async (req, res) => {
  const { course_name, teacher_name } = req.body;
  const result = await pool.query(
    'INSERT INTO courses(course_name,teacher_name) VALUES($1,$2) RETURNING *',
    [course_name, teacher_name]
  );
  res.json(result.rows[0]);
});

app.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM courses WHERE id=$1', [id]);
  res.sendStatus(204);
});

// ---------------- GRADES ----------------
app.get('/grades', async (req, res) => {
  const result = await pool.query('SELECT * FROM grades ORDER BY id');
  res.json(result.rows);
});

app.post('/grades', async (req, res) => {
  const { student_id, course_id, attendance, seatwork, assignment, project, midterm_exam, final_exam, term } = req.body;
  const result = await pool.query(
    `INSERT INTO grades(student_id, course_id, attendance, seatwork, assignment, project, midterm_exam, final_exam, term)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [student_id, course_id, attendance, seatwork, assignment, project, midterm_exam, final_exam, term]
  );
  res.json(result.rows[0]);
});

app.delete('/grades/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM grades WHERE id=$1', [id]);
  res.sendStatus(204);
});

// ---------------- START SERVER ----------------
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
