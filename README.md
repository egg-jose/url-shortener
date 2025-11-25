# URL Shortener API

This is a simple API for shortening URLs. It's built with Node.js, Express, and MongoDB.

## Features

- Shorten a long URL to a 6-character short code.
- Redirect to the original URL using the short code.
- Get details of a shortened URL.
- Soft delete a shortened URL.
- Error handling with specific messages.
- URL validation.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (running on localhost or a different URI)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd url-shortener
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root of the project.
2.  Add the following environment variables:

    ```
    PORT=5000
    MONGO_URI=mongodb://localhost/urlShortener
    APP_BASE_URL=http://localhost:5000
    ```

    - `PORT`: The port on which the server will run (default is 5000).
    - `MONGO_URI`: The connection string for your MongoDB database.
    - `APP_BASE_URL`: The base URL of your application. Use `http://localhost:<PORT>` for local development and your domain for production (e.g., `https://yourdomain.com`).

### Running the Application

To start the server, run the following command:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default is 5000).

### Development Scripts

- **`npm run format`**: Formats the code using Prettier.
- **`npm run lint`**: Runs ESLint to check for code quality issues.
- **`npm run lint:fix`**: Runs ESLint and automatically fixes fixable code quality issues.

## API Documentation

### `POST /api/v1/shorten`

Create a new shortened URL.

**Request Body:**

```json
{
    "url": "https://www.example.com/a-very-long/url-to/shorten"
}
```

**Success Response (201 Created):**

```json
{
    "originalURL": "https://www.example.com/a-very-long-url-to-shorten",
    "shortCode": "EaF2bN",
    "shortURL": "/EaF2bN",
    "createdAt": "2025-11-25T12:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: If the `url` is missing or invalid.
- `500 Internal Server Error`: For any other server-side errors.

### `GET /:shortCode`

Redirect to the original URL.

**URL Parameters:**

- `shortCode` (required): The 6-character short code.

**Success Response:**

- A `302 Found` redirect to the original URL.

**Error Response:**

- `404 Not Found`: If the `shortCode` does not exist or has been deleted.
- `400 Bad Request`: If the `shortCode` is invalid.

### `GET /api/v1/urls/:shortCode`

Get details of a shortened URL.

**URL Parameters:**

- `shortCode` (required): The 6-character short code.

**Success Response (200 OK):**

```json
{
    "originalURL": "https://www.example.com/a-very-long-url-to-shorten",
    "shortCode": "EaF2bN",
    "shortURL": "/EaF2bN",
    "createdAt": "2025-11-25T12:00:00.000Z"
}
```

**Error Response:**

- `404 Not Found`: If the `shortCode` does not exist or has been deleted.
- `400 Bad Request`: If the `shortCode` is invalid.

### `DELETE /api/v1/urls/:shortCode`

Delete a shortened URL.

**URL Parameters:**

- `shortCode` (required): The 6-character short code.

**Success Response (200 OK):**

```json
{
    "message": "Short URL deleted successfully"
}
```

**Error Response:**

- `404 Not Found`: If the `shortCode` does not exist or has already been deleted.
- `400 Bad Request`: If the `shortCode` is invalid.

## Architecture

The application follows a layered architecture, separating concerns into distinct components, drawing parallels from the Model-View-Controller (MVC) pattern for clarity in a backend-only context:

- **`server.js`**: The entry point of the application, responsible for setting up the Express server and connecting to the database.
- **`src/app.js`**: Configures middleware, error handling, and registers API routes.
- **`src/api/routes`**: Defines the API endpoints and maps them to their respective controller functions.
- **`src/components/[feature]/[feature].controller.js`**: Handles incoming requests for a specific feature, interacts with its service layer, and sends JSON responses.
- **`src/components/[feature]/[feature].service.js`**: Contains the business logic for a specific feature, interacting with its model to perform operations.
- **`src/components/[feature]/[feature].model.js`**: Defines the Mongoose schema for a specific feature's data and interacts directly with MongoDB.
- **`src/middleware/errorHandler.js`**: Centralized error handling middleware.

## Database Schema Design

The application uses MongoDB to store URL information. There is one primary data schema, `ShortenedURL`, which is defined as follows:

```javascript
const shortenedURLSchema = new mongoose.Schema({
    originalURL: {
        type: String,
        required: true,
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
});
```

- **`originalURL`**: The original long URL provided by the user (String, Required).
- **`shortCode`**: A unique 6-character code generated for the original URL (String, Required, Unique).
- **`createdAt`**: The timestamp when the URL was shortened (Date, Defaults to current time).
- **`deleted`**: A flag to indicate if the URL has been soft-deleted (Boolean, Defaults to `false`).

## File Structure

The project follows a modular file structure, organizing code by concern. Here's an overview:

```
.
├── eslint.config.mjs                 # ESLint configuration for code linting
├── package.json                      # Project metadata and dependencies
├── README.md                         # Project documentation
├── server.js                         # Main application entry point, sets up server and DB connection
└── src/                              # Source code directory
    ├── app.js                        # Express app setup, middleware, and route registration
    ├── api/                          # API specific configurations and routes
    │   └── routes/                   # Defines API endpoints
    │       ├── index.js              # Aggregates and exports all API routes
    │       └── shorten.route.js      # Routes related to URL shortening
    ├── components/                   # Feature-specific modules
    │   └── shorten/                  # Module for the URL shortening feature
    │       ├── shorten.controller.js # Handles request/response for shorten feature
    │       ├── shorten.model.js      # Mongoose model for URL data
    │       └── shorten.service.js    # Business logic for URL shortening
    ├── config/                       # Application configuration settings
    │   └── index.js                  # Central configuration file
    ├── middleware/                   # Express middleware functions
    │   └── errorHandler.js           # Global error handling middleware
```

## Architecture Decisions

### Choosing the Language & Runtime: Node.js (JavaScript)

**Context:**  
The API needs to handle fast redirects, perform mostly I/O operations, and be built quickly. Most work involves reading/writing to the database and serving responses with minimal CPU-heavy logic.

**Alternatives Considered:**

- **Python (FastAPI)** – Easy to write but slower under heavy concurrency.
- **Go (Gin/Fiber)** – Extremely fast but requires more development time.
- **Java (Spring Boot)** – Powerful but too heavy for a small service.
- **Node.js (JavaScript)** – Fast to develop, ideal for I/O workloads.

**Decision:**  
Use **Node.js** with **JavaScript**.

**Rationale:**

- Excellent for handling high concurrency through non-blocking I/O.
- Very fast development with minimal boilerplate.
- Large ecosystem and native JSON support.
- Easy to scale using microservices or serverless platforms (AWS Lambda, Vercel).
- Developer familiarity reduces risk and speeds up implementation.

**Consequences:**

- **Positive:** Fast delivery, good performance, easy maintenance, large community.
- **Negative:** Not ideal for CPU-intensive tasks; async error handling requires care.

---

### Choosing the Web Framework: Express.js

**Context:**  
The project needs a small, clean, maintainable REST API. The framework should be simple, well-supported, and quick to set up.

**Alternatives Considered:**

| Framework   | Pros                                            | Cons                                  |
| ----------- | ----------------------------------------------- | ------------------------------------- |
| **Express** | Simple, minimal, familiar, huge ecosystem       | Requires manual project structuring   |
| **NestJS**  | Strong architecture, scalable, TypeScript-first | Slower to set up; more learning curve |
| **Fastify** | Very fast, modern plugin system                 | Smaller ecosystem; less familiar      |

**Decision:**  
Use **Express.js**.

**Rationale:**

- Familiarity → faster development and debugging.
- Lightweight and flexible → fits the small project requirements.
- Mature ecosystem with plenty of middleware and examples.
- Stable and widely used across production systems.

**Consequences:**

- **Positive:** Quick setup, flexible architecture, easy maintenance.
- **Negative:** Requires defining project conventions manually as the project grows.

---

### Choosing the Database: MongoDB

**Context:**  
The project stores structured but flexible data (URLs with metadata). The schema may evolve over time, so a database with an adaptable schema and fast development workflow is preferred.

**Alternatives Considered:**

| Database       | Pros                                                            | Cons                                              |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| **MongoDB**    | Flexible schema, JSON-like documents, great Node.js integration | Weaker joins; consistency requires careful design |
| **PostgreSQL** | Strong relational modeling, strict consistency                  | Requires migrations; less flexible                |
| **MySQL**      | Simple, reliable                                                | Rigid schema; not ideal for frequent changes      |
| **DynamoDB**   | Serverless and highly scalable                                  | Vendor lock-in; complex modeling                  |

**Decision:**  
Use **MongoDB**.

**Rationale:**

- Schema flexibility simplifies future changes.
- Very fast CRUD development with JSON/BSON documents.
- Excellent integration with Node.js and Mongoose.
- Supports replication and sharding for horizontal scaling.
- Natural fit for JSON-based API workflows.

**Consequences:**

- **Positive:** Faster development, easier iteration, scalable architecture.
- **Negative:** Less relational power compared to SQL databases.

---

## Design Trade-offs

### Flexibility vs. Strict Structure

Choosing Express.js and MongoDB provides flexibility and rapid iteration, but comes with fewer built-in constraints than frameworks like NestJS or relational databases.

### Simplicity vs. Advanced Features

Express keeps the API lightweight but lacks built-in modules or patterns.  
To mitigate this, a layered architecture (controllers → services → models) was manually defined for clarity and scalability.

### Speed of Development vs. Type Safety

Using JavaScript speeds up development but sacrifices some type-level safety.  
The structure allows migrating to TypeScript later.

### NoSQL Flexibility vs. Relational Guarantees

MongoDB enables schema flexibility, but offers weaker relational guarantees compared to SQL.  
This is acceptable because the data model is simple and does not require complex joins.

### Performance vs. Complexity

Node.js excels at I/O-bound workloads but isn’t ideal for CPU-heavy operations.  
For a URL shortener—mostly lookups and redirects—the trade-off is appropriate.
