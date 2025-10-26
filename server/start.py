#!/usr/bin/env python3
"""
BrailleBridge Backend Startup Script
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def check_dependencies():
    """Check if required system dependencies are installed."""
    dependencies = {
        'tesseract': 'tesseract --version',
        'ffmpeg': 'ffmpeg -version'
    }
    
    missing = []
    for dep, command in dependencies.items():
        try:
            subprocess.run(command.split(), capture_output=True, check=True)
            print(f"✅ {dep} is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"❌ {dep} is not installed")
            missing.append(dep)
    
    if missing:
        print(f"\n⚠️  Missing dependencies: {', '.join(missing)}")
        print("Please install them before running the application:")
        print("- Tesseract: https://tesseract-ocr.github.io/tessdoc/Installation.html")
        print("- FFmpeg: https://ffmpeg.org/download.html")

def setup_environment():
    """Set up environment variables."""
    env_file = Path('.env')
    if not env_file.exists():
        env_example = Path('.env.example')
        if env_example.exists():
            env_file.write_text(env_example.read_text())
            print("✅ Created .env file from .env.example")
        else:
            print("⚠️  No .env.example file found")
    else:
        print("✅ .env file exists")

def create_directories():
    """Create necessary directories."""
    directories = ['uploads', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def install_requirements():
    """Install Python requirements."""
    requirements_file = Path('requirements.txt')
    if requirements_file.exists():
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
            print("✅ Python dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Python dependencies")
            return False
    else:
        print("❌ requirements.txt not found")
        return False
    return True

def main():
    """Main startup function."""
    print("🚀 BrailleBridge Backend Startup")
    print("=" * 40)
    
    # Check Python version
    check_python_version()
    
    # Check system dependencies
    check_dependencies()
    
    # Set up environment
    setup_environment()
    
    # Create directories
    create_directories()
    
    # Install requirements
    if not install_requirements():
        print("❌ Setup failed")
        sys.exit(1)
    
    print("\n✅ Setup completed successfully!")
    print("\nTo start the server, run:")
    print("  python main.py")
    print("\nOr for development with auto-reload:")
    print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    main()
