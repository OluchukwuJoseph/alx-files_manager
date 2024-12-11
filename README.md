# ALX Files Manager

## Description

**ALX Files Manager** is a project that focuses on building a file management API using Node.js and MongoDB. This application allows users to upload, manage, and retrieve files via HTTP endpoints. The project integrates advanced concepts like file storage, database management, and asynchronous operations.

This project serves as a practical introduction to backend development using Node.js while applying MongoDB for database operations.

---

## Learning Objectives

After completing this project, I learnt:

- How to create RESTful APIs with Express.js.
- File storage and retrieval techniques using local storage and MongoDB.
- Managing user authentication with tokens.
- Asynchronous programming with Node.js.
- Handling large file uploads and managing metadata.

---

## Project Requirements

- **Node.js**: Version 12.x or later.
- **MongoDB**: Ensure MongoDB is installed and running on your system.
- Code must follow **ES6+ standards**.
- Tests must pass successfully with no errors.
- Use **Postman** or **cURL** for API testing.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alx-files_manager.git
   cd alx-files_manager
   ```
2. Install dependencies:

    ```bash
    Copy code
    npm install
    ```
3. Configure environment variables by creating a .env file in the root directory:
    ```bash
    env
    Copy code
    DB_HOST=localhost
    DB_PORT=27017
    DB_DATABASE=files_manager
    PORT=5000
    ```
4. Start the server:

    ```bash
    npm start
    ```
5. Access the API via **http://localhost:5000**.

## API Endpoints

### User Management

#### POST /users
    Create a new user.
    Request body:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```

#### GET /users/me

    Retrieve the authenticated user's information.

### File Management

#### POST /files

    Upload a new file.
    Request body:
    ```json
    {
        "name": "file.txt",
        "type": "file",
        "data": "Base64 encoded content"
    }
    ```
#### GET /files/:id

    Retrieve a file's metadata by its ID.

#### GET /files

    List all files uploaded by the user.

#### PUT /files/:id/publish

    Publish a file to make it publicly accessible.

#### PUT /files/:id/unpublish

    Unpublish a file to restrict access.

## Testing
Run the test suite using:

    ```bash
    npm test
    ```
Ensure MongoDB is running during tests.

## Example Usage

### Upload a File:
    ```bash
    curl -X POST http://localhost:5000/files \
    -H "Content-Type: application/json" \
    -d '{"name": "example.txt", "type": "file", "data": "SGVsbG8gV29ybGQ="}'
    ```
### Retrieve User Info:
    ```bash
    curl -X GET http://localhost:5000/users/me \
    -H "Authorization: Bearer <token>"
    ```

## Project Structure
    ```bash
    alx-files_manager/
    ├── controllers/       # API logic
    ├── models/            # Database schemas
    ├── routes/            # API endpoints
    ├── utils/             # Helper functions
    ├── tests/             # Test cases
    ├── .env               # Environment variables
    ├── package.json       # Dependencies and scripts
    ├── README.md          # Project documentation
    ```

## Resources
- =Node.js Documentation
- MongoDB Documentation
- Express.js Guide
- Postman

## Author
This project is part of the ALX Software Engineering program.
Authored by **Joseph Oluchukwu**.