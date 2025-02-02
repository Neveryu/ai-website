#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 定义要删除的目录的路径（把.git目录删掉）
DIRECTORY_TO_DELETE=".git"

# 检查目录是否存在
if [ -d "$DIRECTORY_TO_DELETE" ]; then
  # 如果目录存在，则删除它
  rm -rf "$DIRECTORY_TO_DELETE"
  echo "目录 $DIRECTORY_TO_DELETE 已被删除"
else
  echo "目录 $DIRECTORY_TO_DELETE 不存在"
fi

npm run build

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "打包成功；Build completed successfully!"
else
  echo "打包失败；Build failed!"
  exit 1
fi

git init
git add -A
# 设置本地项目的 git 用户名
git config user.name "NeverYu"
git config user.email "never_yu@qq.com"
echo "Git 仓库配置已更新"

echo -n "请输入你的commit msg"

# 设置默认值
default_msg="commit and update website"
read msg
# 检查用户是否输入了内容
if [ -z "$msg" ]; then
  # 如果用户没有输入内容，使用默认值
  echo "使用默认值: $default_msg"
  # 可以在这里将 user_input 设置为默认值，用于后续脚本逻辑
  msg=$default_msg
else
  # 如果用户输入了内容，则使用用户输入的值
  echo "您输入的值是: $msg"
fi

git commit -m "$msg"

git push -f git@github.com:Neveryu/ai-website.git master:master
# git push -f http://github.com/Neveryu/ai-website.git master:master

# 返回原始目录
# 在脚本中，cd - 通常用于在完成某些操作后恢复原始目录，避免影响后续操作或用户环境
cd -
