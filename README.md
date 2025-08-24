An attractive README file should be well-structured, easy to read, and provide all the necessary information for a user to understand, set up, and run the project. Here is a polished version of the README you provided, formatted for GitHub.

-----

# BB\_Assessment2

## Document Manager + ONLYOFFICE Integration (MERN)

A full-stack document management application built with the MERN stack, featuring robust authentication, role-based access control, versioned document uploads, and a deep, seamless integration with ONLYOFFICE Document Server for in-browser editing. Users can effortlessly upload, rename, replace, view, and edit documents. Changes made in the ONLYOFFICE editor are automatically saved back to the server, creating a new version of the document.

-----

### Table of Contents

  - [Tech Stack](https://www.google.com/search?q=%23tech-stack)
  - [Features](https://www.google.com/search?q=%23features)
  - [Architecture & Flow](https://www.google.com/search?q=%23architecture--flow)
  - [Directory Structure](https://www.google.com/search?q=%23directory-structure)
  - [Local Setup — Step by Step](https://www.google.com/search?q=%23local-setup--step-by-step)
      - [Prerequisites](https://www.google.com/search?q=%23prerequisites)
      - [1) Start ONLYOFFICE Document Server (Docker)](https://www.google.com/search?q=%231-start-onlyoffice-document-server-docker)
      - [2) Start MongoDB](https://www.google.com/search?q=%232-start-mongodb)
      - [3) Backend Setup](https://www.google.com/search?q=%233-backend-setup)
      - [4) Frontend Setup](https://www.google.com/search?q=%234-frontend-setup)
      - [5) Log in & Try It](https://www.google.com/search?q=%235-log-in--try-it)
  - [Key Implementation Details](https://www.google.com/search?q=%23key-implementation-details)
  - [API Overview](https://www.google.com/search?q=%23api-overview)
  - [Troubleshooting](https://www.google.com/search?q=%23troubleshooting)
  - [Security Notes](https://www.google.com/search?q=%23security-notes)

-----

### Tech Stack

  - **Frontend:** React, React Router, TailwindCSS, Axios, Context API (for Auth)
  - **Backend:** Node.js, Express, Mongoose (MongoDB), Multer (file uploads), JWT
  - **Editor:** ONLYOFFICE Document Server (via Docker)
  - **Database:** MongoDB

### Features

#### Authentication & Authorization

  - User registration and login.
  - Protected routes on both the frontend (using `ProtectedRoute`) and backend (using `auth` middleware).
  - Role-based access control with distinct roles: `admin`, `editor`, and `viewer`.

#### Document Management

  - Upload documents, with files stored on disk (`/uploads`) and metadata + versions in MongoDB.
  - A clear document list showing: `Name`, `MIME type`, `Uploaded by`, and `Last modified timestamp`.
  - Comprehensive actions for each document:
      - **Rename/Replace:** Change the document's name or upload a new file to create a new version.
      - **Editor:** Open the document directly in the ONLYOFFICE editor for in-browser editing.
      - **Delete:** Remove the document (supports soft/hard delete based on implementation).
      - **View:** Open the raw file URL in a new tab for direct viewing.

#### ONLYOFFICE Integration

  - A dedicated backend endpoint (`GET /api/onlyoffice/config/:id`) to return a signed JWT configuration for the ONLYOFFICE editor.
  - The frontend dynamically loads the ONLYOFFICE SDK (`api.js`) and initializes the editor using the signed config.
  - The backend endpoint (`POST /api/onlyoffice/callback/:id`) receives save events from the ONLYOFFICE Document Server, downloads the updated file, and creates a new version in the database.

-----

### Architecture & Flow

1.  **User Authentication:** A user logs in and receives a JWT for session management. This token is used by the frontend to secure API calls.
2.  **Dashboard:** The dashboard lists all documents by fetching data from the backend.
3.  **Editing Flow:**
      - Clicking the `Editor` action triggers a frontend call to `GET /api/onlyoffice/config/:id`.
      - The backend loads the document, builds a configuration object, signs it with `ONLYOFFICE_JWT_SECRET`, and returns it to the frontend.
      - The React component loads the ONLYOFFICE SDK and initializes the editor with the signed configuration.
4.  **Saving Edits:**
      - When the user saves their changes in ONLYOFFICE, the Document Server calls the backend endpoint `POST /api/onlyoffice/callback/:id`.
      - The backend verifies the JWT from the Document Server, downloads the updated file, saves it, and creates a new version entry in the MongoDB database.

> **Important networking note:** The ONLYOFFICE Document Server (running in a Docker container) must be able to reach your backend to download the document and call back. On Windows/Mac Docker, use `http://host.docker.internal:5000` as the public base URL in your backend configuration.

-----

### Directory Structure

```
project-root/
├─ backend/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ uploads/                # Static directory for document files
│  ├─ .env                    # Environment variables for the backend
│  └─ server.js
├─ frontend/
│  ├─ src/
│  │  ├─ pages/ (Login, Dashboard, Editor)
│  │  ├─ components/ (DocumentList, ProtectedRoute)
│  │  ├─ context/ (AuthContext)
│  │  └─ routes/AppRoutes.jsx
│  ├─ .env                    # Environment variables for the frontend
│  └─ package.json
└─ docker/ (optional helper scripts)
```

-----

### Local Setup — Step by Step

#### Prerequisites

  - [Node.js](https://nodejs.org/) (version 18+) & `npm`
  - [MongoDB](https://www.mongodb.com/) (local installation or [MongoDB Atlas](https://www.google.com/search?q=https://www.mongodb.com/cloud/atlas/lp/try2%3Futm_source%3Dgoogle%26utm_campaign%3Dgbl.ww.all.dev.core.brand.exact%26utm_term%3Dmongodb%26utm_medium%3Dcpc_ads%26utm_content%3DB%26gad_source%3D1%26gclid%3DCj0KCQjwhfjpBhCmARIsAG-KyPmLbS5y_4f_2uL4B2Ym1j9B9f3d9B6W1hM7F8f-9d3g4n3f4i0m5r6f3) account)
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for ONLYOFFICE)

#### Backend: Environment Variables

Create a file named `.env` in the `backend/` directory with the following content:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://skumarva1999:Sk.v.a1999@cluster0.5ky1gwz.mongodb.net/pdf

# App Auth (for user login)
JWT_SECRET=super_app_secret

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:3000

# File Uploads
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=50mb

# ONLYOFFICE Integration
# This URL MUST be reachable from inside the ONLYOFFICE Docker container.
# For Windows/Mac Docker, use host.docker.internal.
APP_PUBLIC_BASE=http://host.docker.internal:5000

# The URL where ONLYOFFICE Document Server is accessible from your browser.
ONLYOFFICE_DS_URL=http://localhost:8080

# The secret key for JWT signing; MUST match the Document Server's JWT_SECRET.
ONLYOFFICE_JWT_SECRET=mysecret123
```

#### Frontend: Environment Variables

Create a file named `.env` in the `frontend/` directory:

```ini
# Vite example
VITE_API_BASE=http://localhost:5000
```

> Alternatively, you can configure a dev proxy in your `vite.config.js` or `package.json` to route `/api` requests to the backend.

#### 1\) Start ONLYOFFICE Document Server (Docker)

Pull and run the container with JWT enabled:

```bash
docker pull onlyoffice/documentserver

docker run -it -d -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=mysecret123 \
  --name onlyoffice \
  onlyoffice/documentserver
```

> **Verification:** To ensure it's running correctly, open `http://localhost:8080/web-apps/apps/api/documents/api.js` in your browser. You should see JavaScript code.

#### 2\) Start MongoDB

Start your local MongoDB daemon, or ensure your `MONGO_URI` is correctly configured for your MongoDB Atlas instance.

#### 3\) Backend Setup

```bash
cd backend
npm install
mkdir -p uploads                # Ensure the upload directory exists
npm run dev
```

You should see logs indicating the server is running on `port 5000` and `MongoDB connected`.

#### 4\) Frontend Setup

```bash
cd ../frontend
npm install
npm run dev     # for Vite
# or
npm start       # for Create React App
```

The frontend will run at `http://localhost:3000`.

#### 5\) Log in & Try It

  - Navigate to the registration page and create a new user.
  - Log in with your new user credentials.
  - Go to the dashboard.
  - Upload a document and test the various actions: **Rename/Replace**, **Editor**, **Delete**, and **View**.

-----

### Key Implementation Details

#### ONLYOFFICE Config Endpoint

  - **Route:** `GET /api/onlyoffice/config/:id`
  - This endpoint is protected by `auth` and `authorizeRoles` middleware.
  - It fetches the document by its ID and constructs the ONLYOFFICE configuration object, including the `document.url` (using `APP_PUBLIC_BASE`) and the `editorConfig.callbackUrl`.
  - The entire configuration object is then signed with the `ONLYOFFICE_JWT_SECRET`, and the token is embedded as `config.token`.

#### Dashboard & Document List Actions

  - **Rename/Replace:** Handled via a modal that calls a `PATCH` request to the backend.
  - **Editor:** A simple navigation using `react-router`: `Maps("/editor/" + doc._id + "?mode=edit")`.
  - **View:** Opens the raw file directly in a new tab, bypassing the ONLYOFFICE editor.

-----

### API Overview

All routes are prefixed with `/api`.

#### Auth Routes

  - `POST /auth/register`: Create a new user.
  - `POST /auth/login`: Authenticate and log in a user.
  - `POST /auth/logout`: Log out a user.

#### Document Routes (Protected)

  - `GET /documents`: List all documents.
  - `POST /documents`: Upload a new document (roles: `admin`, `editor`).
  - `PATCH /documents/:id`: Rename or replace a document.
  - `DELETE /documents/:id`: Delete a document.
  - `GET /uploads/:file`: Serve the static file (public access).

#### ONLYOFFICE Routes (Protected)

  - `GET /onlyoffice/config/:id`: Returns the signed editor configuration (roles: `admin`, `editor`, `viewer`).
  - `POST /onlyoffice/callback/:id`: Receives save events from ONLYOFFICE.

-----

### Troubleshooting

  - **`{"message":"Authorization required"}` in the editor tab:**

      - Ensure `JWT_ENABLED=true` and `JWT_SECRET=mysecret123` are correctly set in both your Docker run command and the backend `.env` file.
      - Verify that the backend is correctly signing the config object before sending it to the frontend.

  - **`DocsAPI is not defined`:**

      - Confirm that `http://localhost:8080/web-apps/apps/api/documents/api.js` loads in your browser.
      - Check that the script tag for `api.js` is correctly placed and loads before the call to `new DocsAPI.DocEditor(...)`.

  - **Document Server cannot download the file or call back:**

      - This is a common issue with Docker networking. Ensure your `APP_PUBLIC_BASE` is correctly set.
      - For Windows/Mac Docker, use `http://host.docker.internal:5000`.
      - For Linux, you may need to use `--add-host=host.docker.internal:host-gateway` in your `docker run` command or use your host's IP address.

-----

### Security Notes

  - **Do not commit secrets:** Always use `.env` files and add them to your `.gitignore`.
  - **Input Validation:** Restrict file uploads by MIME type and maximum size.
  - **Server-side Validation:** Always validate user permissions (roles) for sensitive actions like editing or deleting documents on the backend.
  - **Production Security:** In a production environment, both your backend API and the ONLYOFFICE Document Server should be secured with **HTTPS**.
