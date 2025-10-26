# MySQL Setup Guide for BrailleBridge

## Prerequisites

1. **Install MySQL Server**
   - Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
   - Install MySQL Server (choose "Developer Default" or "Server only")
   - Set root password during installation
   - Make sure MySQL service is running

2. **Install MySQL Dependencies**
   ```bash
   pip install PyMySQL cryptography mysql-connector-python
   ```

## Database Setup

### Option 1: Using the Setup Script (Recommended)

1. Run the MySQL setup script:
   ```bash
   cd server
   python setup_mysql.py
   ```

2. Follow the prompts to:
   - Enter MySQL root password
   - Create a password for the braillebridge_user
   - The script will create the database and user automatically

### Option 2: Manual Setup

1. **Connect to MySQL as root:**
   ```bash
   mysql -u root -p
   ```

2. **Create database and user:**
   ```sql
   CREATE DATABASE braillebridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'braillebridge_user'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON braillebridge.* TO 'braillebridge_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Create .env file:**
   ```bash
   cd server
   cp .env.example .env
   ```

4. **Edit .env file with your database credentials:**
   ```
   DATABASE_URL=mysql+pymysql://braillebridge_user:your_password_here@localhost:3306/braillebridge
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=braillebridge_user
   DB_PASSWORD=your_password_here
   DB_NAME=braillebridge
   ```

## Testing the Connection

1. **Test MySQL connection:**
   ```bash
   cd server
   python -c "from app.database import engine; print('MySQL connection successful!')"
   ```

2. **Run the application:**
   ```bash
   python main.py
   ```

## Troubleshooting

### Common Issues:

1. **"Access denied" error:**
   - Check MySQL root password
   - Ensure MySQL service is running
   - Verify user permissions

2. **"Can't connect to MySQL server":**
   - Check if MySQL service is running
   - Verify port 3306 is not blocked
   - Check firewall settings

3. **"Unknown database" error:**
   - Run the setup script again
   - Manually create the database

4. **"Module not found" errors:**
   - Install missing dependencies: `pip install PyMySQL cryptography mysql-connector-python`

### Useful MySQL Commands:

```sql
-- Check if database exists
SHOW DATABASES;

-- Check users
SELECT User, Host FROM mysql.user;

-- Check user privileges
SHOW GRANTS FOR 'braillebridge_user'@'localhost';

-- Drop and recreate database (if needed)
DROP DATABASE IF EXISTS braillebridge;
CREATE DATABASE braillebridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Migration from SQLite

If you're migrating from SQLite:

1. **Backup existing data (if any):**
   ```bash
   sqlite3 braillebridge.db .dump > backup.sql
   ```

2. **Delete SQLite database:**
   ```bash
   rm braillebridge.db
   ```

3. **Follow MySQL setup steps above**

4. **Restore data (if needed):**
   - Convert SQLite dump to MySQL format
   - Import into MySQL database

## Production Considerations

For production deployment:

1. **Use environment variables for sensitive data**
2. **Set up proper MySQL user with limited privileges**
3. **Enable SSL connections**
4. **Configure connection pooling**
5. **Set up database backups**
6. **Use a strong SECRET_KEY**

## Next Steps

After successful MySQL setup:

1. Install all dependencies: `pip install -r requirements.txt`
2. Run the application: `python main.py`
3. Test registration/login functionality
4. Verify database tables are created automatically
