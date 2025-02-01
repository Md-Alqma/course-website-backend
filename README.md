# course-website-backend

# Requirements

---

- ## ADMIN

  - Sign up and Login
  - Add Course
  - Edit Course
  - List Courses

- ## USER
  - Sign up and Login
  - View Courses
  - View Single Course
  - Purchase Course

# Endpoints

- ## ADMIN
  - POST: SIGNUP
    - Registers a new admin
    ```JS
    ('/admin/signup') 
    headers: {username: "username", password: "password"}
    return: "Admin Created Successfully"
    ```
  - POST: LOGIN
    - Authenticate admin 
    ```JS
    ('/admin/login')
    headers: {username: "username", password: "password"}
    return: "Admin Login Successfully"
    ```
    - If not authorized or not authenticated
    ```JS
    return: "Unauthorized login failed"
    ```
  - POST: Create Course
    ```JS
    ('/admin/course')
    headers: {username: "username", password: "password"}
    return: "Course Created Successfully"
    ```
  - PUT: Update Course
    ```JS
    ('/admin/course/:courseId')
    headers: {username: "username", password: "password"}
    return: "Course Updated Successfully"
    ```
  - DELETE: Delete a course
    ```JS
    ('/admin/course/:courseId')
    headers: {username: "username", password: "password"}
    return: "Course deleted successfully"
    ```
  - GET: Get the list of courses
    ```JS
    ('/admin/courses')
    headers: {username: "username", password: "password"}
    return: [{Courses}]
    ```
  




