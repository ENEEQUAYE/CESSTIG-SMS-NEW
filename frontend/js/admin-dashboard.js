document.addEventListener("DOMContentLoaded", () => {
    // ========== CONSTANTS AND INITIAL SETUP ==========
    const API_URL = 'https://cesstig-sms.onrender.com';
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // ========== AUTHENTICATION CHECK ==========
    if (!token || !user || user.role !== "admin") {
      window.location.href = "index.html";
      return;
    }
  
    // ========== DOM ELEMENTS ==========
    const sidebar = document.getElementById("sidebar");
    const sidebarCollapse = document.getElementById("sidebarCollapse");
    const mainContent = document.querySelector(".main-content");
    const menuItems = document.querySelectorAll(".menu-item");
    const dashboardContents = document.querySelectorAll(".dashboard-content");
  
    // ========== UTILITY FUNCTIONS ==========
    function getRandomColor() {
      const colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4"];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  
    function getBadgeClass(status) {
      switch (status) {
        case "Active": return "bg-success";
        case "Inactive": return "bg-secondary";
        case "Graduated": return "bg-primary";
        case "Suspended": return "bg-danger";
        default: return "bg-info";
      }
    }
  
    function getFeeBadgeClass(status) {
      switch (status) {
        case 'Paid': return 'bg-success';
        case 'Partial': return 'bg-warning';
        case 'Unpaid': return 'bg-danger';
        default: return 'bg-info';
      }
    }
  
    // ========== UI FUNCTIONS ==========
    function setProfile() {
      if (user) {
        const profilePicUrl = user.profilePicture 
          ? `https://cesstig-sms.onrender.com${user.profilePicture}` 
          : "https://randomuser.me/api/portraits/men/85.jpg";
  
        document.querySelector("user-info img").src = profilePicUrl;
        document.getElementById("user-info span").textContent = user.firstName || "Admin";
      }
    }
  
    function updateTime() {
      const date = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
      document.getElementById('current-date').textContent = date.toLocaleDateString('en-US', options);
      document.getElementById('current-time').textContent = date.toLocaleTimeString('en-US', timeOptions);
    }
  
    // ========== SIDEBAR MANAGEMENT ==========
    function setupSidebar() {
      if (sidebarCollapse && sidebar) {
        sidebarCollapse.addEventListener("click", () => {
          sidebar.classList.toggle("collapsed");
          localStorage.setItem("sidebarState", sidebar.classList.contains("collapsed") ? "collapsed" : "expanded");
        });
  
        const savedState = localStorage.getItem("sidebarState");
        if (savedState === "collapsed") {
          sidebar.classList.add("collapsed");
        }
      }
  
      // Mobile sidebar toggle
      const sidebarCollapseBtn = document.getElementById('sidebar-collapse');
      if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', () => {
          sidebar.classList.toggle('active');
        });
      }
  
      // Close sidebar when menu item is clicked on mobile
      menuItems.forEach(item => {
        item.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("active");
          }
        });
      });
    }
  
    // ========== MENU NAVIGATION ==========
    function setupMenuNavigation() {
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          // Update active menu item
          menuItems.forEach(menu => menu.classList.remove('active'));
          item.classList.add('active');
  
          // Show the target content
          const target = item.getAttribute('data-target');
          dashboardContents.forEach(content => content.style.display = 'none');
          
          const targetContent = document.querySelector(target);
          if (targetContent) {
            targetContent.style.display = 'block';
            
            // Load data based on selected menu
            switch(target) {
              case '#students': loadStudents(); break;
              case '#lecturers': loadLecturers(); break;
              case '#courses': loadCourses(); break;
              case '#fees': loadFees(); break;
              case '#events': loadEvents(); break;
              case '#profile': loadProfile(); break;
              case '#administrators': loadAdmins(); break;
              case '#dashboard': loadDashboardStats(); break;
            }
          }
          
          // Save active menu
          localStorage.setItem('activeMenu', target);
        });
      });
  
      // Restore active menu from localStorage
      const savedActiveMenu = localStorage.getItem("activeMenu");
      if (savedActiveMenu) {
        const activeMenuItem = document.querySelector(`.menu-item[data-target="${savedActiveMenu}"]`);
        if (activeMenuItem) {
          activeMenuItem.click();
        } else {
          document.querySelector("#dashboard").style.display = "block";
          loadDashboardStats();
        }
      } else {
        document.querySelector("#dashboard").style.display = "block";
        loadDashboardStats();
      }
    }
  
    // ========== DATA LOADING FUNCTIONS ==========
    async function loadDashboardStats() {
      // Students count
      fetch(`${API_URL}/users/students/count`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = data.count;
        });
  
      // Lecturers count
      fetch(`${API_URL}/users/lecturers/count`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = data.count;
        });
  
      // Courses count
      fetch(`${API_URL}/courses/count`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = data.count;
        });
  
      // Total earnings
      fetch(`${API_URL}/fees/total`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = `$${data.total.toLocaleString()}`;
          initializeCharts(data.total);
        });
  
      initializeCalendar();
    }
  
    function initializeCharts(totalCollected) {
      setTimeout(() => {
        const totalDebt = 5000; // Would come from API in real app
        const collectionBar = document.getElementById('collection-bar');
        const debtsBar = document.getElementById('debts-bar');
        
        if (collectionBar && debtsBar) {
          const maxHeight = 150;
          const maxValue = Math.max(totalCollected, totalDebt);
          
          collectionBar.style.height = `${(totalCollected / maxValue) * maxHeight}px`;
          debtsBar.style.height = `${(totalDebt / maxValue) * maxHeight}px`;
          
          document.getElementById('collection-value').textContent = `$${totalCollected.toLocaleString()}`;
          document.getElementById('debt-value').textContent = `$${totalDebt.toLocaleString()}`;
        }
      }, 500);
    }
  
    function initializeCalendar() {
      const calendarEl = document.getElementById('calendar');
      if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          },
          height: 300,
          events: (info, successCallback, failureCallback) => {
            fetch(`${API_URL}/events`, { headers: { 'x-auth-token': token } })
              .then(response => response.json())
              .then(data => {
                const events = data.data.map(event => ({
                  title: event.name,
                  start: event.date,
                  color: getRandomColor()
                }));
                successCallback(events);
              })
              .catch(failureCallback);
          }
        });
        calendar.render();
      }
    }
  
    // ========== STUDENTS MANAGEMENT ==========
    function loadStudents(page = 1, search = '') {
      const studentsTableBody = document.getElementById('students-table-body');
      studentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
      
      fetch(`${API_URL}/users/students?page=${page}&search=${search}`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          studentsTableBody.innerHTML = '';
          
          if (data.data.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No students found</td></tr>';
            return;
          }
          
          data.data.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${student.studentId || 'N/A'}</td>
              <td>${student.firstName} ${student.lastName}</td>
              <td>${student.email}</td>
              <td>${student.phone || 'N/A'}</td>
              <td>${student.course ? student.course.courseName : 'Not assigned'}</td>
              <td>${student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}</td>
              <td><span class="badge ${student.isActive ? 'bg-success' : 'bg-danger'}">${student.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-sm btn-primary edit-student" data-id="${student._id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-student" data-id="${student._id}">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            `;
            studentsTableBody.appendChild(row);
          });
          
          updatePagination('students', data.pagination);
          addStudentActionListeners();
        })
        .catch(error => {
          console.error('Error fetching students:', error);
          studentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading students</td></tr>';
        });
    }
  
    function addStudentActionListeners() {
      // Edit student
      document.querySelectorAll('.edit-student').forEach(button => {
        button.addEventListener('click', () => {
          const studentId = button.getAttribute('data-id');
          fetch(`${API_URL}/users/${studentId}`, { headers: { 'x-auth-token': token } })
            .then(response => response.json())
            .then(data => {
              const student = data.data;
              populateStudentForm(student);
            });
        });
      });
  
      // Delete student
      document.querySelectorAll(".delete-student").forEach(button => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this student?")) {
            const studentId = button.getAttribute("data-id");
            fetch(`${API_URL}/users/${studentId}`, {
              method: 'DELETE',
              headers: { "x-auth-token": token }
            })
              .then(() => {
                alert('Student deleted successfully');
                loadStudents();
              })
              .catch(error => console.error("Error deleting student:", error));
          }
        });
      });
    }
  
    function populateStudentForm(student) {
      document.getElementById('studentFirstName').value = student.firstName;
      document.getElementById('studentLastName').value = student.lastName;
      document.getElementById('studentEmail').value = student.email;
      document.getElementById('studentPhone').value = student.phone || '';
      
      if (student.course) {
        document.getElementById('studentCourse').value = student.course;
      }
      
      if (student.lecturer) {
        document.getElementById('studentLecturer').value = student.lecturer;
      }
      
      if (student.enrollmentDate) {
        document.getElementById('studentEnrollmentDate').value = new Date(student.enrollmentDate).toISOString().split('T')[0];
      }
      
      const form = document.getElementById('add-student-form');
      form.setAttribute('data-id', student._id);
      form.querySelector('button[type="submit"]').textContent = 'Update Student';
      
      const modal = new bootstrap.Modal(document.getElementById('addStudentModal'));
      modal.show();
    }
  
    // ========== LECTURERS MANAGEMENT ==========
    function loadLecturers(page = 1, search = '') {
      const lecturersTableBody = document.getElementById('lecturers-table-body');
      lecturersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
      
      fetch(`${API_URL}/users/lecturers?page=${page}&search=${search}`, { headers: { 'x-auth-token': token } })
        .then(response => response.json())
        .then(data => {
          lecturersTableBody.innerHTML = '';
          
          if (data.data.length === 0) {
            lecturersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No lecturers found</td></tr>';
            return;
          }
          
          data.data.forEach(lecturer => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${lecturer.lecturerId || 'N/A'}</td>
              <td>${lecturer.firstName} ${lecturer.lastName}</td>
              <td>${lecturer.email}</td>
              <td>${lecturer.phone || 'N/A'}</td>
              <td>${lecturer.department || 'N/A'}</td>
              <td>${lecturer.courses && lecturer.courses.length > 0 ? 
                  lecturer.courses.map(course => course.courseName).join(', ') : 'None'}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-lecturer" data-id="${lecturer._id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-lecturer" data-id="${lecturer._id}">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            `;
            lecturersTableBody.appendChild(row);
          });
          
          updatePagination('lecturers', data.pagination);
          addLecturerActionListeners();
        })
        .catch(error => {
          console.error('Error fetching lecturers:', error);
          lecturersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading lecturers</td></tr>';
        });
    }
  
    // ... (continue with the rest of the functions in a similar organized manner)
  
    // ========== INITIALIZATION ==========
    setProfile();
    updateTime();
    setInterval(updateTime, 1000);
    setupSidebar();
    setupMenuNavigation();
    loadDropdownOptions();
  
    // ========== EVENT LISTENERS ==========
    // Logout
    document.querySelector('[data-target="#logout"]').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeMenu');
      window.location.href = 'index.html';
    });
  
    // Window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("collapsed");
      } else {
        const savedState = localStorage.getItem("sidebarState");
        if (savedState === "collapsed") {
          sidebar.classList.add("collapsed");
        } else {
          sidebar.classList.remove("collapsed");
        }
      }
    });
  
    // Profile picture upload
    document.getElementById('upload-pic').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      fetch(`${API_URL}/users/${user.id}/photo`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById('profile-pic').src = `${API_URL}/uploads/${data.data}`;
        const user = JSON.parse(localStorage.getItem('user'));
        user.profilePicture = data.data;
        localStorage.setItem('user', JSON.stringify(user));
      })
      .catch(error => console.error('Error uploading profile picture:', error));
    });
  });