document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
  
    // if (!token || !user || user.role !== "lecturer") {
    //   window.location.href = "index.html"
    //   return
    // }
  
    // Set user name in header
    document.querySelector(".user-name").textContent =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Lecturer"
  
    // Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const courseId = urlParams.get("id")
  
    if (!courseId) {
      window.location.href = "lecturer-dashboard.html"
      return
    }
  
    // API base URL
    const API_URL = "https://cesstig-sms.onrender.com"
  
    // Load course data
    loadCourseData(courseId)
  
    // Date and Time
    function updateTime() {
      const date = new Date()
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      const timeOptions = { hour: "numeric", minute: "numeric", second: "numeric", hour12: true }
  
      // Update all date/time elements
      document.querySelectorAll('[id$="current-date"]').forEach((el) => {
        el.textContent = date.toLocaleDateString("en-US", options)
      })
  
      document.querySelectorAll('[id$="current-time"]').forEach((el) => {
        el.textContent = date.toLocaleTimeString("en-US", timeOptions)
      })
    }
  
    updateTime()
    setInterval(updateTime, 1000)
  
    // Sidebar Collapse
    const sidebar = document.getElementById("sidebar")
    const sidebarCollapse = document.getElementById("sidebarCollapse")
    const mainContent = document.querySelector(".main-content")
  
    if (sidebarCollapse && sidebar) {
      sidebarCollapse.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed")
        // Save sidebar state to localStorage
        localStorage.setItem("sidebarState", sidebar.classList.contains("collapsed") ? "collapsed" : "expanded")
      })
  
      // Check if there's a saved state in localStorage
      const savedState = localStorage.getItem("sidebarState")
      if (savedState === "collapsed") {
        sidebar.classList.add("collapsed")
      }
    }
  
    // Menu Switching
    const menuItems = document.querySelectorAll(".menu-item")
    const dashboardContents = document.querySelectorAll(".dashboard-content")
  
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Handle main dashboard navigation
        if (item.getAttribute("data-target") === "#main-dashboard") {
          window.location.href = "lecturer-dashboard.html"
          return
        }
  
        // Remove active class from all menu items
        menuItems.forEach((menu) => menu.classList.remove("active"))
        // Add active class to the clicked menu item
        item.classList.add("active")
  
        // Hide all dashboard contents
        dashboardContents.forEach((content) => {
          content.style.display = "none"
        })
  
        // Show the target dashboard content
        const target = item.getAttribute("data-target")
        const targetContent = document.querySelector(target)
        if (targetContent) {
          targetContent.style.display = "block"
  
          // Load data based on the selected menu
          if (target === "#resources") {
            loadResources(courseId)
          } else if (target === "#assignments") {
            loadAssignments(courseId)
          } else if (target === "#tests-quizzes") {
            loadTestsQuizzes(courseId)
          } else if (target === "#submissions") {
            loadSubmissions(courseId)
          } else if (target === "#attendance") {
            loadAttendance(courseId)
          } else if (target === "#messages") {
            loadMessages(courseId)
          } else if (target === "#announcements") {
            loadAnnouncements(courseId)
          } else if (target === "#discussions") {
            loadDiscussions(courseId)
          }
        }
  
        // On mobile, collapse the sidebar after selection
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("active")
        }
  
        // Save active menu to localStorage
        localStorage.setItem("activeMenu", target)
      })
    })
  
    // Check if there's a saved active menu in localStorage
    const savedActiveMenu = localStorage.getItem("activeMenu")
    if (savedActiveMenu) {
      const activeMenuItem = document.querySelector(`.menu-item[data-target="${savedActiveMenu}"]`)
      if (activeMenuItem) {
        activeMenuItem.click()
      } else {
        // Show the default overview content if no saved state
        document.querySelector("#overview").style.display = "block"
      }
    } else {
      // Show the default overview content if no saved state
      document.querySelector("#overview").style.display = "block"
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
  
    // Mobile sidebar toggle
    const sidebarCollapseBtn = document.getElementById("sidebar-collapse")
    if (sidebarCollapseBtn) {
      sidebarCollapseBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active")
      })
    }
  
    // Edit course description
    const editDescriptionBtn = document.getElementById("edit-description-btn")
    const saveDescriptionBtn = document.getElementById("save-description-btn")
    const cancelDescriptionBtn = document.getElementById("cancel-description-btn")
  
    if (editDescriptionBtn) {
      editDescriptionBtn.addEventListener("click", () => {
        const descriptionText = document.getElementById("course-description").textContent
        document.getElementById("description-textarea").value = descriptionText
        document.getElementById("description-view").style.display = "none"
        document.getElementById("description-edit").style.display = "block"
      })
    }
  
    if (cancelDescriptionBtn) {
      cancelDescriptionBtn.addEventListener("click", () => {
        document.getElementById("description-view").style.display = "block"
        document.getElementById("description-edit").style.display = "none"
      })
    }
  
    if (saveDescriptionBtn) {
      saveDescriptionBtn.addEventListener("click", (e) => {
        e.preventDefault()
        updateCourseDescription(courseId)
      })
    }
  
    // Modal event listeners
    // Add Resource
    const addResourceBtn = document.getElementById("add-resource-btn")
    const addResourceSubmitBtn = document.getElementById("add-resource-submit-btn")
  
    if (addResourceBtn) {
      addResourceBtn.addEventListener("click", () => {
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newResourceModal"))
        modal.show()
      })
    }
  
    if (addResourceSubmitBtn) {
      addResourceSubmitBtn.addEventListener("click", () => {
        addResource(courseId)
      })
    }
  
    // Resource type change
    const resourceTypeSelect = document.getElementById("resource-type")
    if (resourceTypeSelect) {
      resourceTypeSelect.addEventListener("change", () => {
        const resourceType = resourceTypeSelect.value
        const fileContainer = document.getElementById("resource-file-container")
        const linkContainer = document.getElementById("resource-link-container")
  
        if (resourceType === "link") {
          fileContainer.style.display = "none"
          linkContainer.style.display = "block"
        } else {
          fileContainer.style.display = "block"
          linkContainer.style.display = "none"
        }
      })
    }
  
    // Add Assignment
    const addAssignmentBtn = document.getElementById("add-assignment-btn")
    const createAssignmentBtn = document.getElementById("create-assignment-btn")
  
    if (addAssignmentBtn) {
      addAssignmentBtn.addEventListener("click", () => {
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newAssignmentModal"))
        modal.show()
      })
    }
  
    if (createAssignmentBtn) {
      createAssignmentBtn.addEventListener("click", () => {
        createAssignment(courseId)
      })
    }
  
    // Add Test/Quiz
    const addTestBtn = document.getElementById("add-test-btn")
    const createTestBtn = document.getElementById("create-test-btn")
    const addQuestionBtn = document.getElementById("add-question-btn")
  
    if (addTestBtn) {
      addTestBtn.addEventListener("click", () => {
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newTestModal"))
        modal.show()
      })
    }
  
    if (createTestBtn) {
      createTestBtn.addEventListener("click", () => {
        createTest(courseId)
      })
    }
  
    if (addQuestionBtn) {
      addQuestionBtn.addEventListener("click", () => {
        addQuestion()
      })
    }
  
    // Take Attendance
    const takeAttendanceBtn = document.getElementById("take-attendance-btn")
    const saveAttendanceBtn = document.getElementById("save-attendance-btn")
  
    if (takeAttendanceBtn) {
      takeAttendanceBtn.addEventListener("click", () => {
        loadStudentsForAttendance(courseId)
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("takeAttendanceModal"))
        modal.show()
      })
    }
  
    if (saveAttendanceBtn) {
      saveAttendanceBtn.addEventListener("click", () => {
        saveAttendance(courseId)
      })
    }
  
    // New Message
    const newMessageBtn = document.getElementById("new-message-btn")
    const sendMessageBtn = document.getElementById("send-message-btn")
  
    if (newMessageBtn) {
      newMessageBtn.addEventListener("click", () => {
        loadStudentsForMessage(courseId)
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newMessageModal"))
        modal.show()
      })
    }
  
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener("click", () => {
        sendNewMessage(courseId)
      })
    }
  
    // New Announcement
    const addAnnouncementBtn = document.getElementById("add-announcement-btn")
    const postAnnouncementBtn = document.getElementById("post-announcement-btn")
  
    if (addAnnouncementBtn) {
      addAnnouncementBtn.addEventListener("click", () => {
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newAnnouncementModal"))
        modal.show()
      })
    }
  
    if (postAnnouncementBtn) {
      postAnnouncementBtn.addEventListener("click", () => {
        postAnnouncement(courseId)
      })
    }
  
    // New Discussion Topic
    const addTopicBtn = document.getElementById("add-topic-btn")
    const createTopicBtn = document.getElementById("create-topic-btn")
  
    if (addTopicBtn) {
      addTopicBtn.addEventListener("click", () => {
        // Declare bootstrap here
        const bootstrap = window.bootstrap
        const modal = new bootstrap.Modal(document.getElementById("newTopicModal"))
        modal.show()
      })
    }
  
    if (createTopicBtn) {
      createTopicBtn.addEventListener("click", () => {
        createNewTopic(courseId)
      })
    }
  
    // Load course data
    async function loadCourseData(courseId) {
      try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          headers: {
            "x-auth-token": token,
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch course data")
        }
  
        const data = await response.json()
        const course = data.data
  
        // Update course information
        document.getElementById("course-title").textContent = course.courseName
        document.getElementById("course-code").textContent = course.courseCode
        document.getElementById("header-course-title").textContent = course.courseName
        document.getElementById("header-course-code").textContent = course.courseCode
  
        // Update student count if available
        if (course.students) {
          document.getElementById("students-count").textContent = `${course.students.length} Students`
          document.getElementById("student-count").textContent = course.students.length
        } else {
          document.getElementById("students-count").textContent = "0 Students"
          document.getElementById("student-count").textContent = "0"
        }
  
        // Update course description
        document.getElementById("course-description").textContent =
          course.courseDescription || "No description available."
  
        // Load course statistics
        loadCourseStatistics(courseId)
  
        // Load recent activity
        loadRecentActivity(courseId)
      } catch (error) {
        console.error("Error loading course data:", error)
        alert("Failed to load course data. Please try again later.")
      }
    }
  
    // Update course description
    async function updateCourseDescription(courseId) {
      try {
        const description = document.getElementById("description-textarea").value
  
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            courseDescription: description,
          }),
        })
  
        if (!response.ok) {
          throw new Error("Failed to update course description")
        }
  
        // Update the displayed description
        document.getElementById("course-description").textContent = description
  
        // Hide the edit form and show the view
        document.getElementById("description-view").style.display = "block"
        document.getElementById("description-edit").style.display = "none"
  
        alert("Course description updated successfully!")
      } catch (error) {
        console.error("Error updating course description:", error)
        alert("Failed to update course description. Please try again later.")
      }
    }
  
    // Load course statistics
    async function loadCourseStatistics(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some statistics data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        // Update assignment count
        const assignmentCountElement = document.getElementById("assignment-count")
        if (assignmentCountElement) {
          assignmentCountElement.textContent = "3"
        }
  
        // Update test count
        const testCountElement = document.getElementById("test-count")
        if (testCountElement) {
          testCountElement.textContent = "2"
        }
  
        // Update submission count
        const submissionCountElement = document.getElementById("submission-count")
        if (submissionCountElement) {
          submissionCountElement.textContent = "15"
        }
      } catch (error) {
        console.error("Error loading course statistics:", error)
      }
    }
  
    // Load recent activity
    async function loadRecentActivity(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some activity data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const activityData = [
          {
            type: "submission",
            user: "John Doe",
            action: "submitted Assignment 1",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            type: "enrollment",
            user: "Jane Smith",
            action: "enrolled in the course",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            type: "quiz",
            user: "Bob Johnson",
            action: "completed Quiz 1",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
        ]
  
        const activityList = document.getElementById("recent-activity")
  
        if (activityData.length === 0) {
          activityList.innerHTML = '<li class="list-group-item text-center">No recent activity</li>'
          return
        }
  
        activityList.innerHTML = ""
  
        activityData.forEach((activity) => {
          const activityItem = document.createElement("li")
          activityItem.className = "list-group-item"
  
          let iconClass = "fas fa-bell"
  
          if (activity.type === "submission") {
            iconClass = "fas fa-file-upload"
          } else if (activity.type === "enrollment") {
            iconClass = "fas fa-user-plus"
          } else if (activity.type === "quiz") {
            iconClass = "fas fa-clipboard-check"
          }
  
          activityItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <i class="${iconClass} me-2 text-primary"></i>
                <span><strong>${activity.user}</strong> ${activity.action}</span>
              </div>
              <span class="text-muted">${formatTimeAgo(activity.timestamp)}</span>
            </div>
          `
  
          activityList.appendChild(activityItem)
        })
      } catch (error) {
        console.error("Error loading recent activity:", error)
      }
    }
  
    // Load resources
    async function loadResources(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some resource data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const resourcesData = [
          {
            id: 1,
            title: "Course Syllabus",
            type: "document",
            fileType: "pdf",
            uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            size: "256 KB",
          },
          {
            id: 2,
            title: "Introduction to the Course",
            type: "video",
            fileType: "mp4",
            uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
            size: "45 MB",
          },
          {
            id: 3,
            title: "Recommended Reading",
            type: "link",
            url: "https://example.com/reading",
            uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
        ]
  
        const resourcesList = document.getElementById("resources-list")
  
        if (resourcesData.length === 0) {
          resourcesList.innerHTML = '<div class="text-center"><p>No resources available</p></div>'
          return
        }
  
        resourcesList.innerHTML = ""
  
        resourcesData.forEach((resource) => {
          const resourceItem = document.createElement("div")
          resourceItem.className = "resource-item"
  
          let iconClass = "fas fa-file"
  
          if (resource.type === "document") {
            if (resource.fileType === "pdf") {
              iconClass = "fas fa-file-pdf"
            } else if (resource.fileType === "doc" || resource.fileType === "docx") {
              iconClass = "fas fa-file-word"
            } else if (resource.fileType === "ppt" || resource.fileType === "pptx") {
              iconClass = "fas fa-file-powerpoint"
            } else if (resource.fileType === "xls" || resource.fileType === "xlsx") {
              iconClass = "fas fa-file-excel"
            }
          } else if (resource.type === "video") {
            iconClass = "fas fa-video"
          } else if (resource.type === "link") {
            iconClass = "fas fa-link"
          }
  
          resourceItem.innerHTML = `
            <div class="resource-icon">
              <i class="${iconClass}"></i>
            </div>
            <div class="resource-details">
              <div class="resource-title">${resource.title}</div>
              <div class="resource-meta">
                <span>Added: ${resource.uploadDate.toLocaleDateString()}</span>
                ${resource.size ? `<span>Size: ${resource.size}</span>` : ""}
              </div>
            </div>
            <div class="resource-actions">
              <button class="btn btn-sm btn-primary download-resource me-2" data-id="${resource.id}">
                <i class="fas fa-download"></i> Download
              </button>
              <button class="btn btn-sm btn-danger delete-resource" data-id="${resource.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          `
  
          resourcesList.appendChild(resourceItem)
        })
  
        // Add event listeners to download buttons
        document.querySelectorAll(".download-resource").forEach((button) => {
          button.addEventListener("click", (e) => {
            const resourceId = e.currentTarget.getAttribute("data-id")
            downloadResource(resourceId)
          })
        })
  
        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-resource").forEach((button) => {
          button.addEventListener("click", (e) => {
            const resourceId = e.currentTarget.getAttribute("data-id")
            deleteResource(resourceId, courseId)
          })
        })
      } catch (error) {
        console.error("Error loading resources:", error)
      }
    }
  
    // Add resource
    function addResource(courseId) {
      const title = document.getElementById("resource-title").value
      const type = document.getElementById("resource-type").value
      const description = document.getElementById("resource-description").value
  
      if (!title || !type) {
        alert("Please fill in all required fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Resource added successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newResourceModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-resource-form").reset()
  
      // Reload resources
      loadResources(courseId)
    }
  
    // Download resource
    function downloadResource(resourceId) {
      alert(`Downloading resource ${resourceId}...`)
      // In a real application, this would initiate a file download
    }
  
    // Delete resource
    function deleteResource(resourceId, courseId) {
      if (confirm("Are you sure you want to delete this resource?")) {
        // This would be an API call in a real application
        alert(`Resource ${resourceId} deleted successfully!`)
  
        // Reload resources
        loadResources(courseId)
      }
    }
  
    // Load assignments
    async function loadAssignments(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some assignment data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const assignmentsData = [
          {
            id: 1,
            title: "Assignment 1: Introduction",
            description: "Write a 500-word essay introducing yourself and your expectations for this course.",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            points: 10,
            submissions: 5,
          },
          {
            id: 2,
            title: "Assignment 2: Research Paper",
            description: "Research and write a 1000-word paper on a topic of your choice related to the course.",
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            points: 20,
            submissions: 0,
          },
          {
            id: 3,
            title: "Assignment 3: Group Project",
            description: "Work in groups of 3-4 to create a presentation on the assigned topic.",
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            points: 30,
            submissions: 10,
          },
        ]
  
        const assignmentsList = document.getElementById("assignments-list")
  
        if (assignmentsData.length === 0) {
          assignmentsList.innerHTML = '<div class="text-center"><p>No assignments available</p></div>'
          return
        }
  
        assignmentsList.innerHTML = ""
  
        assignmentsData.forEach((assignment) => {
          const assignmentItem = document.createElement("div")
          assignmentItem.className = "assignment-item"
  
          assignmentItem.innerHTML = `
            <div class="assignment-header">
              <div class="assignment-title">${assignment.title}</div>
            </div>
            <div class="assignment-meta">
              <div><i class="fas fa-calendar-alt me-1"></i> Due: ${assignment.dueDate.toLocaleDateString()}</div>
              <div><i class="fas fa-star me-1"></i> Points: ${assignment.points}</div>
              <div><i class="fas fa-file-upload me-1"></i> Submissions: ${assignment.submissions}</div>
            </div>
            <div class="assignment-description">${assignment.description}</div>
            <div class="assignment-actions mt-3">
              <button class="btn btn-sm btn-primary view-submissions me-2" data-id="${assignment.id}">
                <i class="fas fa-eye me-1"></i> View Submissions
              </button>
              <button class="btn btn-sm btn-warning edit-assignment me-2" data-id="${assignment.id}">
                <i class="fas fa-edit me-1"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger delete-assignment" data-id="${assignment.id}">
                <i class="fas fa-trash me-1"></i> Delete
              </button>
            </div>
          `
  
          assignmentsList.appendChild(assignmentItem)
        })
  
        // Add event listeners to view submissions buttons
        document.querySelectorAll(".view-submissions").forEach((button) => {
          button.addEventListener("click", (e) => {
            const assignmentId = e.currentTarget.getAttribute("data-id")
            viewAssignmentSubmissions(assignmentId)
          })
        })
  
        // Add event listeners to edit buttons
        document.querySelectorAll(".edit-assignment").forEach((button) => {
          button.addEventListener("click", (e) => {
            const assignmentId = e.currentTarget.getAttribute("data-id")
            editAssignment(assignmentId)
          })
        })
  
        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-assignment").forEach((button) => {
          button.addEventListener("click", (e) => {
            const assignmentId = e.currentTarget.getAttribute("data-id")
            deleteAssignment(assignmentId, courseId)
          })
        })
      } catch (error) {
        console.error("Error loading assignments:", error)
      }
    }
  
    // Create assignment
    function createAssignment(courseId) {
      const title = document.getElementById("assignment-title").value
      const description = document.getElementById("assignment-description").value
      const dueDate = document.getElementById("assignment-due-date").value
      const points = document.getElementById("assignment-points").value
  
      if (!title || !description || !dueDate || !points) {
        alert("Please fill in all required fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Assignment created successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newAssignmentModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-assignment-form").reset()
  
      // Reload assignments
      loadAssignments(courseId)
    }
  
    // View assignment submissions
    function viewAssignmentSubmissions(assignmentId) {
      // Navigate to submissions tab and filter by assignment
      document.querySelector('.menu-item[data-target="#submissions"]').click()
  
      // In a real application, this would filter the submissions by assignment
      alert(`Viewing submissions for assignment ${assignmentId}...`)
    }
  
    // Edit assignment
    function editAssignment(assignmentId) {
      alert(`Editing assignment ${assignmentId}...`)
      // In a real application, this would open a modal with the assignment details for editing
    }
  
    // Delete assignment
    function deleteAssignment(assignmentId, courseId) {
      if (confirm("Are you sure you want to delete this assignment?")) {
        // This would be an API call in a real application
        alert(`Assignment ${assignmentId} deleted successfully!`)
  
        // Reload assignments
        loadAssignments(courseId)
      }
    }
  
    // Load tests and quizzes
    async function loadTestsQuizzes(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some test/quiz data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const testsData = [
          {
            id: 1,
            title: "Quiz 1: Basic Concepts",
            description: "A short quiz to test your understanding of the basic concepts covered in the first two weeks.",
            startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
            duration: 30, // minutes
            points: 10,
            submissions: 0,
          },
          {
            id: 2,
            title: "Midterm Exam",
            description: "A comprehensive exam covering all topics from the first half of the course.",
            startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Same day
            duration: 120, // minutes
            points: 50,
            submissions: 0,
          },
          {
            id: 3,
            title: "Quiz 2: Advanced Topics",
            description: "A quiz on the advanced topics covered in weeks 5-7.",
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
            duration: 45, // minutes
            points: 15,
            submissions: 12,
          },
        ]
  
        const testsList = document.getElementById("tests-list")
  
        if (testsData.length === 0) {
          testsList.innerHTML = '<div class="text-center"><p>No tests or quizzes available</p></div>'
          return
        }
  
        testsList.innerHTML = ""
  
        testsData.forEach((test) => {
          const testItem = document.createElement("div")
          testItem.className = "test-item"
  
          testItem.innerHTML = `
            <div class="test-header">
              <div class="test-title">${test.title}</div>
            </div>
            <div class="test-meta">
              <div><i class="fas fa-calendar-alt me-1"></i> ${test.startDate.toLocaleDateString()} - ${test.endDate.toLocaleDateString()}</div>
              <div><i class="fas fa-clock me-1"></i> ${test.duration} minutes</div>
              <div><i class="fas fa-star me-1"></i> ${test.points} points</div>
              <div><i class="fas fa-file-upload me-1"></i> Submissions: ${test.submissions}</div>
            </div>
            <div class="test-description">${test.description}</div>
            <div class="test-actions mt-3">
              <button class="btn btn-sm btn-primary view-results me-2" data-id="${test.id}">
                <i class="fas fa-eye me-1"></i> View Results
              </button>
              <button class="btn btn-sm btn-warning edit-test me-2" data-id="${test.id}">
                <i class="fas fa-edit me-1"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger delete-test" data-id="${test.id}">
                <i class="fas fa-trash me-1"></i> Delete
              </button>
            </div>
          `
  
          testsList.appendChild(testItem)
        })
  
        // Add event listeners to view results buttons
        document.querySelectorAll(".view-results").forEach((button) => {
          button.addEventListener("click", (e) => {
            const testId = e.currentTarget.getAttribute("data-id")
            viewTestResults(testId)
          })
        })
  
        // Add event listeners to edit buttons
        document.querySelectorAll(".edit-test").forEach((button) => {
          button.addEventListener("click", (e) => {
            const testId = e.currentTarget.getAttribute("data-id")
            editTest(testId)
          })
        })
  
        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-test").forEach((button) => {
          button.addEventListener("click", (e) => {
            const testId = e.currentTarget.getAttribute("data-id")
            deleteTest(testId, courseId)
          })
        })
      } catch (error) {
        console.error("Error loading tests and quizzes:", error)
      }
    }
  
    // Create test/quiz
    function createTest(courseId) {
      const title = document.getElementById("test-title").value
      const description = document.getElementById("test-description").value
      const startDate = document.getElementById("test-start-date").value
      const endDate = document.getElementById("test-end-date").value
      const duration = document.getElementById("test-duration").value
      const points = document.getElementById("test-points").value
  
      if (!title || !description || !startDate || !endDate || !duration || !points) {
        alert("Please fill in all required fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Test/Quiz created successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newTestModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-test-form").reset()
      document.getElementById("questions-container").innerHTML =
        '<div class="text-center mb-3"><p>No questions added yet</p></div>'
  
      // Reload tests and quizzes
      loadTestsQuizzes(courseId)
    }
  
    // Add question to test/quiz
    function addQuestion() {
      const questionsContainer = document.getElementById("questions-container")
  
      // Remove the "No questions added yet" message if it exists
      if (questionsContainer.querySelector(".text-center")) {
        questionsContainer.innerHTML = ""
      }
  
      const questionId = Date.now() // Generate a unique ID for the question
  
      const questionContainer = document.createElement("div")
      questionContainer.className = "question-container"
      questionContainer.setAttribute("data-id", questionId)
  
      questionContainer.innerHTML = `
        <div class="question-header">
          <div class="question-type">
            <select class="form-select form-select-sm" name="question-type-${questionId}">
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>
          <div class="question-actions">
            <button type="button" class="btn btn-sm btn-danger remove-question" data-id="${questionId}">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>
        <div class="question-text mt-2">
          <textarea class="form-control" name="question-text-${questionId}" rows="2" placeholder="Enter question text"></textarea>
        </div>
        <div class="question-options mt-2" id="question-options-${questionId}">
          <div class="question-option">
            <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-1" value="1">
            <input type="text" class="form-control form-control-sm" name="option-${questionId}-1" placeholder="Option 1">
          </div>
          <div class="question-option">
            <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-2" value="2">
            <input type="text" class="form-control form-control-sm" name="option-${questionId}-2" placeholder="Option 2">
          </div>
          <div class="question-option">
            <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-3" value="3">
            <input type="text" class="form-control form-control-sm" name="option-${questionId}-3" placeholder="Option 3">
          </div>
          <div class="question-option">
            <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-4" value="4">
            <input type="text" class="form-control form-control-sm" name="option-${questionId}-4" placeholder="Option 4">
          </div>
        </div>
        <div class="mt-2">
          <button type="button" class="btn btn-sm btn-outline-primary add-option" data-id="${questionId}">
            <i class="fas fa-plus"></i> Add Option
          </button>
        </div>
      `
  
      questionsContainer.appendChild(questionContainer)
  
      // Add event listener to remove question button
      questionContainer.querySelector(".remove-question").addEventListener("click", () => {
        questionContainer.remove()
  
        // If there are no more questions, show the "No questions added yet" message
        if (questionsContainer.children.length === 0) {
          questionsContainer.innerHTML = '<div class="text-center mb-3"><p>No questions added yet</p></div>'
        }
      })
  
      // Add event listener to add option button
      questionContainer.querySelector(".add-option").addEventListener("click", () => {
        const optionsContainer = document.getElementById(`question-options-${questionId}`)
        const optionCount = optionsContainer.children.length + 1
  
        const optionDiv = document.createElement("div")
        optionDiv.className = "question-option"
  
        optionDiv.innerHTML = `
          <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-${optionCount}" value="${optionCount}">
          <input type="text" class="form-control form-control-sm" name="option-${questionId}-${optionCount}" placeholder="Option ${optionCount}">
        `
  
        optionsContainer.appendChild(optionDiv)
      })
  
      // Add event listener to question type select
      questionContainer.querySelector('select[name^="question-type"]').addEventListener("change", (e) => {
        const questionType = e.target.value
        const optionsContainer = document.getElementById(`question-options-${questionId}`)
        const addOptionButton = questionContainer.querySelector(".add-option")
  
        if (questionType === "true-false") {
          optionsContainer.innerHTML = `
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-1" value="1">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-1" value="True" readonly>
            </div>
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-2" value="2">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-2" value="False" readonly>
            </div>
          `
          addOptionButton.style.display = "none"
        } else if (questionType === "short-answer") {
          optionsContainer.innerHTML = `
            <div class="form-group">
              <label>Correct Answer:</label>
              <input type="text" class="form-control" name="correct-answer-${questionId}" placeholder="Enter the correct answer">
            </div>
          `
          addOptionButton.style.display = "none"
        } else {
          // Reset to multiple choice
          optionsContainer.innerHTML = `
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-1" value="1">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-1" placeholder="Option 1">
            </div>
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-2" value="2">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-2" placeholder="Option 2">
            </div>
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-3" value="3">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-3" placeholder="Option 3">
            </div>
            <div class="question-option">
              <input type="radio" name="correct-option-${questionId}" id="option-${questionId}-4" value="4">
              <input type="text" class="form-control form-control-sm" name="option-${questionId}-4" placeholder="Option 4">
            </div>
          `
          addOptionButton.style.display = "block"
        }
      })
    }
  
    // View test results
    function viewTestResults(testId) {
      alert(`Viewing results for test ${testId}...`)
      // In a real application, this would show the test results
    }
  
    // Edit test
    function editTest(testId) {
      alert(`Editing test ${testId}...`)
      // In a real application, this would open a modal with the test details for editing
    }
  
    // Delete test
    function deleteTest(testId, courseId) {
      if (confirm("Are you sure you want to delete this test?")) {
        // This would be an API call in a real application
        alert(`Test ${testId} deleted successfully!`)
  
        // Reload tests and quizzes
        loadTestsQuizzes(courseId)
      }
    }
  
    // Load submissions
    async function loadSubmissions(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some submission data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const submissionsData = [
          {
            id: 1,
            student: "John Doe",
            assignment: "Assignment 1: Introduction",
            submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: "pending",
            grade: null,
          },
          {
            id: 2,
            student: "Jane Smith",
            assignment: "Assignment 1: Introduction",
            submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            status: "graded",
            grade: "A",
          },
          {
            id: 3,
            student: "Bob Johnson",
            assignment: "Assignment 1: Introduction",
            submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: "pending",
            grade: null,
          },
          {
            id: 4,
            student: "Alice Williams",
            assignment: "Quiz 2: Advanced Topics",
            submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            status: "graded",
            grade: "B+",
          },
        ]
  
        const submissionsTableBody = document.getElementById("submissions-table-body")
  
        if (submissionsData.length === 0) {
          submissionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No submissions available</td></tr>'
          return
        }
  
        submissionsTableBody.innerHTML = ""
  
        submissionsData.forEach((submission) => {
          const row = document.createElement("tr")
  
          let statusBadgeClass = ""
  
          if (submission.status === "pending") {
            statusBadgeClass = "status-badge pending"
          } else if (submission.status === "graded") {
            statusBadgeClass = "status-badge graded"
          } else if (submission.status === "late") {
            statusBadgeClass = "status-badge late"
          }
  
          row.innerHTML = `
            <td>${submission.student}</td>
            <td>${submission.assignment}</td>
            <td>${submission.submittedDate.toLocaleDateString()}</td>
            <td><span class="${statusBadgeClass}">${submission.status}</span></td>
            <td>${submission.grade || "-"}</td>
            <td>
              <button class="btn btn-sm btn-primary view-submission me-2" data-id="${submission.id}">
                <i class="fas fa-eye"></i> View
              </button>
              ${
                submission.status === "pending"
                  ? `<button class="btn btn-sm btn-success grade-submission" data-id="${submission.id}">
                  <i class="fas fa-check"></i> Grade
                </button>`
                  : `<button class="btn btn-sm btn-warning edit-grade" data-id="${submission.id}">
                  <i class="fas fa-edit"></i> Edit
                </button>`
              }
            </td>
          `
  
          submissionsTableBody.appendChild(row)
        })
  
        // Add event listeners to view submission buttons
        document.querySelectorAll(".view-submission").forEach((button) => {
          button.addEventListener("click", (e) => {
            const submissionId = e.currentTarget.getAttribute("data-id")
            viewSubmission(submissionId)
          })
        })
  
        // Add event listeners to grade submission buttons
        document.querySelectorAll(".grade-submission").forEach((button) => {
          button.addEventListener("click", (e) => {
            const submissionId = e.currentTarget.getAttribute("data-id")
            gradeSubmission(submissionId)
          })
        })
  
        // Add event listeners to edit grade buttons
        document.querySelectorAll(".edit-grade").forEach((button) => {
          button.addEventListener("click", (e) => {
            const submissionId = e.currentTarget.getAttribute("data-id")
            editGrade(submissionId)
          })
        })
      } catch (error) {
        console.error("Error loading submissions:", error)
      }
    }
  
    // View submission
    function viewSubmission(submissionId) {
      alert(`Viewing submission ${submissionId}...`)
      // In a real application, this would show the submission details
    }
  
    // Grade submission
    function gradeSubmission(submissionId) {
      alert(`Grading submission ${submissionId}...`)
      // In a real application, this would open a modal for grading the submission
    }
  
    // Edit grade
    function editGrade(submissionId) {
      alert(`Editing grade for submission ${submissionId}...`)
      // In a real application, this would open a modal for editing the grade
    }
  
    // Load attendance
    async function loadAttendance(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some attendance data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const attendanceData = [
          {
            id: 1,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            present: 15,
            absent: 5,
            percentage: 75,
          },
          {
            id: 2,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            present: 18,
            absent: 2,
            percentage: 90,
          },
          {
            id: 3,
            date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
            present: 16,
            absent: 4,
            percentage: 80,
          },
        ]
  
        const attendanceTableBody = document.getElementById("attendance-table-body")
  
        if (attendanceData.length === 0) {
          attendanceTableBody.innerHTML =
            '<tr><td colspan="5" class="text-center">No attendance records available</td></tr>'
          return
        }
  
        attendanceTableBody.innerHTML = ""
  
        attendanceData.forEach((record) => {
          const row = document.createElement("tr")
  
          row.innerHTML = `
            <td>${record.date.toLocaleDateString()}</td>
            <td>${record.present}</td>
            <td>${record.absent}</td>
            <td>${record.percentage}%</td>
            <td>
              <button class="btn btn-sm btn-primary view-attendance me-2" data-id="${record.id}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn btn-sm btn-warning edit-attendance" data-id="${record.id}">
                <i class="fas fa-edit"></i> Edit
              </button>
            </td>
          `
  
          attendanceTableBody.appendChild(row)
        })
  
        // Add event listeners to view attendance buttons
        document.querySelectorAll(".view-attendance").forEach((button) => {
          button.addEventListener("click", (e) => {
            const attendanceId = e.currentTarget.getAttribute("data-id")
            viewAttendance(attendanceId)
          })
        })
  
        // Add event listeners to edit attendance buttons
        document.querySelectorAll(".edit-attendance").forEach((button) => {
          button.addEventListener("click", (e) => {
            const attendanceId = e.currentTarget.getAttribute("data-id")
            editAttendance(attendanceId)
          })
        })
      } catch (error) {
        console.error("Error loading attendance:", error)
      }
    }
  
    // Load students for attendance
    async function loadStudentsForAttendance(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some student data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const studentsData = [
          {
            id: 1,
            name: "John Doe",
          },
          {
            id: 2,
            name: "Jane Smith",
          },
          {
            id: 3,
            name: "Bob Johnson",
          },
          {
            id: 4,
            name: "Alice Williams",
          },
          {
            id: 5,
            name: "Charlie Brown",
          },
        ]
  
        const studentsAttendanceList = document.getElementById("students-attendance-list")
  
        if (studentsData.length === 0) {
          studentsAttendanceList.innerHTML = '<div class="text-center"><p>No students enrolled in this course</p></div>'
          return
        }
  
        studentsAttendanceList.innerHTML = ""
  
        studentsData.forEach((student) => {
          const studentItem = document.createElement("div")
          studentItem.className = "attendance-student"
  
          studentItem.innerHTML = `
            <div class="attendance-student-name">${student.name}</div>
            <div class="attendance-options">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="attendance-${student.id}" id="present-${student.id}" value="present" checked>
                <label class="form-check-label" for="present-${student.id}">Present</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="attendance-${student.id}" id="absent-${student.id}" value="absent">
                <label class="form-check-label" for="absent-${student.id}">Absent</label>
              </div>
            </div>
          `
  
          studentsAttendanceList.appendChild(studentItem)
        })
  
        // Set the attendance date to today
        const today = new Date().toISOString().split("T")[0]
        document.getElementById("attendance-date").value = today
      } catch (error) {
        console.error("Error loading students for attendance:", error)
      }
    }
  
    // Save attendance
    function saveAttendance(courseId) {
      const date = document.getElementById("attendance-date").value
  
      if (!date) {
        alert("Please select a date")
        return
      }
  
      // This would be an API call in a real application
      alert("Attendance saved successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("takeAttendanceModal"))
      modal.hide()
  
      // Reload attendance
      loadAttendance(courseId)
    }
  
    // View attendance
    function viewAttendance(attendanceId) {
      alert(`Viewing attendance record ${attendanceId}...`)
      // In a real application, this would show the attendance details
    }
  
    // Edit attendance
    function editAttendance(attendanceId) {
      alert(`Editing attendance record ${attendanceId}...`)
      // In a real application, this would open a modal for editing the attendance
    }
  
    // Load messages
    async function loadMessages(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some message data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const conversationsData = [
          {
            id: 1,
            with: "John Doe",
            lastMessage: "Thank you for your feedback on my assignment. I will make the suggested revisions.",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            unread: true,
          },
          {
            id: 2,
            with: "Jane Smith",
            lastMessage:
              "I have a question about the upcoming quiz. Could you please clarify the topics that will be covered?",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            unread: false,
          },
          {
            id: 3,
            with: "All Students",
            lastMessage: "Reminder: The deadline for Assignment 2 is next Friday.",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            unread: false,
          },
        ]
  
        const conversationsList = document.getElementById("conversations-list")
  
        if (conversationsData.length === 0) {
          conversationsList.innerHTML = '<div class="list-group-item text-center"><p>No conversations</p></div>'
          return
        }
  
        conversationsList.innerHTML = ""
  
        conversationsData.forEach((conversation) => {
          const conversationItem = document.createElement("div")
          conversationItem.className = `list-group-item conversation-item ${conversation.unread ? "fw-bold" : ""}`
          conversationItem.setAttribute("data-id", conversation.id)
  
          conversationItem.innerHTML = `
            <div class="conversation-header">
              <div class="conversation-name">${conversation.with}</div>
              <div class="conversation-date">${formatDate(conversation.date)}</div>
            </div>
            <div class="conversation-preview">${conversation.lastMessage}</div>
          `
  
          conversationsList.appendChild(conversationItem)
        })
  
        // Add event listeners to conversation items
        document.querySelectorAll(".conversation-item").forEach((item) => {
          item.addEventListener("click", () => {
            // Remove active class from all conversation items
            document.querySelectorAll(".conversation-item").forEach((i) => i.classList.remove("active"))
            // Add active class to clicked item
            item.classList.add("active")
  
            const conversationId = item.getAttribute("data-id")
            loadConversation(conversationId)
          })
        })
      } catch (error) {
        console.error("Error loading messages:", error)
      }
    }
  
    // Load students for message
    async function loadStudentsForMessage(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some student data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const studentsData = [
          {
            id: 1,
            name: "John Doe",
          },
          {
            id: 2,
            name: "Jane Smith",
          },
          {
            id: 3,
            name: "Bob Johnson",
          },
          {
            id: 4,
            name: "Alice Williams",
          },
          {
            id: 5,
            name: "Charlie Brown",
          },
        ]
  
        const recipientSelect = document.getElementById("message-recipient")
  
        // Clear existing options except the first two (empty and "All Students")
        while (recipientSelect.options.length > 2) {
          recipientSelect.remove(2)
        }
  
        // Add student options
        studentsData.forEach((student) => {
          const option = document.createElement("option")
          option.value = student.id
          option.textContent = student.name
          recipientSelect.appendChild(option)
        })
      } catch (error) {
        console.error("Error loading students for message:", error)
      }
    }
  
    // Load conversation
    async function loadConversation(conversationId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some message data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
  
        let conversationName = ""
        let messagesData = []
  
        if (conversationId === "1") {
          conversationName = "John Doe"
          messagesData = [
            {
              id: 1,
              sender: "John Doe",
              content:
                'Hello Professor, I have a question about the feedback you provided on my assignment. Could you please elaborate on what you meant by "improve the structure"?',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 3 days and 2 hours ago
              isSent: false,
            },
            {
              id: 2,
              sender: "You",
              content:
                "Hello John, I meant that your essay would benefit from a clearer introduction, body, and conclusion. The content is good, but the organization could be improved. Let me know if you need more specific guidance.",
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000), // 3 days and 1 hour ago
              isSent: true,
            },
            {
              id: 3,
              sender: "John Doe",
              content: "Thank you for your feedback on my assignment. I will make the suggested revisions.",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              isSent: false,
            },
          ]
        } else if (conversationId === "2") {
          conversationName = "Jane Smith"
          messagesData = [
            {
              id: 1,
              sender: "Jane Smith",
              content:
                "Hello Professor, I have a question about the upcoming quiz. Could you please clarify the topics that will be covered?",
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              isSent: false,
            },
          ]
        } else if (conversationId === "3") {
          conversationName = "All Students"
          messagesData = [
            {
              id: 1,
              sender: "You",
              content: "Reminder: The deadline for Assignment 2 is next Friday.",
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              isSent: true,
            },
          ]
        }
  
        // Update message header
        document.getElementById("message-header").textContent = conversationName
  
        // Update message content
        const messageContent = document.getElementById("message-content")
        messageContent.innerHTML = ""
  
        messagesData.forEach((message) => {
          const messageElement = document.createElement("div")
          messageElement.className = `message-bubble ${message.isSent ? "sent" : "received"}`
  
          messageElement.innerHTML = `
            <div class="message-header">
              <span class="message-sender">${message.sender}</span>
              <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${message.content}</div>
          `
  
          messageContent.appendChild(messageElement)
        })
  
        // Show reply form
        document.getElementById("reply-form").style.display = "block"
  
        // Scroll to bottom of message content
        messageContent.scrollTop = messageContent.scrollHeight
      } catch (error) {
        console.error("Error loading conversation:", error)
      }
    }
  
    // Send new message
    function sendNewMessage(courseId) {
      const recipient = document.getElementById("message-recipient").value
      const subject = document.getElementById("message-subject").value
      const body = document.getElementById("message-body").value
  
      if (!recipient || !subject || !body) {
        alert("Please fill in all fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Message sent successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newMessageModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-message-form").reset()
  
      // Reload messages
      loadMessages(courseId)
    }
  
    // Load announcements
    async function loadAnnouncements(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some announcement data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const announcementsData = [
          {
            id: 1,
            title: "Welcome to the Course",
            content:
              "Welcome to the course! I'm excited to have you all in this class. Please take some time to review the syllabus and course materials. If you have any questions, feel free to reach out.",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          },
          {
            id: 2,
            title: "Assignment 1 Posted",
            content:
              "The first assignment has been posted. Please check the Assignments section for details. The due date is two weeks from today.",
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          },
          {
            id: 3,
            title: "Reminder: Quiz 1 Next Week",
            content:
              "Just a reminder that Quiz 1 will be available next week. It will cover all material from weeks 1-3. Make sure to review your notes and readings.",
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          },
          {
            id: 4,
            title: "Office Hours Change",
            content:
              "Please note that my office hours will be changed to Tuesdays and Thursdays from 2-4pm, starting next week.",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
        ]
  
        const announcementsList = document.getElementById("announcements-list")
  
        if (announcementsData.length === 0) {
          announcementsList.innerHTML = '<div class="text-center"><p>No announcements</p></div>'
          return
        }
  
        announcementsList.innerHTML = ""
  
        announcementsData.forEach((announcement) => {
          const announcementItem = document.createElement("div")
          announcementItem.className = "announcement-item"
  
          announcementItem.innerHTML = `
            <div class="announcement-header">
              <div class="announcement-title">${announcement.title}</div>
              <div class="announcement-date">${formatDate(announcement.date)}</div>
            </div>
            <div class="announcement-content">${announcement.content}</div>
            <div class="announcement-actions mt-3">
              <button class="btn btn-sm btn-warning edit-announcement me-2" data-id="${announcement.id}">
                <i class="fas fa-edit me-1"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger delete-announcement" data-id="${announcement.id}">
                <i class="fas fa-trash me-1"></i> Delete
              </button>
            </div>
          `
  
          announcementsList.appendChild(announcementItem)
        })
  
        // Add event listeners to edit buttons
        document.querySelectorAll(".edit-announcement").forEach((button) => {
          button.addEventListener("click", (e) => {
            const announcementId = e.currentTarget.getAttribute("data-id")
            editAnnouncement(announcementId)
          })
        })
  
        // Add event listeners to delete buttons
        document.querySelectorAll(".delete-announcement").forEach((button) => {
          button.addEventListener("click", (e) => {
            const announcementId = e.currentTarget.getAttribute("data-id")
            deleteAnnouncement(announcementId, courseId)
          })
        })
      } catch (error) {
        console.error("Error loading announcements:", error)
      }
    }
  
    // Post announcement
    function postAnnouncement(courseId) {
      const title = document.getElementById("announcement-title").value
      const content = document.getElementById("announcement-content").value
  
      if (!title || !content) {
        alert("Please fill in all fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Announcement posted successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newAnnouncementModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-announcement-form").reset()
  
      // Reload announcements
      loadAnnouncements(courseId)
    }
  
    // Edit announcement
    function editAnnouncement(announcementId) {
      alert(`Editing announcement ${announcementId}...`)
      // In a real application, this would open a modal for editing the announcement
    }
  
    // Delete announcement
    function deleteAnnouncement(announcementId, courseId) {
      if (confirm("Are you sure you want to delete this announcement?")) {
        // This would be an API call in a real application
        alert(`Announcement ${announcementId} deleted successfully!`)
  
        // Reload announcements
        loadAnnouncements(courseId)
      }
    }
  
    // Load discussions
    async function loadDiscussions(courseId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some discussion data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
  
        const topicsData = [
          {
            id: 1,
            title: "Introduction Thread",
            author: "You",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            replies: 15,
          },
          {
            id: 2,
            title: "Discussion: Chapter 1 Concepts",
            author: "You",
            date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            replies: 8,
          },
          {
            id: 3,
            title: "Group Project Ideas",
            author: "Jane Doe",
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            replies: 12,
          },
          {
            id: 4,
            title: "Questions about Assignment 2",
            author: "John Johnson",
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            replies: 5,
          },
        ]
  
        const topicsList = document.getElementById("topics-list")
  
        if (topicsData.length === 0) {
          topicsList.innerHTML = '<div class="list-group-item text-center"><p>No discussion topics</p></div>'
          return
        }
  
        topicsList.innerHTML = ""
  
        topicsData.forEach((topic) => {
          const topicItem = document.createElement("div")
          topicItem.className = "list-group-item topic-item"
          topicItem.setAttribute("data-id", topic.id)
  
          topicItem.innerHTML = `
            <div class="topic-title">${topic.title}</div>
            <div class="topic-meta">
              <span>By: ${topic.author}</span>
              <span>${topic.replies} replies</span>
            </div>
          `
  
          topicsList.appendChild(topicItem)
        })
  
        // Add event listeners to topic items
        document.querySelectorAll(".topic-item").forEach((item) => {
          item.addEventListener("click", () => {
            // Remove active class from all topic items
            document.querySelectorAll(".topic-item").forEach((i) => i.classList.remove("active"))
            // Add active class to clicked item
            item.classList.add("active")
  
            const topicId = item.getAttribute("data-id")
            loadTopic(topicId)
          })
        })
      } catch (error) {
        console.error("Error loading discussions:", error)
      }
    }
  
    // Load topic
    async function loadTopic(topicId) {
      try {
        // This would be an API call in a real application
        // For now, we'll simulate some topic data
  
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
  
        let topicTitle = ""
        let postsData = []
  
        if (topicId === "1") {
          topicTitle = "Introduction Thread"
          postsData = [
            {
              id: 1,
              author: "You",
              content:
                "Welcome to the course! Please introduce yourself to your classmates in this thread. Share your name, your major, and what you hope to learn from this course.",
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              isOriginal: true,
            },
            {
              id: 2,
              author: "Jane Doe",
              content:
                "Hi everyone! My name is Jane Doe and I'm majoring in Computer Science. I'm excited to learn more about this subject and hope to apply it to my future career in software development.",
              date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
            },
            {
              id: 3,
              author: "John Johnson",
              content:
                "Hello class! I'm John Johnson, majoring in Business Administration. I'm taking this course to broaden my knowledge and understand how this field intersects with business applications.",
              date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
            },
          ]
        } else if (topicId === "2") {
          topicTitle = "Discussion: Chapter 1 Concepts"
          postsData = [
            {
              id: 1,
              author: "You",
              content:
                "In this thread, let's discuss the key concepts from Chapter 1. What did you find most interesting or challenging? How do these concepts relate to real-world applications?",
              date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
              isOriginal: true,
            },
            {
              id: 2,
              author: "Jane Doe",
              content:
                "I found the section on [Concept A] particularly interesting. It made me think about how this applies to [Example]. Has anyone else made similar connections?",
              date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
            },
            {
              id: 3,
              author: "John Johnson",
              content:
                "I struggled a bit with understanding [Concept B]. Could someone explain it in simpler terms? I think I'm missing something fundamental.",
              date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
            },
          ]
        } else if (topicId === "3") {
          topicTitle = "Group Project Ideas"
          postsData = [
            {
              id: 1,
              author: "Jane Doe",
              content:
                "I'm thinking about focusing my group project on [Topic]. Would anyone be interested in collaborating on this? I think it has a lot of potential for interesting research and application.",
              date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
              isOriginal: true,
            },
            {
              id: 2,
              author: "John Johnson",
              content:
                "That sounds interesting! I'd be interested in joining your group. I have some experience with [Related Topic] that might be useful.",
              date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            },
            {
              id: 3,
              author: "You",
              content:
                "This is a promising direction for a project. Make sure to consider [Important Consideration] as you develop your ideas further.",
              date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
            },
          ]
        } else if (topicId === "4") {
          topicTitle = "Questions about Assignment 2"
          postsData = [
            {
              id: 1,
              author: "John Johnson",
              content:
                "I'm a bit confused about the requirements for Assignment 2. The instructions say to [Requirement], but I'm not sure if that means [Interpretation A] or [Interpretation B]. Can anyone clarify?",
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
              isOriginal: true,
            },
            {
              id: 2,
              author: "You",
              content:
                "Good question, John. The requirement refers to [Clarification]. Let me know if you need any further clarification.",
              date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
            },
            {
              id: 3,
              author: "Jane Doe",
              content: "I had the same question! Thanks for the clarification, Professor.",
              date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            },
          ]
        }
  
        // Update discussion header
        document.getElementById("discussion-header").textContent = topicTitle
  
        // Update discussion content
        const discussionContent = document.getElementById("discussion-content")
        discussionContent.innerHTML = ""
  
        postsData.forEach((post) => {
          const postElement = document.createElement("div")
          postElement.className = `discussion-post ${post.isOriginal ? "original" : ""}`
  
          postElement.innerHTML = `
            <div class="discussion-header">
              <div class="discussion-author">${post.author}</div>
              <div class="discussion-date">${formatDate(post.date)}</div>
            </div>
            <div class="discussion-content">${post.content}</div>
            ${
              post.author === "You"
                ? `<div class="discussion-actions mt-2">
                <button class="btn btn-sm btn-warning edit-post me-2" data-id="${post.id}">
                  <i class="fas fa-edit me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger delete-post" data-id="${post.id}">
                  <i class="fas fa-trash me-1"></i> Delete
                </button>
              </div>`
                : ""
            }
          `
  
          discussionContent.appendChild(postElement)
        })
  
        // Show reply form
        document.getElementById("discussion-reply-form").style.display = "block"
  
        // Add event listeners to edit post buttons
        document.querySelectorAll(".edit-post").forEach((button) => {
          button.addEventListener("click", (e) => {
            const postId = e.currentTarget.getAttribute("data-id")
            editPost(postId)
          })
        })
  
        // Add event listeners to delete post buttons
        document.querySelectorAll(".delete-post").forEach((button) => {
          button.addEventListener("click", (e) => {
            const postId = e.currentTarget.getAttribute("data-id")
            deletePost(postId)
          })
        })
  
        // Scroll to bottom of discussion content
        discussionContent.scrollTop = discussionContent.scrollHeight
      } catch (error) {
        console.error("Error loading topic:", error)
      }
    }
  
    // Create new topic
    function createNewTopic(courseId) {
      const title = document.getElementById("topic-title").value
      const content = document.getElementById("topic-content").value
  
      if (!title || !content) {
        alert("Please fill in all fields")
        return
      }
  
      // This would be an API call in a real application
      alert("Topic created successfully!")
  
      // Close modal
      const bootstrap = window.bootstrap
      const modal = bootstrap.Modal.getInstance(document.getElementById("newTopicModal"))
      modal.hide()
  
      // Reset form
      document.getElementById("new-topic-form").reset()
  
      // Reload discussions
      loadDiscussions(courseId)
    }
  
    // Edit post
    function editPost(postId) {
      alert(`Editing post ${postId}...`)
      // In a real application, this would open a modal for editing the post
    }
  
    // Delete post
    function deletePost(postId) {
      if (confirm("Are you sure you want to delete this post?")) {
        // This would be an API call in a real application
        alert(`Post ${postId} deleted successfully!`)
  
        // Reload the current topic
        const activeTopicItem = document.querySelector(".topic-item.active")
        if (activeTopicItem) {
          const topicId = activeTopicItem.getAttribute("data-id")
          loadTopic(topicId)
        }
      }
    }
  
    // Helper function to format date
    function formatDate(date) {
      const now = new Date()
      const diff = now - date
  
      // If less than 24 hours, show "Today" or "Yesterday"
      if (diff < 24 * 60 * 60 * 1000) {
        if (date.getDate() === now.getDate()) {
          return "Today"
        } else if (date.getDate() === now.getDate() - 1) {
          return "Yesterday"
        }
      }
  
      // Otherwise, show the date
      return date.toLocaleDateString()
    }
  
    // Helper function to format time
    function formatTime(date) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  
    // Helper function to format time ago
    function formatTimeAgo(date) {
      const now = new Date()
      const diff = now - date
  
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
  
      if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`
      } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
      } else {
        return "Just now"
      }
    }
  })
  
  