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
VITE_BASE_URL=/$APP_NAME/
VITE_BUILD_DIR=dist/$APP_NAME
EOF

# 构建
echo "正在构建..."
pnpm i
npm run build

# 进入构建目录
cd dist/$APP_NAME
cp index.html 404.html
cp index.html mobile.html
touch .nojekyll # 防止 github pages 忽略 _ 开头的文件

# 初始化 git 仓库（如果不存在）
if [ ! -d .git ]; then
    git init
    git remote add origin git@github.com:gausstool/$APP_NAME.git
fi

# 添加所有文件到 git
git add .

# 提交更改
git commit -m "部署到 GitHub Pages"

# 推送到 gh-pages 分支
echo "正在推送到 GitHub Pages..."
git push -f origin HEAD:gh-pages

echo "部署完成！" 