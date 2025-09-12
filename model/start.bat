@echo off
echo Starting AgriClip FastAPI Model Service...

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or higher.
    exit /b 1
)

:: Check if virtual environment exists, create if not
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install requirements
echo Installing requirements...
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

:: Start the FastAPI server
echo Starting FastAPI server...
python main.py