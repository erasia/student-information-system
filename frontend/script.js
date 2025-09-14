const apiUrl = 'http://localhost:3000';

// ---------------- STUDENTS ----------------
async function getStudents() {
  const res = await fetch(`${apiUrl}/students`);
  const students = await res.json();
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function addStudent() {
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  if (!name || !email) return alert("Fill both name and email");

  const res = await fetch(`${apiUrl}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  if (!res.ok) return alert("Error adding student");

  document.getElementById('studentName').value = '';
  document.getElementById('studentEmail').value = '';
  await getStudents();
}

async function deleteStudent(id) {
  await fetch(`${apiUrl}/students/${id}`, { method: 'DELETE' });
  await getStudents();
}

// ---------------- COURSES ----------------
async function getCourses() {
  const res = await fetch(`${apiUrl}/courses`);
  const courses = await res.json();
  const tbody = document.querySelector('#coursesTable tbody');
  tbody.innerHTML = '';
  courses.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.course_name}</td>
      <td>${c.teacher_name}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteCourse(${c.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function addCourse() {
  const course_name = document.getElementById('courseName').value.trim();
  const teacher_name = document.getElementById('teacherName').value.trim();
  if (!course_name || !teacher_name) return alert("Fill both course and teacher");

  const res = await fetch(`${apiUrl}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_name, teacher_name })
  });
  if (!res.ok) return alert("Error adding course");

  document.getElementById('courseName').value = '';
  document.getElementById('teacherName').value = '';
  await getCourses();
}

async function deleteCourse(id) {
  await fetch(`${apiUrl}/courses/${id}`, { method: 'DELETE' });
  await getCourses();
}

// ---------------- GRADES ----------------
async function getGrades() {
  const res = await fetch(`${apiUrl}/grades`);
  const grades = await res.json();
  const tbody = document.querySelector('#gradesTable tbody');
  tbody.innerHTML = '';

  const students = await (await fetch(`${apiUrl}/students`)).json();
  const courses = await (await fetch(`${apiUrl}/courses`)).json();

  grades.forEach(g => {
    const studentName = students.find(s => s.id === g.student_id)?.name || '';
    const courseName = courses.find(c => c.id === g.course_id)?.course_name || '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${g.id}</td>
      <td>${studentName}</td>
      <td>${courseName}</td>
      <td>${g.attendance}</td>
      <td>${g.seatwork}</td>
      <td>${g.assignment}</td>
      <td>${g.project}</td>
      <td>${g.midterm_exam}</td>
      <td>${g.final_exam}</td>
      <td>${g.term}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteGrade(${g.id})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  // auto-update final grades view if that page is open
  calculateFinalGrades();
}

async function addGrade() {
  const student_id = parseInt(document.getElementById('gradeStudent').value);
  const course_id = parseInt(document.getElementById('gradeCourse').value);
  const attendance = parseFloat(document.getElementById('attendance').value) || 0;
  const seatwork = parseFloat(document.getElementById('seatwork').value) || 0;
  const assignment = parseFloat(document.getElementById('assignment').value) || 0;
  const project = parseFloat(document.getElementById('project').value) || 0;
  const midterm_exam = parseFloat(document.getElementById('midterm').value) || 0;
  const final_exam = parseFloat(document.getElementById('final').value) || 0;
  const term = document.getElementById('term').value;

  if (!student_id || !course_id || !term) return alert("Select student, course, and term");

  try {
    const res = await fetch(`${apiUrl}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id, course_id, attendance, seatwork,
        assignment, project, midterm_exam, final_exam, term
      })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Grade added successfully!");
    document.getElementById('attendance').value = '';
    document.getElementById('seatwork').value = '';
    document.getElementById('assignment').value = '';
    document.getElementById('project').value = '';
    document.getElementById('midterm').value = '';
    document.getElementById('final').value = '';
    document.getElementById('term').value = '';
    await getGrades();
  } catch (err) {
    console.error("Error adding grade:", err);
    alert("Error adding grade: " + err.message);
  }
}

async function deleteGrade(id) {
  await fetch(`${apiUrl}/grades/${id}`, { method: 'DELETE' });
  await getGrades();
}

// ---------------- DROPDOWNS ----------------
async function populateStudentDropdown() {
  const students = await (await fetch(`${apiUrl}/students`)).json();
  const sel = document.getElementById('gradeStudent');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select student</option>';
  students.forEach(s => { sel.innerHTML += `<option value="${s.id}">${s.name}</option>` });
}

async function populateCourseDropdown() {
  const courses = await (await fetch(`${apiUrl}/courses`)).json();
  const sel = document.getElementById('gradeCourse');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select course</option>';
  courses.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.course_name}</option>` });
}

// ---------------- FINAL GRADES ----------------
async function calculateFinalGrades() {
  const table = document.querySelector('#finalGradesTable tbody');
  if (!table) return; // only run if final-grades page exists

  const grades = await (await fetch(`${apiUrl}/grades`)).json();
  const students = await (await fetch(`${apiUrl}/students`)).json();
  const courses = await (await fetch(`${apiUrl}/courses`)).json();
  table.innerHTML = '';

  grades.forEach(g => {
    const studentName = students.find(s => s.id === g.student_id)?.name || '';
    const courseName = courses.find(c => c.id === g.course_id)?.course_name || '';

    let weights = {};
    if (g.term === 'midterm') {
      weights = { attendance: 0.1333, seatwork: 0.2, assignment: 0.2, project: 0.1333, midterm: 0.3334, final: 0 };
    } else {
      weights = { attendance: 0.1, seatwork: 0.15, assignment: 0.15, project: 0.1, midterm: 0.25, final: 0.25 };
    }

    const finalGrade = (
      parseFloat(g.attendance) * weights.attendance +
      parseFloat(g.seatwork) * weights.seatwork +
      parseFloat(g.assignment) * weights.assignment +
      parseFloat(g.project) * weights.project +
      parseFloat(g.midterm_exam) * weights.midterm +
      parseFloat(g.final_exam || 0) * weights.final
    ).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${studentName}</td><td>${courseName}</td><td>${finalGrade}</td>`;
    table.appendChild(tr);
  });
}

// ---------------- AUTO PAGE LOADING ----------------
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");

  switch (page) {
    case "students.html":
      getStudents();
      break;
    case "courses.html":
      getCourses();
      break;
    case "grades.html":
      populateStudentDropdown();
      populateCourseDropdown();
      getGrades();
      break;
    case "final-grades.html":
      calculateFinalGrades();
      break;
  }
});
