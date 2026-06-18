import terser from '@rollup/plugin-terser';

export default () => {
  return terser({
    compress: {
      drop_console: true, // 移除 console.log
      drop_debugger: true, // 移除 debugger
      pure_funcs: ['console.log'] // 移除其他纯函数调用
    },
    mangle: true, // 混淆变量名
    format: {
      comments: false // 移除注释
    }
  });
};
