<div align="center">
  
  # 🚀 PrabandhX
  
  ### Full-Stack Organization Management System
  
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
  <img src="https://img.shields.io/badge/Status-Active-success" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" />
  
</div>

---

## 📋 Overview

**PrabandhX** is a comprehensive organization management system designed to streamline project management, team collaboration, and task tracking. Built with a robust Spring Boot backend and a modern React frontend, it provides role-based access control for Admins, Managers, and Users.

---

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, User)
- ✅ Secure password encryption

### 👥 User Management
- ✅ Create, read, update, delete users
- ✅ Role assignment (Admin/Manager/User)
- ✅ User search and filtering

### 📊 Dashboard Analytics
- ✅ Real-time statistics (users, projects, tasks)
- ✅ Activity timeline charts
- ✅ Task distribution pie charts
- ✅ Recent activity feed

### 📁 File Management
- ✅ Upload/download project files
- ✅ File version history
- ✅ File sharing with collaborators

### 🤝 Team Collaboration
- ✅ Invite collaborators to projects
- ✅ Permission management (View/Edit/Admin)
- ✅ Accept/reject invitations

### ✅ Task Management
- ✅ Create, assign, and track tasks
- ✅ Priority levels (High/Medium/Low)
- ✅ Due date tracking
- ✅ Task status (To Do/In Progress/Completed)

### 📈 Activity Logs
- ✅ Complete audit trail
- ✅ Filter by action type, date range, user
- ✅ Export functionality

---

## 🛠️ Tech Stack

<div align="center">
  
| **Backend** | **Frontend** |
|-------------|--------------|
| Spring Boot 3.2.5 | React 18.3.1 |
| Java 21 | Vite 5.4.10 |
| Spring Security 6.1.6 | Framer Motion 11.0.2 |
| JWT 0.11.5 | Recharts 2.12.0 |
| Spring Data JPA | React Router DOM 6.22.0 |
| MySQL 8.0 | React Hot Toast 2.4.1 |
| Maven 3.9+ | Axios |

</div>

---

## 🚀 Installation

### 📋 Prerequisites
- ☕ Java 21 or higher
- 📦 Node.js 18+ and npm
- 🗄️ MySQL 8.0+
- 🛠️ Maven 3.9+

---

### 🔧 Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/Auro993/prabandhX.git
cd prabandhX/backend
2. Configure MySQL Database

sql
CREATE DATABASE prabandhx;
3. Update application.properties

properties
spring.datasource.url=jdbc:mysql://localhost:3306/prabandhx
spring.datasource.username=root
spring.datasource.password=your_password
4. Run the application

bash
./mvnw spring-boot:run
🚀 Backend will start at http://localhost:8080

💻 Frontend Setup
1. Navigate to frontend directory

bash
cd ../frontend
2. Install dependencies

bash
npm install
3. Run the development server

bash
npm run dev
🚀 Frontend will start at http://localhost:5173

🔑 Default Users
<div align="center">
Role	Email	Password
👑 Admin	admin@prabandhx.com	admin123
📋 Manager	manager@prabandhx.com	manager123
👤 User	user@prabandhx.com	user123
</div>
📡 API Endpoints
Category	Endpoint	Method	Description
🔐 Auth	/api/auth/login	POST	User login
🔐 Auth	/api/auth/register	POST	User registration
👥 Users	/api/users	GET/POST/PUT/DELETE	User management
📁 Projects	/api/projects	GET/POST/PUT/DELETE	Project management
✅ Tasks	/api/tasks	GET/POST/PUT/DELETE	Task management
📂 Files	/api/files	GET/POST/DELETE	File management
📊 Activity	/api/activity	GET	Activity logs
🎯 Features by Role
<div align="center">
👑 Admin
✅ Full system access

✅ Manage all users, projects, tasks

✅ View all activity logs

✅ System configuration

📋 Manager
✅ Manage assigned projects

✅ Create and assign tasks

✅ Manage team members

✅ View project activity

👤 User
✅ View assigned tasks

✅ Update task status

✅ View personal activity

✅ Upload/download files

</div>
🤝 Contributing
Contributions are what make the open-source community such an amazing place!

🍴 Fork the repository

🌿 Create your feature branch (git checkout -b feature/AmazingFeature)

💾 Commit your changes (git commit -m 'Add some AmazingFeature')

📤 Push to the branch (git push origin feature/AmazingFeature)

🔄 Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
<div align="center">
Aurosmita Sahoo
https://img.shields.io/badge/GitHub-@Auro993-181717?style=for-the-badge&logo=github
https://img.shields.io/badge/Email-aurosmitasahoo45@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white

</div>
🙏 Acknowledgments
📚 Spring Boot Documentation

⚛️ React Documentation

🌟 All contributors and users

<div align="center">
⭐ Star this repository if you find it helpful!
Built with ❤️ by Aurosmita Sahoo

</div> ```
