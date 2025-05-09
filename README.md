# Picobytes Core: Cutting C into Small Bytes for Rhodes Students

**PicoBytes** is a web application built to help Rhodes College students master the core concepts of C programming as taught in **COMP 251**. Through an engaging and interactive platform, students can reinforce their understanding of the course material in a fun, low-stress environment.

## 📝 Project Description

PicoBytes is designed to address the common challenges students face when learning C programming, particularly in the fundamental COMP 251 course at Rhodes College. Many students struggle with the transition to C from higher-level languages or find it difficult to grasp key concepts through traditional learning methods alone.

Our application provides a supplementary learning platform with varied question types, immediate feedback, and performance tracking to help students practice C programming concepts in an interactive way. The platform allows professors to monitor student progress, identify areas where students are struggling, and customize content to better support their teaching objectives.

By offering a user-friendly interface and gamification elements like streaks and leaderboards, PicoBytes motivates students to engage with the material consistently, leading to better retention and understanding of important C programming concepts.

## 🚀 Major Features

- 🧠 **Diverse Quiz Modes**  
  - Multiple Choice Questions: Test conceptual understanding
  - True/False Questions: Quick knowledge checks
  - Code Block Analysis: Identify issues in provided code
  - Free Response Coding: Write code with real-time testing and feedback

- 📚 **Flexible Learning Paths**  
  - Guided Lessons: Follow professor-curated content
  - Self-Paced Topic Selection: Focus on areas needing improvement
  - Progressive Difficulty: Questions adjust based on student performance

- 📈 **Student Engagement & Motivation**  
  - Daily Streaks: Track consecutive days of practice
  - Point System: Earn points for correct answers
  - Leaderboard: Compare progress with peers
  - Email Reminders: Stay on track with your learning goals

- 🧑‍🏫 **Instructor Tools**  
  - Question Management: Add, edit, or remove questions
  - Performance Analytics: Track student progress across topics
  - Difficulty Customization: Adjust question complexity
  - Usage Statistics: Monitor engagement patterns
  
- 🔒 **User Authentication**
  - Secure login system
  - Role-based access control (student/admin)
  - Personalized learning experience

## 🔄 System Architecture

Picobytes follows a three-tier architecture with additional specialized services:

```
+----------------------------------+
|         Frontend (React)         |
|   User Interface & Interactions  |
+----------------+----------------+
                 |
                 v
+----------------+----------------+
|        Backend API (Flask)      |
|    Request Handling & Routing   |
+-------+------------+-----------+
        |            |
        v            v
+-------+----+  +----+---------+
| PostgreSQL |  | Execute-Test |
|  Database  |  |   Service    |
+------------+  +--------------+
```

### System Interactions:

1. **Frontend Layer**: React application that provides the user interface for students and instructors
2. **Backend API**: Flask server handling authentication, question management, analytics, and coordinating between components
3. **Database Layer**: PostgreSQL database storing user data, questions, answers, and analytics
4. **Execute-Test Service**: Containerized service that safely executes and validates student code submissions

### Key Interactions:
- Frontend makes API calls to the backend for data retrieval and submission
- Backend connects to PostgreSQL for data persistence
- When code execution is required, the backend communicates with the Docker-contained Execute-Test service via HTTP
- Email notifications are handled through backend scheduled tasks

## 📸 Application Screenshots


### Student Dashboard
![Capture-2025-05-08-190112](https://github.com/user-attachments/assets/e912febe-71e2-4c67-b6ec-db18714117c9)

*Shows the main student interface with progress metrics, streak information, and quick access to different question types*

### Code Quiz Interface
![Capture-2025-05-08-190206](https://github.com/user-attachments/assets/b058b447-f60e-4b92-8a07-5f6fa1c687d7)

*Displays the coding question interface with editor, instructions, and submission controls*

### Instructor Analytics
![Capture-2025-05-08-190311](https://github.com/user-attachments/assets/6498a37c-067e-49ca-8d4d-0c8bd9a605de)
![Capture-2025-05-08-190357](https://github.com/user-attachments/assets/ff92636f-255c-4546-9746-bfce01f523b5)


*Shows the admin view of student performance data and question statistics*

## 💻 Project Dependencies

### Software Libraries

#### Frontend
- **Core**: React, TypeScript, Vite
- **Routing**: React Router DOM
- **UI**: Tailwind CSS
- **Content**: React Markdown
- **Development**: ESLint, TypeScript compiler

#### Backend
- **Core**: Flask, Python
- **Database Access**: Flask-SQLAlchemy, psycopg (PostgreSQL connector)
- **Scheduling**: APScheduler (for email notifications)
- **API Support**: Flask-CORS

### Runtime Environments
- **Frontend**: Node.js runtime
- **Backend**: Python environment
- **Code Execution**: Docker container for isolated code testing
- **Integration**: Shell scripts for orchestrating services

### Backend Services and Infrastructure
- **Database**: PostgreSQL database for storing all application data
- **Execute-Test Service**: Dockerized service running on port 5001 for secure code execution
- **Email Service**: Email notification system for reminders and updates
- **API Endpoints**:
  - User authentication and management
  - Question retrieval and submission
  - Analytics and performance tracking
  - Administration and content management

## 🛠️ Setup and Installation

To run this project locally:

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Rhodes-CS-comp486/Picobytes-Core.git
   cd Picobytes-Core
   ```

2. **Start all services with the integrated script:**
   ```bash
   ./run-all.sh
   ```
   
   This script handles:
   - Starting the Execute-Test Docker container
   - Launching the Flask backend
   - Starting the React frontend
   - Setting up proper cleanup on shutdown

3. **For manual setup:**

   a. Start the Execute-Test Docker container:
   ```bash
   ./docker-start.sh
   ```

   b. Start the backend server:
   ```bash
   cd Picobytes/backend
   python app.py
   ```

   c. Start the frontend server:
   ```bash
   cd Picobytes/frontend
   npm install
   npm run dev
   ```

4. **Access the application at:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
