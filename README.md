# Project AOA

This is the repository for Project AOA - Attention, Obsession, Agency. 
It's a simple web app surfacing three questions each morning:

1. Where is your attention today?
2. Are you obsessed with it?
3. What acts of agency are you taking for it? 

AOA is a simple tool to help you proactively set today's attention, check whether it aligns with your long-term obsessions, and reminds of your innate capacity to exercise agency. 

Yes, it's rather a philosophical project and you can read all about it here: [link](https://www.soulchoi.com/soul/AOA_introduction)



### Screenshot: 


It's a web application with a FastAPI backend, Postgres DB and a React(Next.js, TypeScript, Tailwind CSS, shadcn/ui frontend). This version lets you build your own with Docker. 

## Getting Started

### Prerequisites
- Docker
- Docker Compose
- Node.js and npm (for the frontend)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aoa.git
    cd aoa
    ```

2.  **Create your environment file:**
    Copy the example .env template. Make sure to review the variables in `.env` and provide your own values. 
    ```bash
    cp .env.example .env
    ```
    Your `.env.example` file contains the following variables. You should set your `POSTGRES_PASSWORD` in the new `.env` file.

    ```
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=__changeme__
    POSTGRES_DB=aoa_app #do not change this, or if you really want to, modify the /postgres/initdb/01-grant_permissions.sql accordingly as well.
    DATABASE_URL="postgresql://postgres:__changeme__@db:5432/aoa_dev"
    ```

3.  **Build and Run Backend Services:**
    This command will build the backend image and start the database and backend services in the background.
    ```bash
    docker-compose up -d --build
    ```

4.  **Apply Database Migrations:**
    Once the containers are running, apply the initial database schema.
    ```bash
    docker-compose exec backend alembic upgrade head
    ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
3. **Run the development server:**
   ```bash
   npm run dev
   ```

## Usage

- The backend API will be available at `http://localhost:8000`.
- The frontend development server will be running at `http://localhost:3000`.

To stop all the services (backend and database), run:
```bash
docker-compose down
```
To stop the frontend development server, press `Ctrl+C` in the terminal where it is running.

---
### To Stop the Application
```bash
docker-compose down