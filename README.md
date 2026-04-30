---

# ReShare – Community-Based Item Sharing Platform

## 📋 Module Information
* **Programme:** BSc Computer Science
* **Module:** Software Engineering (CMP-N204-0)
* **Assessment Type:** Group Project
* **Academic Year:** 2025–2026

---

## 🌟 Project Overview
**ReShare** is a community-based item sharing web application designed to reduce household waste by encouraging the reuse of unwanted items. Users can give away items to others in their local area for free, promoting sustainable consumption and strengthening community ties[cite: 1].

---

## 🚀 Key Features & Recent Updates
* **User Authentication:** Secure registration and login with session management[cite: 1].
* **Real-Time Messaging:** Integrated **Socket.io** for instant, two-way communication between item owners and requesters[cite: 3].
* **Item Management:** Full CRUD capabilities for listings, including image uploads via Multer[cite: 1].
* **Dynamic Browsing:** Filter items by category and view detailed full-page listings[cite: 1].
* **Impact Dashboard:** Visual tracking of items gifted to highlight waste reduction[cite: 1].
* **Admin Controls:** Protected routes for managing users and moderating listings[cite: 1].

---

## 🛠 Technology Stack
### Frontend & Backend
* **Pug (Jade):** Server-side templating engine[cite: 1].
* **Node.js & Express:** Robust backend routing and middleware[cite: 1].
* **Socket.io:** Real-time WebSocket communication[cite: 3].
* **CSS3 & Bootstrap:** Responsive and accessible design[cite: 1].

### Database & Storage
* **MySQL:** Relational data storage for users, listings, and messages[cite: 1, 2].
* **Multer:** Handling multipart/form-data for image uploads[cite: 1].

### Quality Assurance & DevOps
* **Nightwatch.js:** Automated End-to-End (E2E) browser testing.
* **Docker:** Containerization for consistent development environments[cite: 1].
* **GitHub Actions:** CI/CD pipeline for automated builds and testing[cite: 1].

---

## 🏗 System Architecture
The project follows the **Model-View-Controller (MVC)** architectural pattern to ensure separation of concerns and code maintainability.

* **Models:** Handle data logic and database queries (e.g., `Chat.js`, `User.js`)[cite: 1, 2].
* **Views:** Pug templates for rendering the UI (e.g., `chat.pug`, `index.pug`)[cite: 1, 3].
* **Controllers:** Express routes in `app.js` that bridge the models and views[cite: 1].

---

## 🧪 Testing Strategy
We utilize a multi-layered testing approach:
1. **Automated E2E Testing:** Using **Nightwatch.js** to simulate real user flows (e.g., verifying homepage loads and login functionality).
2. **CI Integration:** Tests are automatically triggered via GitHub Actions on every push to the repository.
3. **Manual Verification:** Ongoing testing of real-time messaging and image upload stability.

---

## 🐳 Installation & Setup
1. **Clone the Repo:** `git clone [your-repo-link]`
2. **Environment Variables:** Create a `.env` file with your MySQL credentials.
3. **Docker Compose:** 
   ```bash
   docker-compose up --build
   ```
4. **Run Tests:**
   ```bash
   npx nightwatch custom-tests/
   ```

---

## 👥 Team Members (Group: Inferno)
* **Bhowan Khawas** – Project Management & Automated Testing
* **Aakriti Gurung** – Frontend Development
* **Abdul Rehman** – DevOps & CI/CD
* **Sameer Shabbir** – Database Design & Integration
* **Ismail Sohail** – Backend Development

---

### How to add this to your Repo:
1. Open your project folder on your Mac.
2. Open the file named `README.md`.
3. Delete the old text and paste the content above.
4. **Commit and Push:**
   ```bash
   git add README.md
   git commit -m "docs: update README with real-time chat and Nightwatch testing"
   git push origin [your-branch-name]
   ```


## 🐳 Docker Setup & Installation


* **[Week 1: Docker Setup & Installation Process](week1.md)**


---

## 🔄 Development Methodology

The project follows an **Agile, sprint-based development approach**. Work is divided into iterations (sprints), with tasks tracked using GitHub Projects. Each sprint includes planning, implementation, testing, and review stages.

### Sprint 1 Focus: Foundation
* Project setup and repository configuration
* Express server and PUG templating setup
* MySQL database connection and schema creation
* User authentication (registration and login)
* Docker configuration
* Initial CI/CD pipeline setup

### Sprint 2 Focus: Real-Time Features & QA
* **Real-Time Communication:** Implementation of Socket.io for instant messaging between users.
* **Automated Testing:** Integration of Nightwatch.js for browser-based End-to-End (E2E) testing.
* **MVC Refinement:** Strict adherence to Model-View-Controller patterns across all new features.
* **Claiming Logic:** Finalizing the workflow for marking items as "Claimed" and updating user impact stats.

---

## 👥 Team Members & Roles

* **Bhowan Khawas** – Project Management & Automated Testing (Nightwatch.js)
* **Aakriti Gurung** – Frontend Development (Pug Templates & UI/UX)
* **Abdul Rehman** – DevOps & CI/CD (Docker & GitHub Actions)
* **Sameer Shabbir** – Database Design & Integration (MySQL Schema)
* **Ismail Sohail** – Backend Development (Node.js/Express & Socket.io)

*(Roles frequently overlap to ensure collaborative development and cross-functional learning.)*

---

## 🛠 Testing Strategy

Our testing strategy ensures that every code change is verified before it reaches the main branch:

* **Automated E2E Testing:** Nightwatch.js scripts verify that the Home page, Login flow, and Messaging system are functioning correctly in a real browser environment.
* **Manual Feature Verification:** Rigorous manual testing of real-time message delivery across multiple browser sessions.
* **CI Integration:** Testing is integrated into the GitHub Actions CI pipeline, preventing the merging of code that fails automated checks.

---

## 🚢 Deployment Strategy

The application is fully containerized using **Docker**, ensuring that "it works on my machine" translates to "it works on every machine".
* **Orchestration:** `docker-compose` manages the Express app and MySQL database as linked services.
* **CI/CD:** GitHub Actions automates the build and test process, providing immediate feedback on pull requests.

---

## 🏁 Conclusion

**ReShare** demonstrates the application of modern software engineering principles—specifically **MVC architecture**, **Agile methodology**, and **CI/CD practices**—to solve a real-world environmental challenge. By combining a robust Node.js backend with real-time capabilities and automated quality assurance, the project showcases a production-ready approach to community-driven software.

---
