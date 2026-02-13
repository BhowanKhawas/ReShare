# Week 1: Docker Setup & Installation Process

This guide walks through setting up the development environment and running the project for the first time.

## 1. Install Required Tools

### VS Code

* Download and install Visual Studio Code
* Recommended extensions:

  * Docker
  * ESLint
  * Prettier

### Node.js

* Install Node.js (LTS version recommended)
* Verify installation:

  ```bash
  node -v
  npm -v
  ```

### Docker

* Install Docker Desktop for your OS
* Make sure Docker is running in the background
* Verify installation:

  ```bash
  docker -v
  ```

## 2. Project Setup

### Download Project Scaffold

* Download the provided scaffolding files
* Extract the downloaded folder to your workspace

### Open in VS Code

* Open VS Code
* Open the extracted project folder

## 3. Install Dependencies

* Open the VS Code integrated terminal
* Run:

  ```bash
  npm install
  ```

## 4. Run the Application with Docker

* Ensure Docker is running

* From the project root, run:

  ```bash
  docker compose up
  ```

* Wait for containers to build and start

* Access the application as instructed (e.g., localhost URL)

## 5. Troubleshooting Tips

* If `docker compose up` fails, try:

  ```bash
  docker compose down
  docker compose up --build
  ```
* Make sure no other services are using the same ports
* Restart Docker Desktop if issues persist