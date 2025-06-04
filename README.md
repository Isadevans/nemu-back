To set up the database, run the migrations, execute tests, and run the project, follow these steps:

1. **Set up the database**:

* Ensure you have PostgreSQL installed and running.
* Copy the `.env.example` file to a new file named `.env` and ensure the `DATABASE_URL` is correctly configured for your
  local PostgreSQL instance. It should look like this:
  ```dotenv
  DATABASE_URL="postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/nemu?schema=public"
  ```
  Replace `YOUR_POSTGRES_USER` and `YOUR_POSTGRES_PASSWORD` with your PostgreSQL credentials.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run database migrations**:
   This command will apply any pending migrations to your database schema.
   ```bash
   npm run migrate
   ```

4. **Run the project**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.
