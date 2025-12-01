// Student Database Management System

// Initialize students array from localStorage
let students = JSON.parse(localStorage.getItem('students')) || [];
let editingId = null;

// DOM Elements
const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentList = document.getElementById('student-list');
const noRecords = document.getElementById('no-records');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');

// Form inputs
const nameInput = document.getElementById('name');
const rollnoInput = document.getElementById('rollno');
const stdInput = document.getElementById('std');
const mobileInput = document.getElementById('mobile');
const studentIdInput = document.getElementById('student-id');

// Event Listeners
studentForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', filterStudents);
exportBtn.addEventListener('click', exportToExcel);

// Initialize
displayStudents();

// Handle Form Submit (Create/Update)
function handleFormSubmit(e) {
    e.preventDefault();

    const studentData = {
        name: nameInput.value.trim(),
        rollno: rollnoInput.value.trim(),
        std: stdInput.value.trim(),
        mobile: mobileInput.value.trim()
    };

    // Validation
    if (!validateStudentData(studentData)) {
        return;
    }

    if (editingId) {
        // Update existing student
        updateStudent(editingId, studentData);
    } else {
        // Check if roll number already exists
        if (students.some(s => s.rollno === studentData.rollno)) {
            alert('Roll number already exists!');
            return;
        }
        // Create new student
        createStudent(studentData);
    }

    resetForm();
    displayStudents();
}

// Create Student
function createStudent(studentData) {
    const newStudent = {
        id: Date.now().toString(),
        ...studentData,
        createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    saveToLocalStorage();
    alert('Student added successfully!');
}

// Update Student
function updateStudent(id, studentData) {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
        // Check if roll number is being changed and already exists
        if (students[index].rollno !== studentData.rollno) {
            if (students.some(s => s.rollno === studentData.rollno && s.id !== id)) {
                alert('Roll number already exists!');
                return;
            }
        }
        students[index] = {
            ...students[index],
            ...studentData,
            updatedAt: new Date().toISOString()
        };
        saveToLocalStorage();
        alert('Student updated successfully!');
    }
}

// Delete Student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        saveToLocalStorage();
        displayStudents();
        alert('Student deleted successfully!');
    }
}

// Edit Student
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        editingId = id;
        studentIdInput.value = id;
        nameInput.value = student.name;
        rollnoInput.value = student.rollno;
        stdInput.value = student.std;
        mobileInput.value = student.mobile;

        formTitle.textContent = 'Edit Student';
        submitBtn.textContent = 'Update Student';
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Display Students
function displayStudents(filteredStudents = null) {
    const studentsToDisplay = filteredStudents || students;

    if (studentsToDisplay.length === 0) {
        studentList.style.display = 'none';
        noRecords.style.display = 'block';
        return;
    }

    studentList.style.display = 'block';
    noRecords.style.display = 'none';

    studentList.innerHTML = studentsToDisplay.map(student => `
        <div class="student-card">
            <div class="student-info">
                <div class="student-field">
                    <label>Name</label>
                    <span>${escapeHtml(student.name)}</span>
                </div>
                <div class="student-field">
                    <label>Roll Number</label>
                    <span>${escapeHtml(student.rollno)}</span>
                </div>
                <div class="student-field">
                    <label>Standard/Class</label>
                    <span>${escapeHtml(student.std)}</span>
                </div>
                <div class="student-field">
                    <label>Mobile Number</label>
                    <span>${escapeHtml(student.mobile)}</span>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Filter Students
function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayStudents();
        return;
    }

    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.rollno.toLowerCase().includes(searchTerm) ||
        student.mobile.includes(searchTerm)
    );

    displayStudents(filtered);
}

// Reset Form
function resetForm() {
    editingId = null;
    studentForm.reset();
    studentIdInput.value = '';
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = 'Add Student';
    cancelBtn.style.display = 'none';
}

// Validate Student Data
function validateStudentData(data) {
    if (!data.name || data.name.length < 2) {
        alert('Please enter a valid student name (at least 2 characters)');
        return false;
    }

    if (!data.rollno) {
        alert('Please enter a roll number');
        return false;
    }

    if (!data.std) {
        alert('Please enter standard/class');
        return false;
    }

    if (!data.mobile || !/^\d{10}$/.test(data.mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return false;
    }

    return true;
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Export to Excel
function exportToExcel() {
    if (students.length === 0) {
        alert('No student records to export!');
        return;
    }

    // Prepare data for Excel
    const excelData = students.map((student, index) => ({
        'S.No': index + 1,
        'Student Name': student.name,
        'Roll Number': student.rollno,
        'Standard/Class': student.std,
        'Mobile Number': student.mobile
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
        { wch: 8 },   // S.No
        { wch: 20 },  // Student Name
        { wch: 15 },  // Roll Number
        { wch: 15 },  // Standard/Class
        { wch: 15 }   // Mobile Number
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Student_Database_${date}.xlsx`;

    // Export
    XLSX.writeFile(wb, filename);
    alert(`Student database exported successfully as ${filename}`);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;


