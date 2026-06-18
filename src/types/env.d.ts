/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 环境变量类型定义
interface ImportMetaEnv {
  // 应用配置
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_ENV: 'development' | 'production' | string;

  // API配置
  readonly VITE_APP_APIHOST: string;
  readonly VITE_APP_BASE_API: string;
  readonly VITE_APP_BASE_PREFIX: string;

  // 商城API配置
  readonly VITE_APP_SHOP_API: string;
  readonly VITE_APP_SHOP_PREFIX: string;

  // 图片服务配置
  readonly VITE_APP_PROXY_IMAGE: '0' | '1' | string;
  readonly VITE_APP_IMAGE_API: string;
  readonly VITE_APP_IMAGE_PREFIX: string;

  // 应用路径配置
  readonly VITE_APP_CONTEXT_PATH: string;

  // 监控配置
  readonly VITE_APP_MONITOR_ADMIN: string;
  readonly VITE_APP_SNAILJOB_ADMIN: string;

  // 构建配置
  readonly VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | string;

  // 加密配置
  readonly VITE_APP_ENCRYPT: 'true' | 'false' | string;
  readonly VITE_APP_RSA_PUBLIC_KEY: string;
  readonly VITE_APP_RSA_PRIVATE_KEY: string;

  // 应用标识
  readonly VITE_APP_CLIENT_ID: string;

  // WebSocket配置
  readonly VITE_APP_WEBSOCKET: 'true' | 'false' | string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  // readonly glob: any;
}
