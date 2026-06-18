import { EditorTemplVo, EditorTypeEnum, FabricObjectVO, ImageInfo, PersonalizedImgVo } from '@/utils/editor';
import { cloneData } from '@deary/utils';
import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { uploadFile } from '@/api/system/oss';
import { FabricCondition } from '@/utils/FabricCondition';
import fontLoader from '@/utils/FontLoader';
import { FabricUtils } from '@/utils/FabricUtils';
import { FabricImageUtils } from '@/utils/FabricImageUtils';
import { FabricTextUtils } from '@/utils/FabricTextUtils';
import { FabricPathTextUtils } from '@/utils/FabricPathTextUtils';

/**
 * 获取图片的原始信息
 */
export const getImageInfo = (url: string): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    const imageEL = new Image();
    imageEL.crossOrigin = 'Anonymous';
    imageEL.src = url;
    imageEL.onload = () => {
      resolve({
        src: imageEL.src,
        width: imageEL.width,
        height: imageEL.height
      });
    };
  });
};

/**
 * 处理图片前缀，避免跨域
 */
export const handleImgUrl = (url: string): string => {
  if (import.meta.env.VITE_APP_PROXY_IMAGE === '0') {
    return url;
  } else if (import.meta.env.VITE_APP_PROXY_IMAGE === '1') {
    return url?.includes(import.meta.env.VITE_APP_IMAGE_PREFIX)
      ? url?.replace(import.meta.env.VITE_APP_IMAGE_PREFIX, import.meta.env.VITE_APP_IMAGE_API)
      : url;
  } else {
    return url;
  }
};

/**
 * 通过比例改变模板大小
 * @param arr 模版数组
 * @param sw 宽度比
 * @param sh 高度比
 */
export const handleTemplScale = (arr: EditorTemplVo[], sw: number, sh: number) => {
  // 遍历数组，设置收集所有图片
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    for (let j = 0; j < item.json.objects.length; j++) {
      const jItem = item.json.objects[j];
      jItem.left = jItem.left * sw;
      jItem.top = jItem.top * sh;
      jItem.scaleX = jItem.scaleX * sw;
      jItem.scaleY = jItem.scaleY * sh;
      jItem.canvasScaleW = sw;
      jItem.canvasScaleH = sh;
      // jItem.width = jItem.width * rw;
      // jItem.height = jItem.height * rh;
    }
  }
};

/**
 * 获取模版下所有的图片
 * @param arr
 * @param all 是否返回所有图片
 */
export const getTemplImgs = (arr: EditorTemplVo[], all: boolean = false) => {
  const imgs: PersonalizedImgVo[] = [];

  if (all) {
    // 遍历数组，收集所有图片并设置第一个为选中状态
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      for (let j = 0; j < item.json.objects.length; j++) {
        const jItem = item.json.objects[j];
        if (jItem.type === EditorTypeEnum.Image) {
          const imgUrls = FabricUtils.convertToPersonalizedImgVoArray(jItem.personalizedImgs || []);

          for (let k = 0; k < imgUrls.length; k++) {
            const image = imgUrls[k];
            imgs.push(image);
          }
        }
      }
    }
  }

  // 遍历数组，设置收集所有图片
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    for (let j = 0; j < item.json.objects.length; j++) {
      const jItem = item.json.objects[j];
      if (jItem.type === EditorTypeEnum.Image) {
        let cloneImgs: PersonalizedImgVo[] = [];
        if (all) {
          cloneImgs = cloneData(imgs);
        } else {
          cloneImgs = cloneData(FabricUtils.convertToPersonalizedImgVoArray(jItem.personalizedImgs || []));
        }
        jItem.personalizedImgs = cloneImgs;
      }
      // 如果
      !jItem.id && (jItem.id = uuid());
    }
  }
  return arr;
};

/**
 * 画布转图片
 */
export const uploadFileToInfo = async (canvasBase64: string): Promise<string> => {
  // 将Base64字符串转换为Blob对象
  const base64ToBlob = (base64Data: string) => {
    const parts = base64Data?.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const _upload = (base64: string) => {
    const file = base64ToBlob(base64);
    const formData = new FormData();
    formData.append('file', file, '.png');
    return uploadFile(formData)
      .then((res) => {
        const { url } = res.data;
        return url;
      })
      .catch(() => {
        return '';
      });
  };
  // 上传图片
  const imgInfo = await _upload(canvasBase64);
  return imgInfo;
};

export class FabricCanvasEditor {
  /**
   * Fabric画布实例
   * 用于操作和管理画布上的所有对象
   */
  private _canvas: fabric.Canvas;

  /**
   * 实例化 FabricCondition
   */
  private readonly _fabricCondition: FabricCondition;

  /**
   * 图片工具实例
   * @private
   */
  public readonly imageUtils: FabricImageUtils;

  /**
   * 文本工具实例
   */
  public readonly textUtils: FabricTextUtils;

  /**
   * 文本工具实例
   */
  public readonly pathTextUtils: FabricPathTextUtils;

  /**
   * 模板JSON对象数组
   * 存储当前编辑器中所有对象的配置信息，用于条件渲染和规则匹配
   */
  public templJsonObjects: FabricObjectVO[] = [];

  /**
   * 渲染状态标志，用于防止重复请求渲染
   */
  private renderPending = false;

  /**
   * 构造函数
   */
  constructor() {
    this._fabricCondition = new FabricCondition();
    this.imageUtils = new FabricImageUtils(
      () => this.getFabricCanvasEditor(),
      (obj) => this.isCanRenderTempl(obj),
      () => this.requestRender()
    );
    this.textUtils = new FabricTextUtils(
      () => this.getFabricCanvasEditor(),
      (obj) => this.isCanRenderTempl(obj),
      () => this.requestRender(),
      fontLoader
    );
    this.pathTextUtils = new FabricPathTextUtils(
      () => this.getFabricCanvasEditor(),
      (obj) => this.isCanRenderTempl(obj),
      () => this.requestRender(),
      fontLoader
    );
  }

  /**
   * 请求渲染画布
   * 使用 requestAnimationFrame 优化渲染性能，避免频繁重复渲染
   * 通过 renderPending 标志确保同一时间只发起一次渲染请求
   */
  private requestRender() {
    if (!this.renderPending) {
      this.renderPending = true;
      requestAnimationFrame(() => {
        this.getFabricCanvasEditor()?.requestRenderAll();
        this.renderPending = false;
      });
    }
  }

  /**
   * 初始化画布
   * @param canvas
   */
  public init(canvas: fabric.Canvas) {
    this._canvas = canvas;
  }

  /**
   * 获取画布对象
   */
  private getFabricCanvasEditor(): fabric.Canvas {
    if (!this._canvas) throw new Error('Canvas not initialized');
    return this._canvas;
  }

  get fabricCanvasEditor() {
    if (!this._canvas) throw new Error('Canvas not initialized');
    return this._canvas;
  }

  public isCanRenderTempl(templ: FabricObjectVO) {
    if (!this._fabricCondition) throw new Error('FabricCondition not initialized');
    return this._fabricCondition.isCanRenderTempl(templ);
  }

  /**
   * 改变选项，控制图层显示隐藏
   */
  public async changeOptions(objs: FabricObjectVO[]) {
    if (!objs?.length) {
      console.error('changeOptions objs is empty');
      return;
    }
    const _this = this;
    _this.templJsonObjects = objs;
    _this._fabricCondition.setObjects(objs);
    for (let i: number = 0; i < objs.length; i++) {
      const item: FabricObjectVO = objs[i];
      try {
        await _this.changeOpt(item);
      } catch (error) {
        console.error(`选项处理错误 ${item.id}:`, error);
        throw new Error(`选项处理错误 ${item.id}`);
      }
    }
    _this.requestRender();
  }

  public async changeOpt(obj: FabricObjectVO) {
    const _this = this;
    // 深拷贝对象
    obj = cloneData(obj);
    // 获取图片对象
    const curtItem: any = _this
      .getFabricCanvasEditor()
      .getObjects()
      .find((i: FabricObjectVO) => {
        return i.id === obj.id;
      });
    if (curtItem) {
      // 检查是否可以渲染
      curtItem.visible = _this.isCanRenderTempl(curtItem); // 显示
    }
  }

  /**
   * 改变选项，控制图层显示隐藏，并且要控制文字颜色
   * @param objs
   * @param val 选项值
   */
  public async changeImageColorOptions(objs: FabricObjectVO[], val: string) {
    if (!objs?.length) {
      console.error('changeImageColorOptions objs is empty');
      return;
    }
    const _this = this;
    _this.templJsonObjects = objs;
    _this._fabricCondition.setObjects(objs);
    for (let i: number = 0; i < objs.length; i++) {
      const item: FabricObjectVO = objs[i];
      try {
        await _this.changeImageColorOpt(item, val);
      } catch (error) {
        console.error(`图片选项处理错误 ${item.id}:`, error);
        throw new Error(`图片选项处理错误 ${item.id}`);
      }
    }
    _this.requestRender();
  }

  public async changeImageColorOpt(obj: FabricObjectVO, val: string) {
    const _this = this;
    // 深拷贝对象
    obj = cloneData(obj);
    // 获取图片对象
    const curtItem: any = _this
      .getFabricCanvasEditor()
      .getObjects()
      .find((i: FabricObjectVO) => {
        return i.id === obj.id;
      });
    if (curtItem) {
      // 检查是否可以渲染
      curtItem.set('visible', _this.isCanRenderTempl(curtItem));
      // 如果是文本，需要判断是否需要设置颜色
      if (curtItem.type === EditorTypeEnum.IText || curtItem.type === EditorTypeEnum.TextBox) {
        const newColor = _this._fabricCondition.isCanRenderTemplColor(curtItem, val);
        curtItem.set('fill', newColor);
      }
    }
  }

  /**
   * 设置画布对象
   * @param objs
   */
  public async setCanvasByObjects(objs: FabricObjectVO[]) {
    if (!objs?.length) {
      console.error('setCanvasByObjects objs is empty');
      return;
    }
    const _this = this;
    _this.templJsonObjects = objs;
    _this._fabricCondition.setObjects(objs);
    for (let i: number = 0; i < objs.length; i++) {
      const item: FabricObjectVO = objs[i];
      // console.log('设置图层对象', item);
      try {
        if (item.type === EditorTypeEnum.Image) {
          await _this.imageUtils.addImage(item);
        } else if (item.type === EditorTypeEnum.IText) {
          if (item.path) {
            await _this.pathTextUtils.addPathText(item);
          } else {
            await _this.textUtils.addText(item);
          }
        } else if (item.type === EditorTypeEnum.TextBox) {
          await _this.textUtils.addTextbox(item);
        }
      } catch (error) {
        console.error(`设置图层对象错误 ${item.id}:`, error);
        throw new Error(`设置图层对象错误 ${item.id}`);
      }
    }
  }

  /**
   * 清除画布实例
   */
  public clearCanvasInstance() {
    const _this = this;

    const objectsToRemove = _this
      .getFabricCanvasEditor()
      .getObjects()
      .filter((obj) =>
        [EditorTypeEnum.IText, EditorTypeEnum.Image, EditorTypeEnum.TextBox, EditorTypeEnum.PathText].includes(obj.type as EditorTypeEnum)
      );
    _this.getFabricCanvasEditor().remove(...objectsToRemove);
    _this.requestRender();
  }

  /**
   * 获取画布图片
   * @param type
   */
  public async getCanvasImage(type: 'base64' | 'url' = 'base64'): Promise<string> {
    const _this = this;
    const url: string = _this.getFabricCanvasEditor().toDataURL({
      format: 'png',
      quality: 1
    });
    return new Promise(async (resolve) => {
      if (type === 'base64') {
        resolve(url);
      } else {
        const imgInfo = await uploadFileToInfo(url); //画布转图片
        resolve(imgInfo);
      }
    });
  }
}
