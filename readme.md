# Project Management API

## Overview

This is a RESTful API for a **Project Management System** built using **Express.js, PostgreSQL, and Prisma**. It allows users to:

- Manage users (registration & login with JWT authentication)
- Create, update, and delete projects
- Assign tasks to users and update task statuses
- Filter and paginate tasks

## Tech Stack

- **Backend:** Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT

---

## Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-username/project-management-api.git
cd project-management-api
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and add:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/projectdb"
JWT_SECRET="your_secret_key"
```

**Replace** `username`, `password`, and `projectdb` with your actual PostgreSQL credentials.

### 4️⃣ Run Migrations

```sh
npx prisma migrate dev --name init
npx prisma generate
```

### 5️⃣ Start the Server

```sh
npx nodemon server.js
```

Server runs on `http://localhost:5000/`.

---

## API Endpoints

### **Auth Routes** (`/auth`)

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register a new user  |
| POST   | `/auth/login`    | User login & get JWT |

### **Project Routes** (`/projects`)

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| POST   | `/projects`     | Create a project          |
| GET    | `/projects`     | List projects (paginated) |
| PUT    | `/projects/:id` | Update a project          |
| DELETE | `/projects/:id` | Delete a project          |

### **Task Routes** (`/tasks`)

| Method | Endpoint                     | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| POST   | `/projects/:projectId/tasks` | Add a task under a project          |
| GET    | `/tasks`                     | List tasks (filterable & paginated) |
| GET    | `/projects/:projectId/tasks` | List tasks for a project            |
| PUT    | `/tasks/:id`                 | Update task details/status          |
| DELETE | `/tasks/:id`                 | Delete a task                       |

---

## Authentication & Authorization

- **JWT Authentication**: All endpoints (except `/auth/register` & `/auth/login`) require a **Bearer Token**.
- **Role-Based Permissions**:
  - Only project creators can update or delete their projects.
  - Only assigned users can update task statuses.

### **How to Use JWT Authentication in Postman**

1. Get a token from `/auth/login`.
2. Add it in the **Headers** as:
   ```
   Authorization: Bearer your_jwt_token
   ```

---

## Pagination & Filtering

- **Paginated Requests** (default `limit=10`):
  ```sh
  GET /projects?page=1&limit=5
  GET /tasks?page=2&limit=10&status=IN_PROGRESS
  ```

---

## Testing with Postman

1. Import the API collection into Postman.
2. Register as a new user.
3. Execute API requests while passing the **JWT Token** for authentication.

---

## Future Improvements

- WebSockets for real-time task updates
- Frontend dashboard integration

---


