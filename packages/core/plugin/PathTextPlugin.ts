import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import type { IEditor, IPluginTempl } from '@kuaitu/core';

type IPlugin = Pick<PathTextPlugin, 'startTextPathDraw' | 'endTextPathDraw'>;

declare module '@kuaitu/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IEditor extends IPlugin {}
}

type DrawOptions = {
  decimate: number;
  width: number;
  defaultText: string;
  color: string;
  lineColor: string;
  defaultFontSize: number;
};

// 路径文字对象配置
type PathTextConfig = {
  id?: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  left: number;
  top: number;
  pathData: string;
  pathType?: 'curve' | 'line' | 'circle' | 'wave' | 'custom';
  pathAlign?: 'left' | 'center' | 'right';
  pathSide?: 'left' | 'right';
  pathStartOffset?: number;
  visible?: boolean;
  editable?: boolean;
};

export default class PathTextPlugin implements IPluginTempl {
  static pluginName = 'PathTextPlugin';
  static apis = ['startTextPathDraw', 'endTextPathDraw'];
  private options?: DrawOptions;
  constructor(
    public canvas: fabric.Canvas,
    public editor: IEditor
  ) {}

  _beforeHandler = (opt: any) => {
    if (this.options == null) return;
    const path = opt.path as any;
    const getPathSegmentsInfo = (fabric.util as any).getPathSegmentsInfo;
    path.segmentsInfo = getPathSegmentsInfo(path.path);
    path.set({ stroke: this.options.lineColor });
    const text = this.options.defaultText;
    const fontSize = this.options.defaultFontSize;
    const textObject = new fabric.IText(text, {
      shadow: '',
      fontFamily: 'arial',
      fontSize: fontSize,
      top: path.top,
      left: path.left,
      fill: this.options.color,
      path: path,
      id: uuid(),
      // 路径文字元素禁止在画布上直接编辑
      editable: false
    });
    this.canvas.add(textObject);
  };
  _createdHandler = (opt: any) => {
    this.canvas.remove(opt.path);
  };
  _bindEvent() {
    this.canvas.on('before:path:created', this._beforeHandler);
    this.canvas.on('path:created', this._createdHandler);
  }
  _unbindEvent() {
    this.canvas.off('before:path:created', this._beforeHandler);
    this.canvas.off('path:created', this._createdHandler);
  }
  startTextPathDraw(options: Partial<DrawOptions> = {}) {
    const defaultOptions = {
      decimate: 8,
      width: 2,
      defaultText: '诸事顺遂 万事大吉',
      color: '#000000',
      lineColor: '#000000',
      defaultFontSize: 20
    };
    this.options = {
      ...defaultOptions,
      ...options
    };
    this.canvas.isDrawingMode = true;
    const brush = (this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas));
    brush.decimate = this.options.decimate;
    brush.width = this.options.width;
    brush.color = this.options.color;
    this._bindEvent();
  }
  endTextPathDraw() {
    this.canvas.isDrawingMode = false;
    this._unbindEvent();
  }

  /**
   * 添加预设的弧形文字
   */
  async addPathText(config: PathTextConfig): Promise<fabric.Object | null> {
    try {
      const textId = config.id || uuid();

      // 创建路径对象
      const pathObject = new fabric.Path(config.pathData, {
        fill: 'transparent',
        stroke: 'transparent',
        selectable: false,
        evented: false,
        visible: false,
        id: `${textId}_path`
      });

      // 获取路径分段信息
      const getPathSegmentsInfo = (fabric.util as any).getPathSegmentsInfo;
      if (getPathSegmentsInfo) {
        (pathObject as any).segmentsInfo = getPathSegmentsInfo(pathObject.path);
      }

      // 创建文字对象
      const textObject = new fabric.IText(config.text, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        fill: config.fill,
        stroke: config.stroke,
        strokeWidth: config.strokeWidth || 0,
        top: config.top,
        left: config.left,
        path: pathObject,
        id: textId,
        type: 'pathText',
        visible: config.visible !== false,
        editable: config.editable || false,
        selectable: true
      } as any);

      // 应用路径文字对齐
      this.applyPathTextAlignment(textObject, config);

      // 添加到画布
      this.canvas.add(pathObject);
      this.canvas.add(textObject);

      return textObject;
    } catch (error) {
      console.error('添加路径文字失败:', error);
      return null;
    }
  }

  /**
   * 应用路径文字对齐
   */
  private applyPathTextAlignment(textObject: fabric.Object, config: Partial<PathTextConfig>) {
    const pathAlign = config.pathAlign || 'left';
    const pathStartOffset = config.pathStartOffset || 0;

    // 计算文字在路径上的偏移
    let offset = pathStartOffset;

    if (pathAlign === 'center') {
      const pathLength = this.getPathLength(textObject);
      const textWidth = textObject.width || 0;
      offset = (pathLength - textWidth) / 2;
    } else if (pathAlign === 'right') {
      const pathLength = this.getPathLength(textObject);
      const textWidth = textObject.width || 0;
      offset = pathLength - textWidth;
    }

    // 设置文字偏移
    (textObject as any).pathStartOffset = Math.max(0, offset);

    // 设置文字侧面
    if (config.pathSide === 'right') {
      textObject.set('flipY', true);
    }
  }

  /**
   * 获取路径长度
   */
  private getPathLength(textObject: fabric.Object): number {
    const pathObject = (textObject as any).path;
    if (!pathObject || !pathObject.path) return 0;

    try {
      // 创建临时SVG元素计算路径长度
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      svg.style.position = 'absolute';
      svg.style.visibility = 'hidden';
      path.setAttribute('d', pathObject.path);

      svg.appendChild(path);
      document.body.appendChild(svg);

      const length = path.getTotalLength();

      document.body.removeChild(svg);

      return length;
    } catch (error) {
      console.warn('计算路径长度失败:', error);
      return 200; // 返回默认值
    }
  }

  /**
   * 创建预设弧形路径
   */
  createArcPath(centerX: number, centerY: number, radius: number, startAngle: number = 0, endAngle: number = Math.PI): string {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }

  /**
   * 创建预设的弧形文字模板
   */
  addPresetArcText(text: string, centerX: number, centerY: number, radius: number = 100) {
    const arcPath = this.createArcPath(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2);

    return this.addPathText({
      text,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      left: centerX - radius,
      top: centerY - radius,
      pathData: arcPath,
      pathAlign: 'center',
      pathSide: 'left'
    });
  }
}
