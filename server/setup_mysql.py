#!/usr/bin/env python3
"""
MySQL Database Setup Script for BrailleBridge
This script creates the MySQL database and user for the BrailleBridge application.
"""

import mysql.connector
from mysql.connector import Error
import sys
import os

def create_database_and_user():
    """Create MySQL database and user for BrailleBridge"""
    
    # Database configuration
    DB_CONFIG = {
        'host': 'localhost',
        'user': 'root',
        'password': input("Enter MySQL root password: "),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci'
    }
    
    DB_NAME = 'braillebridge'
    DB_USER = 'braillebridge_user'
    DB_PASSWORD = input("Enter password for braillebridge_user: ")
    
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("Connected to MySQL server successfully!")
        
        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"Database '{DB_NAME}' created successfully!")
        
        # Create user
        cursor.execute(f"CREATE USER IF NOT EXISTS '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASSWORD}'")
        print(f"User '{DB_USER}' created successfully!")
        
        # Grant privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        print(f"Privileges granted to '{DB_USER}' for database '{DB_NAME}'!")
        
        # Test connection with new user
        test_config = {
            'host': 'localhost',
            'user': DB_USER,
            'password': DB_PASSWORD,
            'database': DB_NAME,
            'charset': 'utf8mb4'
        }
        
        test_connection = mysql.connector.connect(**test_config)
        test_cursor = test_connection.cursor()
        test_cursor.execute("SELECT 1")
        test_result = test_cursor.fetchone()
        
        if test_result:
            print("✅ Database connection test successful!")
            print("\n📋 Database Configuration:")
            print(f"   Host: localhost")
            print(f"   Port: 3306")
            print(f"   Database: {DB_NAME}")
            print(f"   User: {DB_USER}")
            print(f"   Password: {DB_PASSWORD}")
            print(f"\n🔗 Connection URL:")
            print(f"   mysql+pymysql://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_NAME}")
            
            # Create .env file
            env_content = f"""# Database Configuration
DATABASE_URL=mysql+pymysql://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_NAME}
DB_HOST=localhost
DB_PORT=3306
DB_USER={DB_USER}
DB_PASSWORD={DB_PASSWORD}
DB_NAME={DB_NAME}

# Server Configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=development

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
ALLOWED_EXTENSIONS=.pdf,.png,.jpg,.jpeg,.docx,.txt

# OCR Configuration
TESSERACT_CMD=
OCR_LANGUAGES=eng+hin+tam+tel+ben+guj+kan+mal+mar+ori+pan+urd

# Text-to-Speech Configuration
TTS_LANGUAGE=en
TTS_RATE=150

# Braille Configuration
BRAILLE_GRADE=grade1

# API Keys (Optional)
OPENAI_API_KEY=
GOOGLE_TTS_API_KEY=
"""
            
            with open('.env', 'w') as f:
                f.write(env_content)
            print(f"\n📄 Created .env file with database configuration!")
            
        test_cursor.close()
        test_connection.close()
        
    except Error as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
        
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("\n🔌 MySQL connection closed.")

if __name__ == "__main__":
    print("🚀 BrailleBridge MySQL Database Setup")
    print("=" * 40)
    
    # Check if MySQL is installed
    try:
        import mysql.connector
    except ImportError:
        print("❌ mysql-connector-python is not installed!")
        print("Please install it with: pip install mysql-connector-python")
        sys.exit(1)
    
    create_database_and_user()
    
    print("\n✅ Setup completed successfully!")
    print("\nNext steps:")
    print("1. Install MySQL dependencies: pip install -r requirements.txt")
    print("2. Run the application: python main.py")
