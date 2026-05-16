# Team Task Manager

A full-stack application for managing projects and tasks with role-based access control.

## Features
- **Authentication**: JWT based registration and login.
- **Roles**: Admin and Member roles.
- **Projects**: Admins can create and manage projects.
- **Tasks**: Admins can assign tasks. Members can update their task status.
- **Dashboard**: Real-time stats on project and task progress, including overdue tasks.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: HTML5, CSS3, Vanilla JS, Bootstrap 5
- **Deployment Ready**: Railway

## Installation Steps (Local Development)

1. Clone the repository.
2. Setup a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/db_name
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```
5. Run the backend server:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
6. Open the `frontend/index.html` file in your browser.

## API Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET /api/dashboard/admin`
- `GET /api/dashboard/member`

## Railway Deployment
1. Push this repository to GitHub.
2. Create a new Railway project and connect the repository.
3. Add a PostgreSQL database service in Railway.
4. Add the following environment variables to your web service:
   - `DATABASE_URL`
   - `SECRET_KEY`
5. Set the Start Command to:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```

## Demo Video
*(Add your demo video link here)*

## Screenshots
*(Add screenshots here)*
