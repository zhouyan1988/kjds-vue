import { UserConfig, ConfigEnv, loadEnv, defineConfig } from 'vite';

import createPlugins from './vite/plugins';

import path, { resolve } from 'path';
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd()) as ImportMetaEnv;
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: env.VITE_APP_CONTEXT_PATH,
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.less']
    },
    // https://cn.vitejs.dev/config/#resolve-extensions
    plugins: createPlugins(env, command === 'build'),
    build: {
      //移除生产环境log
      minify: 'terser',
      terserOptions: {
        compress: {
          //生产环境时移除console
          // drop_console: mode === 'production',
          // drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        output: {
          // 静态资源按分类存放
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            // package.json dependencies
            'axios': ['axios'],
            'bpmn-js': ['bpmn-js'],
            'crypto-js': ['crypto-js'],
            'dayjs': ['dayjs'],
            'diagram-js': ['diagram-js'],
            'echarts': ['echarts'],
            'element-plus': ['element-plus'],
            'events': ['events'],
            'fabric': ['fabric'],
            'file-saver': ['file-saver'],
            'fontfaceobserver': ['fontfaceobserver'],
            'highlight.js': ['highlight.js'],
            'image-conversion': ['image-conversion'],
            'jsencrypt': ['jsencrypt'],
            'lodash-es': ['lodash-es'],
            'min-dash': ['min-dash'],
            'nprogress': ['nprogress'],
            'number-precision': ['number-precision'],
            'pinia': ['pinia'],
            'qs': ['qs'],
            'tiny-svg': ['tiny-svg'],
            'uuid': ['uuid'],
            'view-ui-plus': ['view-ui-plus'],
            'vue': ['vue'],
            'vue-cropper': ['vue-cropper'],
            'vue-i18n': ['vue-i18n'],
            'vue-masonry': ['vue-masonry'],
            'vue-router': ['vue-router'],
            'vue-types': ['vue-types'],
            'vue3-lazyload': ['vue3-lazyload'],
            'vxe-table': ['vxe-table']
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: false,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_BASE_PREFIX,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        },
        [env.VITE_APP_SHOP_API]: {
          target: env.VITE_APP_SHOP_PREFIX,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_SHOP_API), '')
        },
        [env.VITE_APP_IMAGE_API]: {
          target: env.VITE_APP_IMAGE_PREFIX,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_IMAGE_API), '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import '${resolve(__dirname, 'src/assets/styles/variable.less')}';`
        },
        scss: {
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    // 预编译
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        'vue-i18n',
        '@vueup/vue-quill',
        'bpmn-js/lib/Viewer',
        'bpmn-js/lib/Modeler.js',
        'min-dash',
        'diagram-js/lib/navigation/movecanvas',
        'diagram-js/lib/navigation/zoomscroll',
        'bpmn-js/lib/features/palette/PaletteProvider',
        'bpmn-js/lib/features/context-pad/ContextPadProvider',
        'diagram-js/lib/draw/BaseRenderer',
        'tiny-svg',
        'image-conversion',
        'element-plus/es/components/**/css'
      ]
    }
  };
});
