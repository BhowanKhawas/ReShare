# ReShare – Community-Based Item Sharing Platform.

## Module Information.

* **Programme:** BSc Computer Science
* **Module:** Software Engineering
* **Module Code:** CMP-N204-0
* **Assessment Type:** Group Project
* **Academic Year:** 2025–2026

---

## Project Overview

**ReShare** is a community-based item sharing web application designed to help local communities reduce waste and save money by encouraging the reuse of unwanted household items. Instead of discarding items, users can give them away to others within their local area for mutual benefit, without any financial exchange.

The platform supports sustainable consumption, promotes environmental responsibility, and strengthens community connections by making sharing simple and accessible.

---

## Project Objectives

* Reduce household waste through reuse
* Support community cooperation and sharing
* Provide a simple and secure platform for non-financial item exchange
* Apply full-stack software engineering practices
* Demonstrate teamwork, version control, and CI/CD techniques

---

## Key Features

* **User Authentication**

  * Secure user registration and login
  * Password hashing for security

* **Item Listings**

  * Create, view, edit, and delete item listings
  * Upload item images with descriptions

* **Search and Filtering**

  * Browse items by category
  * Filter items by location

* **Impact Dashboard**

  * Display numbers of items shared
  * Highlight contribution to waste reduction

* **Responsive Design**

  * Fully accessible on desktop and mobile devices

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* **PUG templating engine**

### Backend

* Node.js
* Express.js

### Database

* **MySQL** (relational database for structured data storage)

### DevOps & CI/CD

* Docker
* Git & GitHub
* GitHub Actions

### Project Management

* GitHub Projects

---

## System Architecture

* **Frontend:** PUG templates rendered by Express
* **Backend:** RESTful routes built with Express.js
* **Database:** MySQL for persistent data storage
* **Deployment:** Docker containers with automated CI/CD pipeline via GitHub Actions


---

## 🐳 Docker Setup & Installation

### 1. Prerequisites
* **[Docker Desktop](https://www.docker.com/products/docker-desktop)** (Ensure it is running).
* **Git** (To clone the repository).

### 2. Installation Steps
Run the following commands in your terminal:

```bash
# 1. Clone the repository
git clone [https://github.com/BhowanKhawas/ReShare.git](https://github.com/BhowanKhawas/ReShare.git)
cd ReShare

# 2. Setup Environment Variables
# (Rename the sample file to .env)
mv env-sample .env

# 3. Build and Start Containers
docker-compose up --build

---

# 3. Build and Start Containers
docker-compose up --build
```  <-- You were missing these three backticks!

### 3. Accessing the Application
Once the terminal logs show "Connected to database," access the services here:

| Service | URL / Port | Description |
| :--- | :--- | :--- |
| **Web App** | [http://localhost:3000](http://localhost:3000) | The main ReShare application. |
| **Database GUI** | [http://localhost:8081](http://localhost:8081) | **phpMyAdmin** (Login: `root` / `password`). |
| **MySQL (External)** | `localhost:3308` | Port for Workbench/TablePlus access. |

---

## Database Design (Summary)  <-- You were missing this header!

### Users Table
* user_id (Primary Key)
* name
* email
...

### Users Table

* user_id (Primary Key)
* name
* email
* password_hash
* created_at

### Items Table

* item_id (Primary Key)
* title
* description
* category
* image_path
* location
* user_id (Foreign Key)
* created_at

---

## Development Methodology

The project follows an **Agile, sprint-based development approach**. Work is divided into iterations (sprints), with tasks tracked using GitHub Projects. Each sprint includes planning, implementation, testing, and review stages.

---

## Sprint 1 Focus

* Project setup and repository configuration
* Express server and PUG templating setup
* MySQL database connection and schema creation
* User authentication (registration and login)
* Docker configuration
* Initial CI/CD pipeline setup

---

## Team Members & Roles

* **Bhowan Khawas** – Project Management & Testing 
* **Aakriti Gurung** – Frontend Development
* **Abdul Rehman** – DevOps & CI/CD
* **Sameer Shabbir** – Database Design & Integration
* **Ismail Sohail** – Backend Development

*(Roles may overlap to ensure collaborative development.)*

---

## Version Control

Git is used for version control following a feature-branch workflow. All changes are reviewed and merged via pull requests to ensure code quality and collaboration.

---

## Testing Strategy

* Manual testing of core features
* Basic automated tests for critical routes
* Testing integrated into the CI pipeline

---

## Deployment Strategy

The application is containerised using Docker. GitHub Actions automates building, testing, and deployment to ensure consistent and reliable releases.

---

## Conclusion

ReShare demonstrates the application of software engineering principles in developing a full-stack web application that addresses real-world sustainability and community challenges. The project showcases teamwork, modern development tools, and professional development practices aligned with industry standards.