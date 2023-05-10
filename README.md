这是我的学习项目


## 自动化部署
1. 创建一个新的分支，用来存放需要部署的文件
2. 在github的对应项目的setting中设置page，将分支设置成刚刚创建的分支
3. 在项目根目录的新建文件夹.github，再新建一个文件夹workflows，最后新建文件xx.yml，名称随意取，最终自动部署的文件目录为.github/github/xx.yml
4. 修改部署文件xx.yml的内容为
name: Build and Deploy
on: # 监听 main 分支上的 push 事件
  push:
    branches:
      - master
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest # 构建环境使用 ubuntu
    steps:
      - name: Checkout
        uses: actions/checkout@v2.3.1  
        with:
          persist-credentials: false

      - name: Install and Build # 下载依赖 打包项目
        run: |
          npm install
          npm run build

      - name: Deploy # 将打包内容发布到 github page
        uses: JamesIves/github-pages-deploy-action@v4.3.3
        with:  # 自定义环境变量
          branch: test # 存放打包后文件的分支
          folder: src  # 需要打包的文件目录
          repository-name: pig-zhu/threeD # 这是我的 github page 仓库
          target-folder: /
 需要配置权限：
      ![image](https://github.com/pig-zhu/threeD/assets/46115048/3801d8ff-1c8c-4158-bd59-2fc7ced0c2c7)

