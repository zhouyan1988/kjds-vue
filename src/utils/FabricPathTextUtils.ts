import { fabric } from 'fabric';
import { FabricObjectVO } from '@/utils/editor';
import { cloneData } from '@deary/utils';
import { FabricPathEffect } from '@/utils/FabricPathEffect';

export class FabricPathTextUtils {
  constructor(
    private getCanvas: () => fabric.Canvas,
    private isCanRenderTempl: (obj: FabricObjectVO) => boolean,
    private requestRender: () => void,
    private fontLoader: { load: (name: string, url: string) => Promise<void> }
  ) {}

  /**
   * 添加路径文字
   * @param obj 路径文字对象配置
   */
  public async addPathText(obj: FabricObjectVO) {
    const _this = this;

    // 深拷贝对象，避免外部数据被篡改
    obj = cloneData(obj);

    // 清除原有路径文字对象
    _this.clearText(obj.id, obj.type);

    // 检查是否可以渲染
    const isRender: boolean = _this.isCanRenderTempl(obj);

    // 加载自定义字体
    if (obj.fontFamily && obj.fontFamilyUrl) {
      try {
        await _this.fontLoader.load(obj.fontFamily, obj.fontFamilyUrl);
      } catch (e) {
        // 可选：记录错误但不阻塞渲染
        console.warn('字体加载失败，继续渲染', obj.fontFamily, e);
      }
    }

    try {
      // 创建路径文字对象
      const pathText = new fabric.Path(obj.path?.path, {
        fill: 'transparent',
        stroke: 'transparent',
        selectable: false,
        evented: false,
        visible: false // 路径本身不可见
      });

      // 创建沿路径的文字
      const textOnPath: any = new fabric.Text(obj.text || '', {
        ...obj,
        selectable: false,
        visible: isRender,
        // @ts-expect-error：路径文字特有属性
        path: pathText,
        pathAlign: obj.pathAlign || 'center', // left, center, right
        pathSide: obj.pathSide || 'left', // left, right (文字在路径的哪一侧)
        pathStartOffset: obj.pathStartOffset || 0 // 文字在路径上的起始偏移
      });

      // 保存原始数据
      textOnPath.originalFontSize = obj.fontSize || 16;
      textOnPath.originalWidth = obj.width;
      textOnPath.originalHeight = obj.height;
      textOnPath.originalTop = obj.top;
      textOnPath.originalLeft = obj.left;
      textOnPath.pathData = obj.pathData; // 保存路径数据

      // 应用路径文字效果
      FabricPathEffect.apply(textOnPath, pathText, obj);

      // 将对象添加到画布
      _this.getCanvas().add(pathText);
      _this.getCanvas().add(textOnPath);
      await _this.requestRender();
    } catch (error) {
      console.error('添加路径文字失败:', error);
      throw error;
    }
  }

  /**
   * 清除画布文本
   * @param id
   * @param type
   */
  public clearText(id: string, type: string) {
    const _this = this;
    _this.clearPosition(id, type);
  }

  /**
   * 清除画布上某个位置的元素
   * @param id
   * @param type
   * @private
   */
  private clearPosition(id: string, type: string) {
    const _this = this;
    const objectsToRemove = [];
    _this.getCanvas().forEachObject((obj: FabricObjectVO) => {
      if (obj.type === type && obj.id === id) {
        objectsToRemove.push(obj);
      }
    });

    _this.getCanvas().remove(...objectsToRemove);
    _this.requestRender();
  }
}
