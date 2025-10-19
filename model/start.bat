@echo off
setlocal
REM Ensure we run from the directory of this script (model/)
cd /d "%~dp0"
echo Starting AgriClip FastAPI Model Service...

:: Use a persistent local cache for Hugging Face to avoid re-downloading
set "HF_HOME=%~dp0\.hf_cache"
set "TRANSFORMERS_CACHE=%HF_HOME%"
if not exist "%HF_HOME%" (
    mkdir "%HF_HOME%"
)

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

:: Install PyTorch CPU wheels first to avoid build/index issues
echo Installing PyTorch CPU wheels...
python -m pip install --upgrade pip setuptools wheel
pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision --no-cache-dir

:: Install core dependencies explicitly to avoid sdist build issues on Python 3.13
echo Installing core Python packages...
pip install "transformers>=4.40.0" fastapi==0.104.1 uvicorn==0.24.0 python-multipart==0.0.6 requests==2.31.0 python-dotenv==1.0.0 --no-cache-dir

:: (Optional) Install any remaining requirements if present
if exist requirements.txt (
  echo Installing any remaining requirements from requirements.txt...
  pip install -r requirements.txt --no-cache-dir || echo Skipping remaining requirements due to optional failures.
)

:: Start the FastAPI server
echo Starting FastAPI server...
python main.py
endlocal