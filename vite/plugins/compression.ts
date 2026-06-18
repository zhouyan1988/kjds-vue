import compression from 'vite-plugin-compression';

export default (env: any) => {
  const { VITE_BUILD_COMPRESS } = env;
  const plugin: any[] = [];
  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',');
    if (compressList.includes('gzip')) {
      // http://doc.ruoyi.vip/ruoyi-vue/other/faq.html#使用gzip解压缩静态文件
      plugin.push(
        compression({
          verbose: true, // 控制台显示压缩信息
          disable: false, // 开发环境下禁用压缩
          threshold: 10240, // 对超过10KB的文件进行压缩
          algorithm: 'gzip', // 使用 Gzip 压缩算法
          ext: '.gz', // 压缩后的文件扩展名
          deleteOriginFile: false // 不删除原文件
        })
      );
    }
    if (compressList.includes('brotli')) {
      plugin.push(
        compression({
          verbose: true,
          disable: false, // 开发环境下禁用压缩
          threshold: 10240,
          algorithm: 'brotliCompress', // 使用 Brotli 压缩算法
          ext: '.br',
          deleteOriginFile: false // 不删除原文件
        })
      );
    }
  }
  return plugin;
};
