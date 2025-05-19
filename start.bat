@echo off
:: AI链接导航站 - Windows启动脚本

echo ====================================
echo    AI链接导航站 - 启动脚本
echo ====================================

:: 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Python，请安装Python 3.6+后重试
    pause
    exit /b 1
)

:: 检查Python版本
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo [信息] 检测到Python版本: %PYVER%

:: 创建虚拟环境（如果不存在）
if not exist ".venv" (
    echo [信息] 创建虚拟环境...
    python -m venv .venv
)

:: 激活虚拟环境
echo [信息] 激活虚拟环境...
call .venv\Scripts\activate.bat

:: 安装依赖
echo [信息] 安装依赖...
pip install -r requirements.txt

:: 启动应用
echo [信息] 启动应用服务器...
echo [信息] 应用将在 http://localhost:5000 运行
echo [信息] 按 Ctrl+C 停止服务
python app.py

:: 如果出现错误，停留在命令行
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 应用启动失败，错误代码: %ERRORLEVEL%
    pause
)