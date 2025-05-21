#!/bin/bash

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
  export FLASK_ENV=development
  echo "启动开发环境..."
elif [ "$1" = "test" ] || [ "$1" = "testing" ]; then
  export FLASK_ENV=testing
  echo "启动测试环境..."
elif [ "$1" = "prod" ] || [ "$1" = "production" ]; then
  export FLASK_ENV=production
  echo "启动生产环境..."
else
  echo "请指定环境: dev/test/prod"
  exit 1
fi

echo "使用环境配置: $FLASK_ENV"
python app.py
