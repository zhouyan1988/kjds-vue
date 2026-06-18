export type FontDescriptor = {
  family: string;
  url: string;
};

class FontLoader {
  private loaded = new Set<string>();
  private loading = new Map<string, Promise<void>>();

  /**
   * 加载单个字体（全局缓存 & 并发合并）
   * @param family 字体名
   * @param url 字体文件地址
   */
  public load(family: string, url: string): Promise<void> {
    if (!family || !url) {
      return Promise.reject(new Error('字体和url是必需的'));
    }

    // 已加载
    if (this.loaded.has(family)) return Promise.resolve();

    // 若正在加载，直接返回正在加载的 Promise（避免重复请求）
    const existing = this.loading.get(family);
    if (existing) return existing;

    // 创建加载 Promise
    const p = new Promise<void>(async (resolve, reject) => {
      // 优先使用 FontFace API
      try {
        // 在某些环境 FontFace 可能不存在，包在 try/catch
        // 使用 crossOrigin 由服务器 CORS 决定
        // 有些字体是 woff2/woff/ttf，不同浏览器支持不同格式，调用方应传合适的 url
        const fontFace = new (window as any).FontFace(family, `url(${url})`);
        try {
          const loadedFace = await fontFace.load();
          // @ts-ignore
          document.fonts.add(loadedFace);
          this.loaded.add(family);
          this.loading.delete(family);
          resolve();
          return;
        } catch (err) {
          // 如果 FontFace.load 失败，继续走降级方案
          console.warn(`FontLoader FontFace。${family}加载失败，试试fallback。`, err);
        }
      } catch (e) {
        // FontFace 构造失败 -> 走降级
      }

      // 降级方案：注入 @font-face CSS，然后用 document.fonts.load 等待
      try {
        const styleId = `fontloader-${this.sanitizeName(family)}`;
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = `@font-face { font-family: '${family}'; src: url('${url}'); font-display: swap; }`;
          document.head.appendChild(style);
        }

        // 尝试等待浏览器加载字体（若支持 document.fonts）
        if ((document as any).fonts && (document as any).fonts.load) {
          try {
            // 尝试 load 一次（字体名字可能包含空格）
            await (document as any).fonts.load(`1em ${family}`);
          } catch (e) {
            // 忽略失败：浏览器可能无法明确检测到，但字体可能已经可用
            console.warn(`[FontLoader] document.fonts.load失败 ${family}`, e);
          }
        }

        this.loaded.add(family);
        this.loading.delete(family);
        resolve();
      } catch (err) {
        this.loading.delete(family);
        console.error(`[FontLoader]备用加载失败${family}`, err);
        // 我们不一定 want reject（业务上通常可以继续），但为兼容旧逻辑还是 reject
        reject(err);
      }
    });

    this.loading.set(family, p);
    return p;
  }

  public isLoaded(family: string): boolean {
    return this.loaded.has(family);
  }

  public clearCache() {
    this.loaded.clear();
    this.loading.clear();
  }

  private sanitizeName(name: string) {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '');
  }
}

// 导出单例，项目中全局复用
const fontLoader = new FontLoader();
export default fontLoader;
export { FontLoader };
