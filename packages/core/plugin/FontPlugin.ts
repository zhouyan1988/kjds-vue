/*
 * @Author: 秦少卫
 * @Date: 2024-04-21 23:51:01
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-06-07 21:53:36
 * @Description: 自定义字体
 */

// const repoSrc = 'http://localhost:1337';
import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import { downFile } from '../utils/utils';
import type { IEditor, IPluginTempl } from '@kuaitu/core';
import { EditorTypeEnum } from '@/utils/editor';
import fontsJson from '../fonts.json';
import { listFonts } from '@/api/kjds/fonts';
import { FontsVO } from '@/api/kjds/fonts/types';

type IPlugin = Pick<FontPlugin, 'getFontList' | 'loadFont' | 'getFontJson' | 'downFontByJSON'>;

declare module '@kuaitu/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IEditor extends IPlugin {}
}

interface Font {
  type: string;
  fontFamily: string;
}

interface FontSource {
  name: string;
  type: string;
  file: string;
  img: string;
}

class FontPlugin implements IPluginTempl {
  private tempPromise: Promise<FontSource[]> | null;
  static pluginName = 'FontPlugin';
  static apis = ['getFontList', 'loadFont', 'getFontJson', 'downFontByJSON'];
  repoSrc: string;
  cacheList: FontSource[];
  constructor(
    public canvas: fabric.Canvas,
    public editor: IEditor,
    config: { repoSrc: string }
  ) {
    this.repoSrc = config.repoSrc;
    this.cacheList = [];
    this.tempPromise = null;
  }

  hookImportBefore(json: string) {
    return this.downFontByJSON(json);
  }
  async getFontList() {
    // 返回暂存字体
    if (this.cacheList.length) {
      return Promise.resolve(this.cacheList);
    }
    if (this.tempPromise) return this.tempPromise;

    // 1. 先准备本地静态字体
    const localFonts = fontsJson.map((item: any) => ({
      name: item.name,
      type: item.type || 'cn',
      file: this.repoSrc + item.file,
      img: this.repoSrc + item.img
    }));

    // 2. 请求远端字体
    let remoteFonts: any[] = [];
    try {
      const { rows: fontsList } = await listFonts({ pageNum: 1, pageSize: 1000 });
      remoteFonts = fontsList.map((item: FontsVO) => ({
        name: item.name,
        type: item.type || 'cn',
        file: item.fileUrl,
        img: item.imgUrl
      }));
    } catch (e) {
      console.error('[字体加载错误] 远端接口失败，使用本地内置字体:', e);
    }

    // 3. 合并本地和远端，按 name 去重（远端优先覆盖本地）
    const map = new Map<string, any>();
    [...localFonts, ...remoteFonts].forEach((font) => {
      map.set(font.name, font);
    });
    const list = Array.from(map.values());

    // 4. 缓存并生成 CSS
    this.cacheList = list;
    this.createFontCSS(list);

    // 5. 缓存 Promise，避免并发时重复执行
    this.tempPromise = Promise.resolve(list);

    return this.tempPromise;
  }

  downFontByJSON(str: string) {
    const object = JSON.parse(str);
    let fontFamilies: string[] = [];
    const skipFonts = ['arial'];
    if (object.objects) {
      fontFamilies = JSON.parse(str)
        .objects.filter((item: Font) => {
          const hasFontFile = this.cacheList.find((font) => font.name === item.fontFamily);
          return item.type.includes(EditorTypeEnum.Text) && !skipFonts.includes(item.fontFamily) && hasFontFile;
        })
        .map((item: Font) => item.fontFamily);
    } else {
      fontFamilies = skipFonts.includes(object.fontFamily) ? [] : [object.fontFamily];
    }

    const fontFamiliesAll = fontFamilies.map((fontName) => {
      const font = new FontFaceObserver(fontName);
      return font.load(null, 150000);
    });
    return Promise.all(fontFamiliesAll);
  }

  // 获取字体数据 新增字体样式使用
  getFontJson() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      const json = activeObject.toJSON(['id', 'gradientAngle', 'selectable', 'hasControls']);
      const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(json, null, '\t'))}`;
      const dataUrl = activeObject.toDataURL({});
      downFile(fileStr, 'font.json');
      downFile(dataUrl, 'font.png');
    }
  }

  loadFont(fontName: string) {
    const font = new FontFaceObserver(fontName);
    return font.load(null, 150000).then(() => {
      const activeObject = this.canvas.getActiveObjects()[0];
      if (activeObject) {
        activeObject.set('fontFamily', fontName);
        this.canvas.renderAll();
      }
    });
  }

  createFontCSS(arr: any[]) {
    let code = '';
    arr.forEach((item) => {
      const fontName = item.name.replace(/'/g, "\\'"); // 转义单引号，避免出错
      code =
        code +
        `
    @font-face {
      font-family: '${fontName}';
      src: url('${item.file}');
    }
    `;
    });
    const style = document.createElement('style');
    try {
      style.appendChild(document.createTextNode(code));
    } catch (error) {
      // style.styleSheet.cssText = code;
    }
    const head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default FontPlugin;
