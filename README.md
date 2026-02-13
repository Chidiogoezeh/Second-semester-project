Blogging API - Altsch Second Semester Project
This is a RESTful Blogging API built with Node.js, Express, and MongoDB. It features user authentication (JWT), blog lifecycle management (Draft/Published), and advanced query capabilities including pagination, searching, and filtering.

Live Demo
URL: https://fast-cliffs-34506-4341fbfaa06f.herokuapp.com/

Features
User Management: Signup and Login with password hashing (Bcrypt).

Authentication: Secure endpoints using JWT (Expires in 1 hour).

Blog Lifecycle: Create blogs as drafts, publish them, or update/delete them.

Permissions: Only the author of a blog can edit or delete it.

Public Access: Anyone can view published blogs and search by author, title, or tags.

Advanced Queries:

Pagination (Default: 20 blogs per page).

Ordering by read_count, reading_time, and timestamp.

Reading Time: Automatic calculation based on a 200 words-per-minute algorithm.

Logging: Global error handling and logging using Winston.

Project Architecture (MVC)
The project follows the Model-View-Controller pattern to ensure scalability and separation of concerns.

Requirements & Tech Stack
Runtime: Node.js (ES6 Modules)

Framework: Express.js

Database: MongoDB (Mongoose ODM)

Auth: JSON Web Tokens (JWT)

Testing: Jest & Supertest

Deployment: Heroku

Installation & Setup
Clone the repository:

git clone https://github.com/Chidiogoezeh/Second-semester-project.git

cd Second-semester-project

Install dependencies:

npm install

Environment Variables:
Create a .env file in the root directory and add:

PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

Run the application:

npm start

Run Tests:

npm test

API Endpoints
Auth

Method, Endpoint,       Description

POST,   /auth/signup,   Register a new user

POST,   /auth/login,    Login and receive a JWT

Blogs (Public)

Method, Endpoint,   Description

GET,    /blogs,     Get all published blogs (Paginated)

GET,    /blogs/:id, Get a single blog (Increments read_count)

Blogs (Owner/Protected)

Method, Endpoint,           Description

POST,   /blogs,             Create a new blog (Defaults to draft)

GET,    /blogs/my-blogs,    Get all blogs created by the logged-in user

PATCH,  /blogs/:id,         Update blog content or change state to published

DELETE, /blogs/:id,         Delete a blog

Testing Coverage
The API includes integration tests for:

User registration and authentication.

Draft vs. Published state logic.

Read count incrementation.

Pagination and Search queries.
