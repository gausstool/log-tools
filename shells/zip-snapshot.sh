#!/bin/bash

# 确保脚本在遇到错误时停止执行
set -e

# 删除旧的目录
echo "删除旧的构建目录..."
rm -rf dist

APP_NAME="log-tools"

# 修改 .env 文件
echo "修改 .env 文件..."
cat << EOF > .env
VITE_BASE_URL=/apps/$APP_NAME/
VITE_BUILD_DIR=dist/apps/$APP_NAME
EOF

# 构建
echo "正在构建..."
npm i
npm run build

# 进入构建目录
cd dist/apps/$APP_NAME
cp index.html 404.html

# 压缩
cd -

if [ ! -d out ]; then
    mkdir out
fi

node scripts/snapshot.js
echo "快照完成！" 