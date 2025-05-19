#!/bin/bash

# 项目启动脚本 (Linux/Mac)

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

# 输出标题
echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}   AI链接导航站 - 启动脚本   ${NC}"
echo -e "${BLUE}====================================${NC}"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: 未检测到Python 3，请安装Python 3.6+后重试${NC}"
    exit 1
fi

# 检查Python版本
PY_VERSION=$(python3 -V 2>&1 | awk '{print $2}')
PY_VERSION_MAJOR=$(echo $PY_VERSION | cut -d. -f1)
PY_VERSION_MINOR=$(echo $PY_VERSION | cut -d. -f2)

echo -e "${CYAN}检测到Python版本: ${PY_VERSION}${NC}"

if [ "$PY_VERSION_MAJOR" -lt 3 ] || ([ "$PY_VERSION_MAJOR" -eq 3 ] && [ "$PY_VERSION_MINOR" -lt 6 ]); then
    echo -e "${RED}错误: 需要Python 3.6+，当前版本为 ${PY_VERSION}${NC}"
    exit 1
fi

# 创建虚拟环境（如果不存在）
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}创建虚拟环境...${NC}"
    python3 -m venv .venv
fi

# 激活虚拟环境
echo -e "${YELLOW}激活虚拟环境...${NC}"
source .venv/bin/activate

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
pip install -r requirements.txt

# 启动应用
echo -e "${GREEN}启动应用服务器...${NC}"
echo -e "${GREEN}应用将在 http://localhost:5000 运行${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
python app.py