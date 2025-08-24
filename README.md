# BB_Assessment2
Assessment 2

Document Manager + ONLYOFFICE Integration (MERN)

A full-stack document management app with authentication, role-based access, versioned uploads, and deep integration with ONLYOFFICE Document Server for in-browser editing. Users can upload, rename/replace, view, and edit documents; changes made in the editor are saved back to the server as new versions.

Table of Contents

Tech Stack

Features

Architecture & Flow

Directory Structure

Backend: Environment Variables

Frontend: Environment Variables

Local Setup — Step by Step

Prerequisites

1) Start ONLYOFFICE Document Server (Docker)

2) Start MongoDB

3) Backend Setup

4) Frontend Setup

5) Log in & Try It

Key Implementation Details

ONLYOFFICE Config Endpoint

Editor Page (React)

Dashboard & Document List Actions

API Overview

Troubleshooting

Security Notes

Tech Stack

Frontend: React, React Router, TailwindCSS, Axios, Context API (Auth)

Backend: Node.js, Express, Mongoose (MongoDB), Multer (uploads), JWT

Editor: ONLYOFFICE Document Server (Docker)

Database: MongoDB

Auth & Roles: auth middleware + authorizeRoles('admin','editor','viewer')

Features
Authentication & Authorization

User registration & login.

Protected routes on both frontend (React ProtectedRoute) and backend (auth middleware).

Role-based access: admin, editor, viewer.

Document Management

Upload documents (stores file on disk in /uploads, metadata + versions in MongoDB).

List documents with:

Name

MIME type

Uploaded by

Last modified timestamp

Actions per document:

Rename/Replace – change name or upload a new file version.

Editor – open the file in ONLYOFFICE editor (/editor/:id?mode=edit).

Delete – remove the document (soft/hard delete as implemented).

View – open the raw file URL (http://localhost:5000/uploads/<file>).

ONLYOFFICE Integration

GET /api/onlyoffice/config/:id returns a signed config (JWT) for the editor.

Editor loads api.js from Document Server and initializes DocsAPI.DocEditor.

POST /api/onlyoffice/callback/:id receives save events from Document Server, downloads the updated file, and creates a new version in MongoDB.

Architecture & Flow

User logs in → receives session/JWT used by the frontend (withCredentials or Authorization header).

Dashboard lists docs via backend.

Clicking Editor:

Frontend calls GET /api/onlyoffice/config/:id (protected).

Backend returns a config object + embedded JWT token (signed with ONLYOFFICE_JWT_SECRET).

React page loads Document Server’s api.js and initializes the editor with that config.

When the user saves in ONLYOFFICE:

Document Server calls POST /api/onlyoffice/callback/:id.

Backend verifies JWT, downloads the updated file, stores a new version, and updates metadata.

Clicking View:

Frontend opens http://localhost:5000/uploads/<file> directly in a new tab (no ONLYOFFICE).

Important networking note: Document Server (running in Docker) must be able to reach your backend to download the document and call back. On Windows/Mac Docker, use http://host.docker.internal:5000 in backend config as the public base for file URLs and callbacks.

Directory Structure

project-root/
├─ backend/
│  ├─ controllers/
│  │  └─ onlyoffice.controller.js
│  ├─ middleware/
│  │  ├─ auth.middleware.js
│  │  └─ role.middleware.js
│  ├─ models/
│  │  └─ Document.model.js
│  ├─ routes/
│  │  ├─ onlyoffice.routes.js
│  │  └─ document.routes.js (upload/list/update/delete)
│  ├─ uploads/                # static files served to clients & Document Server
│  ├─ .env
│  └─ server.js (Express boot)
├─ frontend/
│  ├─ src/
│  │  ├─ pages/ (Login, Register, Dashboard, Editor)
│  │  ├─ components/ (DocumentList, UploadForm, ProtectedRoute)
│  │  ├─ routes/AppRoutes.jsx
│  │  └─ context/AuthContext.jsx
│  ├─ .env
│  └─ dev server config (Vite/CRA)
└─ docker/ (optional helpers)


Backend: Environment Variables

Create backend/.env:

# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://skumarva1999:Sk.v.a1999@cluster0.5ky1gwz.mongodb.net/pdf

# App Auth (your app's own JWT for user login)
JWT_SECRET=super_app_secret

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:3000

# File uploads
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=50mb

# ONLYOFFICE
# IMPORTANT: When Document Server runs in Docker on Windows/Mac, it reaches your host via host.docker.internal
# For Linux, see the note below in "Troubleshooting".
APP_PUBLIC_BASE=http://host.docker.internal:5000

# Where the Document Server is accessible from the browser
ONLYOFFICE_DS_URL=http://localhost:8080

# Must match the Document Server container env JWT_SECRET
ONLYOFFICE_JWT_SECRET=mysecret123


Notes

APP_PUBLIC_BASE must be reachable from inside the Document Server container (not just from your browser).

Windows/Mac Docker: http://host.docker.internal:5000 ✅

Linux: use the host IP or run the container with --add-host=host.docker.internal:host-gateway and keep host.docker.internal.

ONLYOFFICE_DS_URL is what your browser uses to load api.js.

Frontend: Environment Variables

Create frontend/.env (if you rely on an axios base URL):

# Vite example
VITE_API_BASE=http://localhost:5000

Or keep relative paths (as in your current code) and set a dev proxy so /api goes to http://localhost:5000 (and enable CORS on the backend).

Local Setup — Step by Step
Prerequisites

Node.js 18+ & npm

MongoDB (local or Atlas)

Docker Desktop (for ONLYOFFICE)

1) Start ONLYOFFICE Document Server (Docker)

Pull & run:

docker pull onlyoffice/documentserver

docker run -it -d -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=mysecret123 \
  --name onlyoffice \
  onlyoffice/documentserver

Verify it serves the SDK:

Open http://localhost:8080/web-apps/apps/api/documents/api.js
 in your browser.
You should see JavaScript (no 404).

If you’re on Linux, and you want host.docker.internal to resolve inside the container, run:

docker run -it -d -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=mysecret123 \
  --add-host=host.docker.internal:host-gateway \
  --name onlyoffice \
  onlyoffice/documentserver

2) Start MongoDB

Local Mongo:
mongod

3) Backend Setup
cd backend
cp .env.example .env            # if you have an example file; otherwise create .env as above
npm install
mkdir -p uploads                # ensure upload directory exists and is writable
npm run dev                     # or: npm start

Expected logs:

Server listening on port 5000

MongoDB connected

Static /uploads being served

4) Frontend Setup
cd ../frontend
npm install
npm run dev     # Vite
# or
npm start       # CRA

Frontend runs at http://localhost:3000
.

5) Log in & Try It

Register & log in (or seed a user).

Go to Dashboard.

Upload a document.

Use Actions:

Rename/Replace → change name or file.

Editor → opens /editor/:id?mode=edit, loads ONLYOFFICE editor.

Delete → removes the document.

View → opens http://localhost:5000/uploads/<file> in a new tab.

Key Implementation Details
ONLYOFFICE Config Endpoint

Route: GET /api/onlyoffice/config/:id (protected by auth + authorizeRoles)

Loads Document by id.

Builds config:

document.url → must be reachable by the Docker container (use APP_PUBLIC_BASE).

editorConfig.callbackUrl → where DS posts save events.

Signs the entire config with ONLYOFFICE_JWT_SECRET and embeds config.token.

Example (simplified):

Key Implementation Details

Dashboard & Document List Actions

Rename/Replace → Opens a modal to update name or file (uses updateDocument).

Editor → navigate("/editor/" + doc._id + "?mode=edit")

Delete → Calls deleteDocument.

View → Opens raw file directly (no ONLYOFFICE):

API Overview

Paths are prefixed with /api.

Auth

POST /auth/register – create user

POST /auth/login – login (returns cookie or JWT)

POST /auth/logout – logout

Documents

GET /documents – list documents (protected)

POST /documents – upload (protected; admin/editor)

PATCH /documents/:id – rename/replace (protected; role-checked)

DELETE /documents/:id – delete (protected; role-checked)

GET /uploads/:file – static file (public)

ONLYOFFICE

GET /onlyoffice/config/:id – returns signed editor config (protected; admin/editor/viewer)

POST /onlyoffice/callback/:id – DS save callback (IP/JWT protected via secret)

Troubleshooting
{"message":"Authorization required"} in the editor tab

Ensure the Document Server container was started with:

-e JWT_ENABLED=true

-e JWT_SECRET=mysecret123

Ensure backend uses the same secret in .env:

ONLYOFFICE_JWT_SECRET=mysecret123

Ensure backend embeds config.token = jwt.sign(config, ONLYOFFICE_JWT_SECRET) and returns it.

DocsAPI is not defined

Wrong or unreachable api.js URL. Check:

http://localhost:8080/web-apps/apps/api/documents/api.js loads in the browser.

Port mapping is 8080:80, not 8085.

The <script> must load before calling new DocsAPI.DocEditor(...).

Blank page / about:blank when opening editor

If opening in new window, create the window before awaiting fetch (popup blockers).

Route-based editor (/editor/:id) avoids popup issues—recommended.

Document Server cannot download the file or call back

Container must reach backend:

Use APP_PUBLIC_BASE=http://host.docker.internal:5000 (Windows/Mac).

On Linux, run container with --add-host=host.docker.internal:host-gateway or use your host IP in APP_PUBLIC_BASE.

Ensure backend serves /uploads statically and file exists.

Callback fails (saves not reflected)

Backend callback verifies JWT; ensure Document Server is sending it in the Authorization header (which it will when JWT_ENABLED=true and secrets match).

Check backend logs to see the callback body and status.

Ensure backend can write to /uploads and your DB Document.versions update is correct.

Security Notes

Do not commit real secrets. Use .env files.

Restrict upload MIME types and max size (MAX_UPLOAD_SIZE).

Validate permissions for edit/delete on the backend.

Consider serving /uploads with auth if needed (currently public for simplicity).

In production, put Document Server and API behind HTTPS.














































































































































































































































































































# Document Management Backend

Stack: Node.js, Express, MongoDB (Mongoose)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Create `uploads/` and `versions/` directories in project root:
   - mkdir uploads versions
3. Install dependencies:
   - npm install
4. Run in development:
   - npm run dev

## Endpoints (high level)

- POST /api/auth/register
- POST /api/auth/login
- GET /api/documents            (list, with filters & pagination)
- POST /api/documents/upload   (upload file)
- GET /api/documents/:id       (metadata)
- GET /api/documents/:id/download
- PUT /api/documents/:id/rename
- POST /api/documents/:id/replace  (upload replacement -> creates new version)
- POST /api/documents/:id/restore-version  (restore previous version)
- DELETE /api/documents/:id    (soft or hard delete by query param ?hard=true)
- GET /api/documents/:id/versions

Role enforcement:
- admin: full CRUD
- editor: upload + edit (replace/rename)
- viewer: read only

## Notes

- Inline editor integration: frontend should open files (download URL), allow editing using OnlyOffice/TinyMCE+plugin, then POST the updated file to `replace` endpoint (which will create a new version and update metadata).
