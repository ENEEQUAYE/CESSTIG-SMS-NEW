document.addEventListener("DOMContentLoaded", () => {
    // ========== AUTHENTICATION & INITIALIZATION ==========
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Token:", token);
    console.log("User:", user);
    const API_URL = "https://cesstig-sms.onrender.com/api"
  
    // Check if user is logged in and has admin role
    if (!token || !user || user.role !== "admin") {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "index.html";
      return;
    }
  
    // ========== DOM ELEMENTS ==========
    const sidebar = document.getElementById("sidebar")
    const sidebarCollapse = document.getElementById("sidebarCollapse")
    const mainContent = document.querySelector(".main-content")
    const menuItems = document.querySelectorAll(".menu-item")
    const dashboardContents = document.querySelectorAll(".dashboard-content")
  
    // ========== INITIALIZATION FUNCTIONS ==========
    function init() {
      updateTime()
      setInterval(updateTime, 1000)
      setProfile()
      setupSidebar()
      setupMenuNavigation()
      setupEventListeners()
      loadDropdownOptions()
    }
  
    function setProfile() {
      if (user) {
        // Ensure absolute URL for profile picture
        const profilePicUrl = user.profilePicture
          ? user.profilePicture.startsWith("http")
            ? user.profilePicture
            : `https://cesstig-sms.onrender.com${user.profilePicture}`
          : "img/"
  
        // Update profile picture in header
        const userImageElements = document.querySelectorAll(".user-image")
        userImageElements.forEach((img) => {
          img.src = profilePicUrl
        })
  
        // Update user name in header
        const userNameElements = document.querySelectorAll(".user-name")
        userNameElements.forEach((span) => {
            span.textContent = user.firstName || "Admin";
        })
      }
    }
  
    function updateTime() {
      const date = new Date()
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      const timeOptions = { hour: "numeric", minute: "numeric", second: "numeric", hour12: true }
  
      const dateElements = document.querySelectorAll('[id$="current-date"], #current-date')
      const timeElements = document.querySelectorAll('[id$="current-time"], #current-time')
  
      dateElements.forEach((el) => {
        if (el) el.textContent = date.toLocaleDateString("en-US", options)
      })
  
      timeElements.forEach((el) => {
        if (el) el.textContent = date.toLocaleTimeString("en-US", timeOptions)
      })
    }
  
    // ========== SIDEBAR MANAGEMENT ==========
    function setupSidebar() {
      if (sidebarCollapse && sidebar) {
        sidebarCollapse.addEventListener("click", () => {
          sidebar.classList.toggle("collapsed")
          localStorage.setItem("sidebarState", sidebar.classList.contains("collapsed") ? "collapsed" : "expanded")
        })
  
        // Restore saved state
        const savedState = localStorage.getItem("sidebarState")
        if (savedState === "collapsed") {
          sidebar.classList.add("collapsed")
        }
      }
  
      // Mobile sidebar toggle
      const sidebarCollapseBtn = document.getElementById("sidebar-collapse")
      if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener("click", () => {
          sidebar.classList.toggle("active")
        })
      }
  
      // Handle window resize
      window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("collapsed")
        } else {
          // Restore saved state on larger screens
          const savedState = localStorage.getItem("sidebarState")
          if (savedState === "collapsed") {
            sidebar.classList.add("collapsed")
          } else {
            sidebar.classList.remove("collapsed")
          }
        }
      })
    }
  
    // ========== MENU NAVIGATION ==========
    function setupMenuNavigation() {
      menuItems.forEach((item) => {
        item.addEventListener("click", () => {
          // Update active menu item
          menuItems.forEach((menu) => menu.classList.remove("active"))
          item.classList.add("active")
  
          // Show the target content
          const target = item.getAttribute("data-target")
          dashboardContents.forEach((content) => (content.style.display = "none"))
  
          const targetContent = document.querySelector(target)
          if (targetContent) {
            targetContent.style.display = "block"
  
            // Load data based on selected menu
            switch (target) {
              case "#dashboard":
                loadDashboardStats()
                break
              case "#students":
                loadStudents()
                break
              case "#lecturers":
                loadLecturers()
                break
              case "#courses":
                loadCourses()
                break
              case "#fees":
                loadFees()
                break
              case "#events":
                loadEvents()
                break
              case "#profile":
                loadProfile()
                break
              case "#administrators":
                loadAdmins()
                break
            }
          }
  
          // On mobile, collapse the sidebar after selection
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("active")
          }
  
          // Save active menu
          localStorage.setItem("activeMenu", target)
        })
      })
  
      // Restore active menu from localStorage
      const savedActiveMenu = localStorage.getItem("activeMenu")
      if (savedActiveMenu) {
        const activeMenuItem = document.querySelector(`.menu-item[data-target="${savedActiveMenu}"]`)
        if (activeMenuItem) {
          activeMenuItem.click()
        } else {
          document.querySelector("#dashboard").style.display = "block"
          loadDashboardStats()
        }
      } else {
        document.querySelector("#dashboard").style.display = "block"
        loadDashboardStats()
      }
    }
  
    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
      // Logout functionality
      const logoutBtn = document.querySelector('[data-target="#logout"]')
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          localStorage.removeItem("activeMenu")
          window.location.href = "index.html"
        })
      }
  
      // Form submission handlers
      setupFormHandlers()
  
      // Search input handlers
      setupSearchHandlers()
  
      // Pagination handlers
      setupPaginationHandlers()
  
      // Profile picture upload
      const uploadPicInput = document.getElementById("upload-pic")
      if (uploadPicInput) {
        uploadPicInput.addEventListener("change", handleProfilePictureUpload)
      }
    }
  
    function setupFormHandlers() {
      // Add Student Form
      const addStudentForm = document.getElementById("add-student-form")
      if (addStudentForm) {
        addStudentForm.addEventListener("submit", handleStudentFormSubmit)
      }
  
      // Add Lecturer Form
      const lecturerForm = document.getElementById("lecturerForm")
      if (lecturerForm) {
        lecturerForm.addEventListener("submit", handleLecturerFormSubmit)
      }
  
      // Add Course Form
      const addCourseForm = document.getElementById("addCourseForm")
      if (addCourseForm) {
        addCourseForm.addEventListener("submit", handleCourseFormSubmit)
      }
  
      // Update Payment Form
      const updatePaymentForm = document.getElementById("updatePaymentForm")
      if (updatePaymentForm) {
        updatePaymentForm.addEventListener("submit", handlePaymentFormSubmit)
      }
  
      // Add Event Form
      const addEventForm = document.getElementById("addEventForm")
      if (addEventForm) {
        addEventForm.addEventListener("submit", handleEventFormSubmit)
      }
  
      // Add Admin Form
      const addAdminForm = document.getElementById("addAdminForm")
      if (addAdminForm) {
        addAdminForm.addEventListener("submit", handleAdminFormSubmit)
      }

      // Edit Profile Form
      const saveProfileBtn = document.getElementById("save-profile-btn");
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", handleProfileEditFormSubmit);
      }
    }
  
    function setupSearchHandlers() {
      // Students search
      const searchStudentsInput = document.getElementById("search-students")
      if (searchStudentsInput) {
        searchStudentsInput.addEventListener("input", function () {
          loadStudents(1, this.value)
        })
      }
  
      // Lecturers search
      const searchLecturersInput = document.getElementById("search-lecturers")
      if (searchLecturersInput) {
        searchLecturersInput.addEventListener("input", function () {
          loadLecturers(1, this.value)
        })
      }
  
      // Courses search
      const searchCoursesInput = document.getElementById("search-courses")
      if (searchCoursesInput) {
        searchCoursesInput.addEventListener("input", function () {
          loadCourses(this.value)
        })
      }
  
      // Fees search
      const searchFeesInput = document.getElementById("search-fees-input")
      if (searchFeesInput) {
        searchFeesInput.addEventListener("input", function () {
          loadFees(1, this.value)
        })
      }
  
      // Events search
      const searchEventsInput = document.getElementById("search-events-input")
      if (searchEventsInput) {
        searchEventsInput.addEventListener("input", function () {
          loadEvents(1, this.value)
        })
      }
  
      // Admins search
      const searchAdminsInput = document.getElementById("search-admins")
      if (searchAdminsInput) {
        searchAdminsInput.addEventListener("input", function () {
          loadAdmins(1, this.value)
        })
      }
    }
  
    function setupPaginationHandlers() {
      // Students pagination
      setupPaginationForSection("students", loadStudents)
  
      // Lecturers pagination
      setupPaginationForSection("lecturers", loadLecturers)
  
      // Fees pagination
      setupPaginationForSection("fees", loadFees)
  
      // Events pagination
      setupPaginationForSection("events", loadEvents)
  
      // Admins pagination
      setupPaginationForSection("admins", loadAdmins)
    }
  
    function setupPaginationForSection(section, loadFunction) {
      const prevBtn = document.getElementById(`prev-page-btn${section === "students" ? "" : "-" + section}`)
      const nextBtn = document.getElementById(`next-page-btn${section === "students" ? "" : "-" + section}`)
      const pageNum = document.getElementById(`page-num${section === "students" ? "" : "-" + section}`)
      const searchInput = document.getElementById(
        `search-${section}${section === "fees" || section === "events" ? "-input" : ""}`,
      )
  
      if (prevBtn && nextBtn && pageNum) {
        prevBtn.addEventListener("click", () => {
          const currentPage = Number.parseInt(pageNum.textContent)
          if (currentPage > 1) {
            loadFunction(currentPage - 1, searchInput ? searchInput.value : "")
          }
        })
  
        nextBtn.addEventListener("click", () => {
          const currentPage = Number.parseInt(pageNum.textContent)
          loadFunction(currentPage + 1, searchInput ? searchInput.value : "")
        })
      }
    }
  
    // ========== FORM HANDLERS ==========
    function handleStudentFormSubmit(e) {
      e.preventDefault()
  
      const studentId = this.getAttribute("data-id")
      const isUpdate = !!studentId
  
      const formData = {
        firstName: document.getElementById("studentFirstName").value,
        lastName: document.getElementById("studentLastName").value,
        dateOfBirth: document.getElementById("studentDob").value,
        email: document.getElementById("studentEmail").value,
        phone: document.getElementById("studentPhone").value,
        role: "student",
        course: document.getElementById("studentCourse").value,
        lecturer: document.getElementById("studentLecturer").value,
        enrollmentDate: document.getElementById("studentEnrollmentDate").value,
        country: document.getElementById("studentCountry").value,
        address: document.getElementById("studentAddress").value,
        
      }
  
      // Add password for new students
      if (!isUpdate) {
        formData.password = document.getElementById("studentPassword").value
  
        // Validate password match
        if (formData.password !== document.getElementById("studentConfirmPassword").value) {
          alert("Passwords do not match")
          return
        }
      }
  
      // API endpoint and method
      const url = isUpdate ? `${API_URL}/users/students/${studentId}` : `${API_URL}/users/students`
      const method = isUpdate ? "PUT" : "POST"
  
      // Submit form data
      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("addStudentModal")
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
          this.removeAttribute("data-id")
          const submitBtn = this.querySelector('button[type="submit"]')
          if (submitBtn) submitBtn.textContent = "Add Student"
  
          // Show success message
          alert(isUpdate ? "Student updated successfully" : "Student added successfully")
  
          // Reload students list
          loadStudents();
          loadFees();
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  
    function handleLecturerFormSubmit(e) {
      e.preventDefault()
  
      const lecturerId = this.getAttribute("data-id")
      const isUpdate = !!lecturerId
  
      const formData = {
        firstName: document.getElementById("lecturerFirstName").value,
        lastName: document.getElementById("lecturerLastName").value,
        email: document.getElementById("lecturerEmail").value,
        phone: document.getElementById("lecturerPhone").value,
        role: "lecturer",
        department: document.getElementById("lecturerDepartment").value,
      }
  
      // Add courses if multi-select is available
      const coursesSelect = document.getElementById("lecturerCourses")
      if (coursesSelect && coursesSelect.multiple) {
        formData.courses = Array.from(coursesSelect.selectedOptions).map((option) => option.value)
      }
  
      // Add password for new lecturers
      if (!isUpdate) {
        formData.password = document.getElementById("lecturerPassword").value
  
        // Validate password match
        if (formData.password !== document.getElementById("lecturerConfirmPassword").value) {
          alert("Passwords do not match")
          return
        }
      }
  
      // API endpoint and method
      const url = isUpdate ? `${API_URL}/users/lecturers/${lecturerId}` : `${API_URL}/users/lecturers`
      const method = isUpdate ? "PUT" : "POST"
  
      // Submit form data
      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("addLecturerModal")
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
          this.removeAttribute("data-id")
          const submitBtn = this.querySelector('button[type="submit"]')
          if (submitBtn) submitBtn.textContent = "Add Lecturer"
  
          // Show success message
          alert(isUpdate ? "Lecturer updated successfully" : "Lecturer added successfully")
  
          // Reload lecturers list
          loadLecturers()
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  
    function handleCourseFormSubmit(e) {
      e.preventDefault()
  
      const courseId = this.getAttribute("data-id")
      const isUpdate = !!courseId
  
      // Create FormData object for file upload
      const formData = new FormData()
      formData.append("courseCode", document.getElementById("courseCode").value)
      formData.append("courseName", document.getElementById("courseName").value)
      formData.append("courseDescription", document.getElementById("courseDescription").value)
  
      // Add thumbnail if selected
      const thumbnailInput = document.getElementById("courseThumbnail")
      if (thumbnailInput && thumbnailInput.files.length > 0) {
        formData.append("courseThumbnail", thumbnailInput.files[0])
      }
  
      // Log the form data for debugging
      console.log("Course form data:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }
  
      // API endpoint and method
      const url = isUpdate ? `${API_URL}/courses/${courseId}` : `${API_URL}/courses`
      const method = isUpdate ? "PUT" : "POST"
  
      // Submit form data
      fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type when sending FormData - the browser will set it with the boundary
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.message || "Network response was not ok")
            })
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("addCourseModal")
          // Get the Bootstrap modal instance
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
          this.removeAttribute("data-id")
          const submitBtn = this.querySelector('button[type="submit"]')
          if (submitBtn) submitBtn.textContent = "Add Course"
  
          // Show success message
          alert(isUpdate ? "Course updated successfully" : "Course added successfully")
  
          // Reload courses list
          loadCourses()
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("Error: " + error.message)
        })
    }
    
    function handlePaymentFormSubmit(e) {
      e.preventDefault()
  
      const feeId = this.getAttribute("data-id")
  
      const paymentData = {
        amount: Number.parseFloat(document.getElementById("amountPaid").value),
        paymentMethod: document.getElementById("paymentMethod").value,
        transactionRef: document.getElementById("transactionRef").value,
        paymentDate: document.getElementById("paymentDate").value,
        remarks: document.getElementById("remarks").value,
      }
  
      // Submit payment data
      fetch(`${API_URL}/fees/${feeId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("updatePaymentModal")
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
  
          // Show success message
          alert("Payment updated successfully")
  
          // Reload fees list
          loadFees()
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  
    function handleEventFormSubmit(e) {
      e.preventDefault()
  
      const eventId = this.getAttribute("data-id")
      const isUpdate = !!eventId
  
      const eventData = {
        name: document.getElementById("eventName").value,
        date: document.getElementById("eventDate").value,
        location: document.getElementById("eventLocation").value,
        description: document.getElementById("eventDescription").value,
      }
  
      // API endpoint and method
      const url = isUpdate ? `${API_URL}/events/${eventId}` : `${API_URL}/events`
      const method = isUpdate ? "PUT" : "POST"
  
      // Submit event data
      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("addEventModal")
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
          this.removeAttribute("data-id")
          const submitBtn = this.querySelector('button[type="submit"]')
          if (submitBtn) submitBtn.textContent = "Add Event"
  
          // Show success message
          alert(isUpdate ? "Event updated successfully" : "Event added successfully")
  
          // Reload events list
          loadEvents()
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  
    function handleAdminFormSubmit(e) {
      e.preventDefault()
  
      const adminId = this.getAttribute("data-id")
      const isUpdate = !!adminId
  
      const formData = {
        firstName: document.getElementById("adminFirstName").value,
        lastName: document.getElementById("adminLastName").value,
        email: document.getElementById("adminEmail").value,
        phone: document.getElementById("adminPhone").value,
        role: "admin",
        position: document.getElementById("adminPosition").value,
      }
  
      // Add password for new admins
      if (!isUpdate) {
        formData.password = document.getElementById("adminPassword").value
  
        // Validate password match
        if (formData.password !== document.getElementById("adminConfirmPassword").value) {
          alert("Passwords do not match")
          return
        }
      }
  
      // API endpoint and method
      const url = isUpdate ? `${API_URL}/users/admins/${adminId}` : `${API_URL}/users/admins`
      const method = isUpdate ? "PUT" : "POST"
  
      // Submit form data
      fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Close modal
          const modalElement = document.getElementById("addAdminModal")
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
  
          // Reset form
          this.reset()
          this.removeAttribute("data-id")
          const submitBtn = this.querySelector('button[type="submit"]')
          if (submitBtn) submitBtn.textContent = "Add Administrator"
  
          // Show success message
          alert(isUpdate ? "Administrator updated successfully" : "Administrator added successfully")
  
          // Reload admins list
          loadAdmins()
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  
    function handleProfilePictureUpload(e) {
      const file = e.target.files[0]
      if (!file) return
  
      const formData = new FormData()
      formData.append("profilePicture", file)
  
      fetch(`${API_URL}/users/upload-profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .then((data) => {
          // Update profile picture
          const profilePicElements = document.querySelectorAll("#profile-pic, .user-image")
          profilePicElements.forEach((img) => {
            img.src = `https://cesstig-sms.onrender.com${data.profilePicture}`
          })
  
          // Update user in localStorage
          const updatedUser = { ...user, profilePicture: data.profilePicture }
          localStorage.setItem("user", JSON.stringify(updatedUser))
  
          // Show success message
          alert("Profile picture updated successfully")
        })
        .catch((error) => {
          console.error("Error uploading profile picture:", error)
          alert("Failed to upload profile picture. Please try again.")
        })
    }
  
    // ========== DATA LOADING FUNCTIONS ==========
    function loadDashboardStats() {
      // Fetch students count
      fetchData(`${API_URL}/users/students/count`, (data) => {
        const studentCountElement = document.querySelector(".stat-card:nth-child(1) .stat-value")
        if (studentCountElement) studentCountElement.textContent = data.count || 0
      })
  
      // Fetch lecturers count
      fetchData(`${API_URL}/users/lecturers/count`, (data) => {
        const lecturerCountElement = document.querySelector(".stat-card:nth-child(2) .stat-value")
        if (lecturerCountElement) lecturerCountElement.textContent = data.count || 0
      })
  
      // Fetch courses count
      fetchData(`${API_URL}/courses/count`, (data) => {
        const courseCountElement = document.querySelector(".stat-card:nth-child(3) .stat-value")
        if (courseCountElement) courseCountElement.textContent = data.count || 0
      })
  
      // Fetch total earnings
      fetchData(`${API_URL}/fees/total`, (data) => {
        const earningsElement = document.querySelector(".stat-card:nth-child(4) .stat-value")
        if (earningsElement) earningsElement.textContent = `$${(data.total || 0).toLocaleString()}`
  
        // Initialize charts with the data
        initializeCharts(data.total || 0)
      })
  
      // Initialize calendar
      initializeCalendar()
    }
  
    function loadStudents(page = 1, search = "") {
      const studentsTableBody = document.getElementById("students-table-body")
      if (!studentsTableBody) return
  
      // Show loading state
      studentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>'
  
      // Fetch students from API
      fetchData(
        `${API_URL}/users/students?page=${page}&search=${search}`,
        (data) => {
          // Clear loading state
          studentsTableBody.innerHTML = ""
  
          if (!data.data || data.data.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No students found</td></tr>'
            return
          }
  
          // Populate table with student data
          data.data.forEach((student) => {
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${student.studentId || "N/A"}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone || "N/A"}</td>
            <td>${student.course ? student.course.courseCode : ""} - ${student.course ? student.course.courseName : "Not assigned"}</td>
            <td>${student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "N/A"}</td>
            <td><span class="badge ${student.isActive ? "bg-success" : "bg-danger"}">${student.isActive ? "Active" : "Inactive"}</span></td>
            <td>
              <button class="btn btn-sm btn-primary edit-student" data-id="${student._id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-student" data-id="${student._id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `
            studentsTableBody.appendChild(row)
          })
  
          // Update pagination
          updatePagination("students", data.pagination)
  
          // Add event listeners to edit and delete buttons
          addStudentActionListeners()
        },
        (error) => {
          console.error("Error fetching students:", error)
          studentsTableBody.innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Error loading students</td></tr>'
        },
      )
    }
  
    function loadLecturers(page = 1, search = "") {
      const lecturersTableBody = document.getElementById("lecturers-table-body")
      if (!lecturersTableBody) return
  
      // Show loading state
      lecturersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>'
  
      // Fetch lecturers from API
      fetchData(
        `${API_URL}/users/lecturers?page=${page}&search=${search}`,
        (data) => {
          // Clear loading state
          lecturersTableBody.innerHTML = ""
  
          if (!data.data || data.data.length === 0) {
            lecturersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No lecturers found</td></tr>'
            return
          }
  
          // Populate table with lecturer data
          data.data.forEach((lecturer) => {
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${lecturer.lecturerId || "N/A"}</td>
            <td>${lecturer.firstName} ${lecturer.lastName}</td>
            <td>${lecturer.email}</td>
            <td>${lecturer.phone || "N/A"}</td>
            <td>${lecturer.department || "N/A"}</td>
            <td>${
              lecturer.courses && lecturer.courses.length > 0
                ? lecturer.courses.map((course) => course.courseName).join(", ")
                : "None"
            }</td>
            <td>
              <button class="btn btn-sm btn-primary edit-lecturer" data-id="${lecturer._id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-lecturer" data-id="${lecturer._id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `
            lecturersTableBody.appendChild(row)
          })
  
          // Update pagination
          updatePagination("lecturers", data.pagination)
  
          // Add event listeners to edit and delete buttons
          addLecturerActionListeners()
        },
        (error) => {
          console.error("Error fetching lecturers:", error)
          lecturersTableBody.innerHTML =
            '<tr><td colspan="7" class="text-center text-danger">Error loading lecturers</td></tr>'
        },
      )
    }
  
    function loadCourses(search = "") {
      const coursesList = document.querySelector(".courses-list");
      if (!coursesList) return;
  
      // Show loading state
      coursesList.innerHTML = '<div class="text-center">Loading courses...</div>';
  
      // Fetch courses from API
      fetchData(`${API_URL}/courses`, (data) => {
          // Clear loading state
          coursesList.innerHTML = "";
  
          // Check if no courses are found
          if (!data.data || data.data.length === 0) {
              coursesList.innerHTML = '<div class="text-center">No courses found</div>';
              return;
          }
  
          // Filter courses if a search term is provided
          let courses = data.data;
          if (search) {
              const searchLower = search.toLowerCase();
              courses = courses.filter((course) =>
                  course.courseName.toLowerCase().includes(searchLower) ||
                  course.courseCode.toLowerCase().includes(searchLower)
              );
          }
  
          // Populate the courses list
          courses.forEach((course) => {
            const thumbnail = course.courseThumbnail
            ? `https://cesstig-sms.onrender.com${course.courseThumbnail}`
            : "img/course1.jpg"; // Use default thumbnail if none is provided
              const courseItem = `
              <div class="col-md-6 col-lg-4 mb-4">
                  <div class="course-card">
                    <div class="course-item">
                        <div class="course-thumbnail">
                            <img src="${thumbnail}" alt="${course.courseName}" class="img-fluid">
                        </div>
                        <div class="course-details">
                          <div class="course-header">
                            <div class="course-title">
                                ${course.courseName} <span class="course-code">(${course.courseCode})</span>
                            </div>
                            </div>
                            <div class="course-body">
                              <div class="course-description">${course.courseDescription}</div>
                            </div>
                            <div class="course-footer">
                            <div class="course-actions">
                                <button class="action-btn green edit-course" data-id="${course._id}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="action-btn red delete-course" data-id="${course._id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
              `;
              coursesList.insertAdjacentHTML("beforeend", courseItem);
          });
  
          // Add event listeners to edit and delete buttons
          addCourseActionListeners();
      }, (error) => {
          console.error("Error fetching courses:", error);
          coursesList.innerHTML = '<div class="text-center text-danger">Error loading courses</div>';
      });
  }
  
    function loadFees(page = 1, search = "") {
      const feesTableBody = document.getElementById("fees-table-body")
      if (!feesTableBody) return
  
      // Show loading state
      feesTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>'
  
      // Fetch fees from API
      fetchData(
        `${API_URL}/fees?page=${page}&search=${search}`,
        (data) => {
          console.log("Fees data:", data); // Debugging
          feesTableBody.innerHTML = "";
      
          if (!data.data || data.data.length === 0) {
            feesTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No fees found</td></tr>';
            return;
          }
      
          // Populate table with fee data
          data.data.forEach((fee) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${fee.student ? fee.student.studentId : "N/A"}</td>
              <td>${fee.student ? `${fee.student.firstName} ${fee.student.lastName}` : "N/A"}</td>
              <td>${fee.course ? fee.course.courseName : "N/A"}</td>
              <td>$${fee.amountPaid.toLocaleString()}</td>
              <td>$${fee.balance.toLocaleString()}</td>
              <td><span class="badge ${getFeeBadgeClass(fee.status)}">${fee.status}</span></td>
              <td>
                <button class="btn btn-sm btn-primary update-payment" data-id="${fee._id}" data-bs-toggle="modal" data-bs-target="#updatePaymentModal">
                  <i class="fas fa-money-bill-wave"></i> Update Payment
                </button>
                <button class="btn btn-sm btn-info view-payments" data-id="${fee._id}">
                  <i class="fas fa-history"></i> History
                </button>
              </td>
            `;
            feesTableBody.appendChild(row);
          });
      
          // Update pagination
          updatePagination("fees", data.pagination);
      
          // Add event listeners to fee action buttons
          addFeeActionListeners();
        },
        (error) => {
          console.error("Error fetching fees:", error);
          feesTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading fees</td></tr>';
        }
      );
    }
  
    function loadEvents(page = 1, search = "") {
      const eventsTableBody = document.getElementById("events-table-body")
      if (!eventsTableBody) return
  
      // Show loading state
      eventsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>'
  
      // Fetch events from API
      fetchData(
        `${API_URL}/events?page=${page}&search=${search}`,
        (data) => {
          // Clear loading state
          eventsTableBody.innerHTML = ""
  
          if (!data.data || data.data.length === 0) {
            eventsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No events found</td></tr>'
            return
          }
  
          // Populate table with event data
          data.data.forEach((event) => {
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${event.name}</td>
            <td>${new Date(event.date).toLocaleDateString()}</td>
            <td>${event.location}</td>
            <td>${event.description || "No description"}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-event" data-id="${event._id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-event" data-id="${event._id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `
            eventsTableBody.appendChild(row)
          })
  
          // Update pagination
          updatePagination("events", data.pagination)
  
          // Add event listeners to event action buttons
          addEventActionListeners()
        },
        (error) => {
          console.error("Error fetching events:", error)
          eventsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading events</td></tr>'
        },
      )
    }
  
    function loadAdmins(page = 1, search = "") {
      const adminsTableBody = document.getElementById("admins-table-body")
      if (!adminsTableBody) return
  
      // Show loading state
      adminsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>'
  
      // Fetch admins from API
      fetchData(
        `${API_URL}/users/admins?page=${page}&search=${search}`,
        (data) => {
          // Clear loading state
          adminsTableBody.innerHTML = ""
  
          if (!data.data || data.data.length === 0) {
            adminsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No administrators found</td></tr>'
            return
          }
  
          // Populate table with admin data
          data.data.forEach((admin) => {
            const row = document.createElement("tr")
            row.innerHTML = `
            <td>${admin.adminId || "N/A"}</td>
            <td>${admin.firstName} ${admin.lastName}</td>
            <td>${admin.email}</td>
            <td>${admin.phone || "N/A"}</td>
            <td>${admin.position || "N/A"}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-admin" data-id="${admin._id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-admin" data-id="${admin._id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `
            adminsTableBody.appendChild(row)
          })
  
          // Update pagination
          updatePagination("admins", data.pagination)
  
          // Add event listeners to edit and delete buttons
          addAdminActionListeners()
        },
        (error) => {
          console.error("Error fetching administrators:", error)
          adminsTableBody.innerHTML =
            '<tr><td colspan="6" class="text-center text-danger">Error loading administrators</td></tr>'
        },
      )
    }
  
    function loadProfile() {
      // Fetch user profile
      fetchData(
        `${API_URL}/users/profile`,
        (data) => {
          const user = data
  
          // Update profile information
          const profileNameElement = document.getElementById("profile-name")
          const profilePositionElement = document.getElementById("profile-position")
          const profileEmailElement = document.getElementById("profile-email")
          const profileContactElement = document.getElementById("profile-contact")
          const profilePicElement = document.getElementById("profile-pic")
  
          if (profileNameElement) profileNameElement.textContent = `${user.firstName} ${user.lastName}`
          if (profilePositionElement) profilePositionElement.textContent = user.position || user.role
          if (profileEmailElement) profileEmailElement.textContent = user.email
          if (profileContactElement) profileContactElement.textContent = user.phone || "Not provided"
  
          // Set profile picture
          if (profilePicElement && user.profilePicture) {
            profilePicElement.src = `https://cesstig-sms.onrender.com${user.profilePicture}`
          }
        },
        (error) => {
          console.error("Error fetching profile:", error)
          alert("Failed to load profile information")
        },
      )
    }
  
    // ========== ACTION LISTENERS ==========
    function addStudentActionListeners() {
      // Edit student
      document.querySelectorAll(".edit-student").forEach((button) => {
        button.addEventListener("click", () => {
          const studentId = button.getAttribute("data-id")
  
          // Fetch student details and populate edit form
          fetchData(
            `${API_URL}/users/students/${studentId}`,
            (data) => {
              const student = data.data
  
              // Populate form fields
              document.getElementById("studentFirstName").value = student.firstName
              document.getElementById("studentLastName").value = student.lastName
              document.getElementById("studentEmail").value = student.email
              document.getElementById("studentPhone").value = student.phone || ""
  
              // Set course if available
              if (student.course) {
                document.getElementById("studentCourse").value = student.course
              }
  
              // Set lecturer if available
              if (student.lecturer) {
                document.getElementById("studentLecturer").value = student.lecturer
              }
  
              // Set enrollment date if available
              if (student.enrollmentDate) {
                document.getElementById("studentEnrollmentDate").value = new Date(student.enrollmentDate)
                  .toISOString()
                  .split("T")[0]
              }
  
              // Show edit modal
              const modal = new bootstrap.Modal(document.getElementById("addStudentModal"))
              modal.show()
  
              // Change form submission to update instead of create
              const form = document.getElementById("add-student-form")
              form.setAttribute("data-id", studentId)
              form.querySelector('button[type="submit"]').textContent = "Update Student"
            },
            (error) => {
              console.error("Error fetching student details:", error)
              alert("Failed to load student details")
            },
          )
        })
      })
  
      // Delete student
      document.querySelectorAll(".delete-student").forEach((button) => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this student?")) {
            const studentId = button.getAttribute("data-id")
  
            fetch(`${API_URL}/users/students/${studentId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok")
                }
                return response.json()
              })
              .then((data) => {
                alert("Student deleted successfully")
                loadStudents()
              })
              .catch((error) => {
                console.error("Error deleting student:", error)
                alert("Failed to delete student")
              })
          }
        })
      })
    }
  
    function addLecturerActionListeners() {
      // Edit lecturer
      document.querySelectorAll(".edit-lecturer").forEach((button) => {
        button.addEventListener("click", () => {
          const lecturerId = button.getAttribute("data-id")
  
          // Fetch lecturer details and populate edit form
          fetchData(
            `${API_URL}/users/lecturers/${lecturerId}`,
            (data) => {
              const lecturer = data.data
  
              // Populate form fields
              document.getElementById("lecturerFirstName").value = lecturer.firstName
              document.getElementById("lecturerLastName").value = lecturer.lastName
              document.getElementById("lecturerEmail").value = lecturer.email
              document.getElementById("lecturerPhone").value = lecturer.phone || ""
  
              // Set department if available
              if (lecturer.department) {
                document.getElementById("lecturerDepartment").value = lecturer.department
              }
  
              // Set courses if available and multi-select exists
              const coursesSelect = document.getElementById("lecturerCourses")
              if (coursesSelect && lecturer.courses && lecturer.courses.length > 0) {
                Array.from(coursesSelect.options).forEach((option) => {
                  option.selected = lecturer.courses.some((course) => course._id === option.value)
                })
              }
  
              // Show edit modal
              const modal = new bootstrap.Modal(document.getElementById("addLecturerModal"))
              modal.show()
  
              // Change form submission to update instead of create
              const form = document.getElementById("lecturerForm")
              form.setAttribute("data-id", lecturerId)
              form.querySelector('button[type="submit"]').textContent = "Update Lecturer"
            },
            (error) => {
              console.error("Error fetching lecturer details:", error)
              alert("Failed to load lecturer details")
            },
          )
        })
      })
  
      // Delete lecturer
      document.querySelectorAll(".delete-lecturer").forEach((button) => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this lecturer?")) {
            const lecturerId = button.getAttribute("data-id")
  
            fetch(`${API_URL}/users/lecturers/${lecturerId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok")
                }
                return response.json()
              })
              .then((data) => {
                alert("Lecturer deleted successfully")
                loadLecturers()
              })
              .catch((error) => {
                console.error("Error deleting lecturer:", error)
                alert("Failed to delete lecturer")
              })
          }
        })
      })
    }
  
    function addCourseActionListeners() {
      // Edit course
      document.querySelectorAll(".edit-course").forEach((button) => {
        button.addEventListener("click", () => {
          const courseId = button.getAttribute("data-id")
  
          // Fetch course details and populate edit form
          fetchData(
            `${API_URL}/courses/${courseId}`,
            (data) => {
              const course = data.data
  
              // Populate form fields
              document.getElementById("courseCode").value = course.courseCode
              document.getElementById("courseName").value = course.courseName
              document.getElementById("courseDescription").value = course.courseDescription
  
              // Show edit modal
              const modal = new bootstrap.Modal(document.getElementById("addCourseModal"))
              modal.show()
  
              // Change form submission to update instead of create
              const form = document.getElementById("addCourseForm")
              form.setAttribute("data-id", courseId)
              form.querySelector('button[type="submit"]').textContent = "Update Course"
            },
            (error) => {
              console.error("Error fetching course details:", error)
              alert("Failed to load course details")
            },
          )
        })
      })
  
      // Delete course
      document.querySelectorAll(".delete-course").forEach((button) => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this course?")) {
            const courseId = button.getAttribute("data-id")
  
            fetch(`${API_URL}/courses/${courseId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok")
                }
                return response.json()
              })
              .then((data) => {
                alert("Course deleted successfully")
                loadCourses()
              })
              .catch((error) => {
                console.error("Error deleting course:", error)
                alert("Failed to delete course")
              })
          }
        })
      })
    }
  
    function addFeeActionListeners() {
      // Update payment
      document.querySelectorAll(".update-payment").forEach((button) => {
        button.addEventListener("click", () => {
          const feeId = button.getAttribute("data-id")
  
          // Fetch fee details and populate update form
          fetchData(
            `${API_URL}/fees/${feeId}`,
            (data) => {
              const fee = data.data
  
              // Populate form fields
              document.getElementById("studentName").value = fee.student
                ? `${fee.student.firstName} ${fee.student.lastName}`
                : "N/A"
              document.getElementById("feeType").value = fee.feeType || ""
              document.getElementById("amountPaid").value = ""
              document.getElementById("paymentMethod").value = ""
              document.getElementById("transactionRef").value = ""
              document.getElementById("paymentDate").value = new Date().toISOString().split("T")[0]
              document.getElementById("remarks").value = ""
  
              // Set fee ID for form submission
              document.getElementById("updatePaymentForm").setAttribute("data-id", feeId)
            },
            (error) => {
              console.error("Error fetching fee details:", error)
              alert("Failed to load fee details")
            },
          )
        })
      })
  
      // View payment history
      document.querySelectorAll(".view-payments").forEach((button) => {
        button.addEventListener("click", () => {
          const feeId = button.getAttribute("data-id")
  
          // Fetch fee payment history
          fetchData(
            `${API_URL}/fees/${feeId}/payments`,
            (data) => {
              // Create and show payment history modal
              const modalHtml = `
              <div class="modal fade" id="paymentHistoryModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Payment History</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <h6>Student: ${data.data.student ? `${data.data.student.firstName} ${data.data.student.lastName}` : "N/A"}</h6>
                      <h6>Total Amount: $${data.data.amount ? data.data.amount.toLocaleString() : "0"}</h6>
                      <h6>Amount Paid: $${data.data.amountPaid ? data.data.amountPaid.toLocaleString() : "0"}</h6>
                      <h6>Balance: $${data.data.balance ? data.data.balance.toLocaleString() : "0"}</h6>
                      <hr>
                      <h6>Payment History:</h6>
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${
                            data.data.payments && data.data.payments.length > 0
                              ? data.data.payments
                                  .map(
                                    (payment) => `
                              <tr>
                                <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
                                <td>$${payment.amount.toLocaleString()}</td>
                                <td>${payment.paymentMethod}</td>
                                <td>${payment.transactionRef || "N/A"}</td>
                                <td>${payment.remarks || "N/A"}</td>
                              </tr>
                            `,
                                  )
                                  .join("")
                              : '<tr><td colspan="5" class="text-center">No payment history found</td></tr>'
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            `
  
              // Remove existing modal if any
              const existingModal = document.getElementById("paymentHistoryModal")
              if (existingModal) {
                existingModal.remove()
              }
  
              // Add modal to DOM
              document.body.insertAdjacentHTML("beforeend", modalHtml)
  
              // Show modal
              const modal = new bootstrap.Modal(document.getElementById("paymentHistoryModal"))
              modal.show()
            },
            (error) => {
              console.error("Error fetching payment history:", error)
              alert("Failed to load payment history")
            },
          )
        })
      })
    }
  
    function addEventActionListeners() {
      // Edit event
      document.querySelectorAll(".edit-event").forEach((button) => {
        button.addEventListener("click", () => {
          const eventId = button.getAttribute("data-id")
  
          // Fetch event details and populate edit form
          fetchData(
            `${API_URL}/events/${eventId}`,
            (data) => {
              const event = data.data
  
              // Populate form fields
              document.getElementById("eventName").value = event.name
              document.getElementById("eventDate").value = new Date(event.date).toISOString().split("T")[0]
              document.getElementById("eventLocation").value = event.location
              document.getElementById("eventDescription").value = event.description || ""
  
              // Show edit modal
              const modal = new bootstrap.Modal(document.getElementById("addEventModal"))
              modal.show()
  
              // Change form submission to update instead of create
              const form = document.getElementById("addEventForm")
              form.setAttribute("data-id", eventId)
              form.querySelector('button[type="submit"]').textContent = "Update Event"
            },
            (error) => {
              console.error("Error fetching event details:", error)
              alert("Failed to load event details")
            },
          )
        })
      })
  
      // Delete event
      document.querySelectorAll(".delete-event").forEach((button) => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this event?")) {
            const eventId = button.getAttribute("data-id")
  
            fetch(`${API_URL}/events/${eventId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok")
                }
                return response.json()
              })
              .then((data) => {
                alert("Event deleted successfully")
                loadEvents()
              })
              .catch((error) => {
                console.error("Error deleting event:", error)
                alert("Failed to delete event")
              })
          }
        })
      })
    }
  
    function addAdminActionListeners() {
      // Edit admin
      document.querySelectorAll(".edit-admin").forEach((button) => {
        button.addEventListener("click", () => {
          const adminId = button.getAttribute("data-id")
  
          // Fetch admin details and populate edit form
          fetchData(
            `${API_URL}/users/admins/${adminId}`,
            (data) => {
              const admin = data.data
  
              // Populate form fields
              document.getElementById("adminFirstName").value = admin.firstName
              document.getElementById("adminLastName").value = admin.lastName
              document.getElementById("adminEmail").value = admin.email
              document.getElementById("adminPhone").value = admin.phone || ""
              document.getElementById("adminPosition").value = admin.position || ""
  
              // Show edit modal
              const modal = new bootstrap.Modal(document.getElementById("addAdminModal"))
              modal.show()
  
              // Change form submission to update instead of create
              const form = document.getElementById("addAdminForm")
              form.setAttribute("data-id", adminId)
              form.querySelector('button[type="submit"]').textContent = "Update Administrator"
            },
            (error) => {
              console.error("Error fetching administrator details:", error)
              alert("Failed to load administrator details")
            },
          )
        })
      })
  
      // Delete admin
      document.querySelectorAll(".delete-admin").forEach((button) => {
        button.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this administrator?")) {
            const adminId = button.getAttribute("data-id")
  
            fetch(`${API_URL}/users/admins/${adminId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Network response was not ok")
                }
                return response.json()
              })
              .then((data) => {
                alert("Administrator deleted successfully")
                loadAdmins()
              })
              .catch((error) => {
                console.error("Error deleting administrator:", error)
                alert("Failed to delete administrator")
              })
          }
        })
      })
    }
  
    // ========== HELPER FUNCTIONS ==========
    function fetchData(url, successCallback, errorCallback) {
        fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.error(`Error: ${response.status} ${response.statusText}`);
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
          })
          .then((data) => {
            if (successCallback) successCallback(data);
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            if (errorCallback) errorCallback(error);
          });
      }
  
    function updatePagination(section, pagination) {
      const pageNum = document.getElementById(`page-num${section === "students" ? "" : "-" + section}`)
      const prevPageBtn = document.getElementById(`prev-page-btn${section === "students" ? "" : "-" + section}`)
      const nextPageBtn = document.getElementById(`next-page-btn${section === "students" ? "" : "-" + section}`)
  
      if (pageNum) pageNum.textContent = pagination ? pagination.page : 1
      if (prevPageBtn) prevPageBtn.disabled = !pagination || !pagination.hasPrev
      if (nextPageBtn) nextPageBtn.disabled = !pagination || !pagination.hasNext
    }
  
    function getFeeBadgeClass(status) {
      switch (status) {
        case "Paid":
          return "bg-success"
        case "Partial":
          return "bg-warning"
        case "Unpaid":
          return "bg-danger"
        default:
          return "bg-info"
      }
    }
  
    function getRandomColor() {
      const colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4"]
      return colors[Math.floor(Math.random() * colors.length)]
    }
  
    function initializeCharts(totalCollected) {
      setTimeout(() => {
        const totalDebt = 1000 // This would come from another API call in a real app
  
        const collectionBar = document.getElementById("collection-bar")
        const debtsBar = document.getElementById("debts-bar")
  
        if (collectionBar && debtsBar) {
          // Set heights proportionally
          const maxHeight = 150
          const maxValue = Math.max(totalCollected, totalDebt)
  
          collectionBar.style.height = `${(totalCollected / maxValue) * maxHeight}px`
          debtsBar.style.height = `${(totalDebt / maxValue) * maxHeight}px`
  
          // Update values
          const collectionValue = document.getElementById("collection-value")
          const debtValue = document.getElementById("debt-value")
  
          if (collectionValue) collectionValue.textContent = `$${totalCollected.toLocaleString()}`
          if (debtValue) debtValue.textContent = `$${totalDebt.toLocaleString()}`
        }
      }, 500)
    }
  
    function initializeCalendar() {
      const calendarEl = document.getElementById("calendar")
      if (calendarEl && window.FullCalendar) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          },
          height: 300,
          events: (info, successCallback, failureCallback) => {
            // Fetch events from API
            fetchData(
              `${API_URL}/events`,
              (data) => {
                const events = data.events.map((event) => ({
                  title: event.name,
                  start: event.date,
                  color: getRandomColor(),
                }))
                successCallback(events)
              },
              (error) => {
                console.error("Error fetching events for calendar:", error)
                failureCallback(error)
              },
            )
          },
        })
        calendar.render()
      }
    }
  
    function loadCountryOptions() {
      const countrySelect = document.getElementById("studentCountry");
    
      if (countrySelect) {
        countrySelect.innerHTML = '<option value="">Loading countries...</option>';
    
        fetch("https://restcountries.com/v3.1/all")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch countries");
            }
            return response.json();
          })
          .then((data) => {
            countrySelect.innerHTML = '<option value="">Select Country</option>';
    
            // Sort countries alphabetically by their common name
            const sortedCountries = data.sort((a, b) =>
              a.name.common.localeCompare(b.name.common)
            );
    
            sortedCountries.forEach((country) => {
              const option = document.createElement("option");
              option.value = country.name.common; // Use the common name of the country
              option.textContent = country.name.common;
              countrySelect.appendChild(option);
            });
          })
          .catch((error) => {
            console.error("Error loading countries:", error);
            countrySelect.innerHTML = '<option value="">Failed to load countries</option>';
          });
      }
    }
    function loadDropdownOptions() {
      // Load departments for lecturer form
      const departments = ["Computer Science", "Engineering", "Business", "Arts", "Health Sciences", "Medicine", "Law"]
      const departmentSelect = document.getElementById("lecturerDepartment")
  
      if (departmentSelect) {
        departmentSelect.innerHTML = '<option value="">Select Department</option>'
  
        departments.forEach((department) => {
          const option = document.createElement("option")
          option.value = department
          option.textContent = department
          departmentSelect.appendChild(option)
        })
      }
  
      // Load courses for student and lecturer forms
      fetchData(
        `${API_URL}/courses`,
        (data) => {
          const studentCourseSelect = document.getElementById("studentCourse")
          const lecturerCoursesSelect = document.getElementById("lecturerCourses")
  
          if (studentCourseSelect) {
            studentCourseSelect.innerHTML = '<option value="">Select Course</option>'
  
            data.data.forEach((course) => {
              const option = document.createElement("option")
              option.value = course._id
              option.textContent = `${course.courseCode} - ${course.courseName}`
              studentCourseSelect.appendChild(option)
            })
          }
  
          if (lecturerCoursesSelect) {
            lecturerCoursesSelect.innerHTML = '<option value="">Select Course</option>'
  
            data.data.forEach((course) => {
              const option = document.createElement("option")
              option.value = course._id
              option.textContent = `${course.courseCode} - ${course.courseName}`
              lecturerCoursesSelect.appendChild(option)
            })
          }
        },
        (error) => {
          console.error("Error loading courses:", error)
        },
      )
  
      // Load lecturers for student form
      fetchData(
        `${API_URL}/users/lecturers`,
        (data) => {
          const lecturerSelect = document.getElementById("studentLecturer")
  
          if (lecturerSelect) {
            lecturerSelect.innerHTML = '<option value="">Select Lecturer</option>'
  
            data.data.forEach((lecturer) => {
              const option = document.createElement("option")
              option.value = lecturer._id
              option.textContent = `${lecturer.firstName} ${lecturer.lastName}`
              lecturerSelect.appendChild(option)
            })
          }
        },
        (error) => {
          console.error("Error loading lecturers:", error)
        },

        //// Load countries for student form

      )
      loadCountryOptions();
    }
  
    // Initialize the dashboard
    init()
  })
  
  