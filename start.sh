#!/bin/bash

echo "正在检查Python环境..."
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "错误: 未找到Python！请安装Python 3.6+"
    exit 1
fi

echo "Python版本:"
$PYTHON --version

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "正在创建虚拟环境..."
    $PYTHON -m venv .venv
    if [ $? -ne 0 ]; then
        echo "错误: 无法创建虚拟环境，请确保已安装venv模块"
        exit 1
    fi
fi

# 激活虚拟环境
if [ -f ".venv/bin/activate" ]; then
    echo "正在激活虚拟环境..."
    source .venv/bin/activate
else
    echo "错误: 虚拟环境激活脚本未找到"
    exit 1
fi

# 安装依赖
echo "正在安装依赖..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "错误: 安装依赖失败"
    exit 1
fi

# 启动Python后端服务器
echo "正在启动服务器..."
python app.py 