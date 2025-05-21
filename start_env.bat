@echo off

if "%1"=="dev" (
  set FLASK_ENV=development
  echo 启动开发环境...
) else if "%1"=="test" (
  set FLASK_ENV=testing
  echo 启动测试环境...
) else if "%1"=="prod" (
  set FLASK_ENV=production
  echo 启动生产环境...
) else (
  echo 请指定环境: dev/test/prod
  exit /b 1
)

echo 使用环境配置: %FLASK_ENV%
python app.py
