@echo off
echo 正在检查Python环境...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到Python！请安装Python 3.6+
    exit /b 1
)

echo Python版本:
python --version

rem 检查虚拟环境
if not exist .venv (
    echo 正在创建虚拟环境...
    python -m venv .venv
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 无法创建虚拟环境，请确保已安装venv模块
        exit /b 1
    )
)

rem 激活虚拟环境
if exist .venv\Scripts\activate.bat (
    echo 正在激活虚拟环境...
    call .venv\Scripts\activate.bat
) else (
    echo 错误: 虚拟环境激活脚本未找到
    exit /b 1
)

rem 安装依赖
echo 正在安装依赖...
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 安装依赖失败
    exit /b 1
)

rem 启动Python后端服务器
echo 正在启动服务器...
python app.py 