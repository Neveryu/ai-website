import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import htmlMinifier from 'html-minifier-terser'

// 动态获取所有 HTML 文件
const getHtmlFiles = (dir) => {
  const files = fs.readdirSync(dir)
  const htmlFiles = {}
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // 递归调用，如果是目录则继续查找
      Object.assign(htmlFiles, getHtmlFiles(filePath))
    } else if (file.endsWith('.html')) {
      // 处理 HTML 文件
      const name = path.relative('src', filePath).replace(/\\/g, '/') // 生成相对路径
      htmlFiles[name.replace('.html', '')] = filePath // 去掉 .html 后缀
    }
  })
  return htmlFiles
}
const htmlFiles = getHtmlFiles(path.resolve(__dirname, 'src'))

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有
  // `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    root: 'src',
    base: env.VITE_BASE_URL || '/',
    publicDir: 'assets',
    server: {
      host: true,
    },
    preview: {
      open: true,
    },
    plugins: [
      {
        name: 'html-minifier',
        transformIndexHtml(html) {
          return htmlMinifier.minify(html, {
            collapseWhitespace: true, // 删除空格
            removeComments: true, // 移除注释
            minifyCSS: true, // 压缩内联 CSS
            minifyJS: {
              // 压缩内联 JS
              compress: {
                drop_console: true, // 去除 console
                drop_debugger: true, // 去除 debugger
              },
              mangle: true, // 混淆变量名
            },
            removeAttributeQuotes: true, // 移除属性引号
          })
        },
      },
    ],
    build: {
      outDir: '../dist',
      // 默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
      // 若 outDir 在根目录之外则会抛出一个警告避免意外删除掉重要的文件。可以设置该选项来关闭这个警告。
      // 该功能也可以通过命令行参数 --emptyOutDir 来使用。
      emptyOutDir: true,
      rollupOptions: {
        input: htmlFiles,
      },
    },
    // plugins: [
    //   createHtmlPlugin({
    //     inject: {
    //       injectOptions: {
    //         // 动态设置 base 标签
    //         tags: [
    //           {
    //             tag: 'base',
    //             attrs: {
    //               href: env.VITE_BASE_URL || '/', // 使用环境变量
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   }),
    // ],
  }
})
