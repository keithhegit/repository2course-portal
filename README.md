# repository2course-portal

独立 Portal 项目，用于跟踪 `repository2course` 每次新增的课程清单。

## 工作方式

- 页面运行时直接读取：
  - `https://raw.githubusercontent.com/keithhegit/repository2course/main/courses-manifest.json`
- 只要 `repository2course` 更新并推送新 manifest，这里刷新页面即可看到最新课程。
- 本仓库开启 GitHub Pages 自动部署（`main` 分支 push 触发）。

## 本地预览

直接打开 `index.html` 即可。

## 发布

1. 推送本仓库到 GitHub（建议仓库名：`repository2course-portal`）
2. 在仓库 Settings -> Pages 中选择 `GitHub Actions`
3. 每次 `main` 推送自动更新 Pages
