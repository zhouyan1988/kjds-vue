import { markRaw } from 'vue';
import { fabric } from 'fabric';
import { ChangeTextConfigVo, EditorTypeEnum, FabricObjectVO } from '@/utils/editor';
import { cloneData } from '@deary/utils';
import { TextFitHelper } from '@/utils/TextFitHelper';

export class FabricTextUtils {
  constructor(
    private getCanvas: () => fabric.Canvas,
    private isCanRenderTempl: (obj: FabricObjectVO) => boolean,
    private requestRender: () => void,
    private fontLoader: { load: (name: string, url: string) => Promise<void> }
  ) {}

  public processFirstCharacter(text: string | null | undefined): { firstChar: string; char: string } {
    if (typeof text !== 'string' || text.length === 0) return { firstChar: '', char: '' }; // 处理 null, undefined 和空字符串

    const firstChar = text[0];
    const restOfText = text?.slice(1);

    // 处理英文字母（a-z 或 A-Z）
    if (/^[A-Za-z]$/.test(firstChar)) {
      return { firstChar: firstChar?.toUpperCase(), char: firstChar?.toUpperCase() + restOfText };
    }

    // 处理中文字符（包括扩展汉字）
    if (/^\p{Script=Han}$/u.test(firstChar)) {
      return { firstChar: firstChar?.toUpperCase(), char: firstChar?.toUpperCase() + restOfText };
    }

    // 其他字符直接返回
    return { firstChar: firstChar, char: text };
  }

  /**
   * 判断文本联动
   */
  public async checkLinkageText(vo: FabricObjectVO, obj: FabricObjectVO) {
    const _this = this;

    // 如果启用了文本联动，则执行以下逻辑
    if (obj?.linkageText?.enable) {
      const textId = obj?.linkageText?.textId;
      const { firstChar, char } = _this.processFirstCharacter(obj?.text);
      vo.text = char;

      _this.getCanvas().forEachObject((item: FabricObjectVO) => {
        if (item.id === textId && (item.type === EditorTypeEnum.IText || item.type === EditorTypeEnum.TextBox)) {
          item.text = firstChar;
        }
      });
    } else {
      vo.text = obj.text;
    }
  }

  /**
   * 加载字体
   */
  public async loadFont(obj: FabricObjectVO) {
    const _this = this;
    // 加载自定义字体（obj.fontFamilyUrl 是字体文件的 URL，obj.fontFamily 是字体名字）
    if (obj.fontFamily && obj.fontFamilyUrl) {
      try {
        await _this.fontLoader.load(obj.fontFamily, obj.fontFamilyUrl);
      } catch (e) {
        // 可选：记录错误但不阻塞渲染
        console.warn('字体加载失败，继续渲染', obj.fontFamily, e);
      }
    }
  }

  /**
   * 公共方法：修改未开启固定宽高的文字或文本框
   */
  private async updateUnFixedTextObject(obj: FabricObjectVO) {
    const _this = this;
    for (const vo of _this.getCanvas().getObjects() || []) {
      if (vo.type === obj.type && vo.id === obj.id) {
        await _this.checkLinkageText(vo as FabricObjectVO, obj);
        await _this.requestRender();
        break;
      }
    }
  }

  /**
   * 公共方法：修改固定宽高的文字或文本框
   */
  private async updateFixedTextObject(
    obj: FabricObjectVO,
    config: ChangeTextConfigVo | undefined,
    resizeFn: (target: FabricObjectVO, width: number, config?: ChangeTextConfigVo) => Promise<void> | void
  ) {
    const _this = this;

    for (const vo of _this.getCanvas().getObjects() || []) {
      // 单对象
      if (vo.type === obj.type && vo.id === obj.id) {
        await _this.checkLinkageText(vo as FabricObjectVO, obj);
        // 确保对象不被 Vue 响应式系统代理
        const rawVo = markRaw(vo);
        await resizeFn(rawVo as FabricObjectVO, obj.width, config);
        await _this.requestRender();
        break;
      }

      // Group 内对象
      if (vo._objects) {
        for (const item of vo._objects) {
          if (item.type === obj.type && item.id === obj.id) {
            await _this.checkLinkageText(item as FabricObjectVO, obj);
            // 确保对象不被 Vue 响应式系统代理
            const itemVo = markRaw(item);
            await resizeFn(itemVo as FabricObjectVO, obj.width, config);
            await _this.requestRender();
            break;
          }
        }
      }
    }
  }

  /**
   * 创建矩形+文字组合，保持原位置和大小，文字水平居左、垂直居中
   */
  private async createTextGroup(obj: FabricObjectVO, textObj: fabric.Text | fabric.Textbox, isRender: boolean): Promise<fabric.Group> {
    // 创建透明矩形，尺寸用固定宽高
    const rect = new fabric.Rect({
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      fill: 'transparent',
      stroke: null, // 调试可见，生产可去掉
      originX: 'center', // 保持原来的 center
      originY: 'center', // 保持原来的 center
      left: 0,
      top: 0,
      selectable: false,
      evented: false
    });

    // 文字水平居左，垂直居中
    textObj.originX = 'left'; // 水平居左对齐
    textObj.originY = 'center'; // 垂直居中对齐
    textObj.left = -(obj.width * obj.scaleX || 1) / 2; // 矩形中心在(0,0)，左边界在 -(width*scaleX)/2
    textObj.top = 0; // 垂直居中，保持为0
    textObj.angle = 0;

    // 创建组合，位置用原来的 left/top
    const group = new fabric.Group([rect, textObj], {
      left: obj.left,
      top: obj.top,
      originX: obj.originX || 'left',
      originY: obj.originY || 'top',
      angle: obj.angle || 0,
      selectable: false,
      visible: isRender
    });

    return group;
  }

  /**
   * 添加文本
   * @param obj
   */
  public async addText(obj: FabricObjectVO) {
    const _this = this;
    // 深拷贝对象，避免外部数据被篡改
    obj = cloneData(obj);
    if (!obj.text) return;

    // 检查是否可以渲染
    const isRender: boolean = _this.isCanRenderTempl(obj);

    await _this.loadFont(obj);

    if (!obj.fixedWidthAndHeight) {
      await this.addTextUnfixed(obj, isRender);
    } else {
      await this.addTextFixed(obj, isRender);
    }
  }

  /**
   * 添加文本（开启固定宽高）
   */
  public async addTextFixed(obj: FabricObjectVO, isRender: boolean) {
    const _this = this;
    const helper = new TextFitHelper();

    // 清除原有文本对象
    _this.clearText(obj.id, obj.type);

    // 创建文本对象
    const font: any = markRaw(
      new fabric.Text(obj.text || '', {
        ...obj,
        selectable: false, // 文本不可选中
        visible: isRender // 根据 isRender 设置可见性
      })
    );
    // 保存原始数据
    font.originalFontSize = obj.fontSize || 16;
    font.originalWidth = obj.width;
    font.originalHeight = obj.height;
    font.originalTop = obj.top;
    font.originalLeft = obj.left;
    // 确保文本大小适应最大宽度，使用对象的width属性作为最大宽度
    helper.resizeTextToFitWidth(font, obj.width);
    const group = await _this.createTextGroup(obj, font, isRender);
    // 将文本对象添加到画布上
    _this.getCanvas().add(group);

    // 等待渲染完成后再调整字体大小
    await _this.requestRender();
  }

  /**
   * 添加文本（未开启固定宽高）
   */
  public async addTextUnfixed(obj: FabricObjectVO, isRender: boolean) {
    const _this = this;
    // 清除原有文本对象
    _this.clearText(obj.id, obj.type);
    // 创建文本对象
    const font: any = new fabric.Text(obj.text || '', {
      ...obj,
      selectable: false, // 文本不可选中
      visible: isRender // 根据 isRender 设置可见性
    });
    // 将文本对象添加到画布上
    _this.getCanvas().add(font);
    // 等待渲染完成后再调整字体大小
    await _this.requestRender();
  }

  /**
   * 修改文本
   */
  public async changeText(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    const _this = this;
    obj = cloneData(obj);
    if (!obj.fixedWidthAndHeight) {
      await _this.changeTextUnfixed(obj, config);
    } else {
      await _this.changeTextFixed(obj, config);
    }
  }

  /**
   * 修改文本（开启固定宽高）
   */
  public async changeTextFixed(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    const helper = new TextFitHelper();
    return this.updateFixedTextObject(obj, config, (target, width, cfg) => {
      helper.resizeTextToFitWidth(target, width, cfg);
    });
  }

  /**
   * 修改文本（未开启固定宽高）
   */
  public async changeTextUnfixed(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    return this.updateUnFixedTextObject(obj);
  }

  /**
   * 添加文本框
   * @param obj
   */
  public async addTextbox(obj: FabricObjectVO) {
    const _this = this;

    // 深拷贝对象，避免外部数据被篡改
    obj = cloneData(obj);
    if (!obj.text) return;

    // 检查是否可以渲染
    const isRender: boolean = _this.isCanRenderTempl(obj);

    await _this.loadFont(obj);
    if (!obj.fixedWidthAndHeight) {
      await _this.addTextboxUnfixed(obj, isRender);
    } else {
      await _this.addTextboxFixed(obj, isRender);
    }
  }

  /**
   * 添加文本框（开启固定宽高）
   */
  public async addTextboxFixed(obj: FabricObjectVO, isRender: boolean) {
    const _this = this;
    const helper = new TextFitHelper();

    // 清除已有文本框
    _this.clearText(obj.id, obj.type);

    // 创建文本框对象
    const textbox: any = markRaw(
      new fabric.Textbox(obj.text || '', {
        ...(({ path, ...rest }) => rest)(obj),
        selectable: false, // 设置文本框为不可选中
        visible: isRender // 根据 isRender 设置可见性
      })
    );
    // 保存原始数据
    textbox.originalFontSize = obj.fontSize || 16;
    textbox.originalWidth = obj.width;
    textbox.originalHeight = obj.height;
    textbox.originalTop = obj.top;
    textbox.originalLeft = obj.left;
    // 确保文本框的文字适应最大宽度
    helper.resizeTextToFitWidth(textbox, obj.width);
    const group = await _this.createTextGroup(obj, textbox, isRender);
    // 将文本框对象添加到画布上
    _this.getCanvas().add(group);
    await _this.requestRender();
  }

  /**
   * 添加文本框（未开启固定宽高）
   */
  public async addTextboxUnfixed(obj: FabricObjectVO, isRender: boolean) {
    const _this = this;

    // 清除已有文本框
    _this.clearText(obj.id, obj.type);

    // 创建文本框对象
    const textbox: any = new fabric.Textbox(obj.text || '', {
      ...(({ path, ...rest }) => rest)(obj),
      selectable: false, // 设置文本框为不可选中
      visible: isRender // 根据 isRender 设置可见性
    });
    // 将文本框对象添加到画布上
    _this.getCanvas().add(textbox);
    await _this.requestRender();
  }

  /**
   * 修改文本框
   */
  public async changeTextbox(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    const _this = this;
    obj = cloneData(obj);
    if (!obj.fixedWidthAndHeight) {
      await _this.changeTextboxUnfixed(obj, config);
    } else {
      await _this.changeTextboxFixed(obj, config);
    }
  }

  /**
   * 修改文本框（开启固定宽高）
   */
  public async changeTextboxFixed(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    const helper = new TextFitHelper();
    return this.updateFixedTextObject(obj, config, (target, width, cfg) => {
      return helper.resizeTextToFitWidth(target, width, cfg);
    });
  }

  /**
   * 修改文本框（未开启固定宽高）
   */
  public async changeTextboxUnfixed(obj: FabricObjectVO, config?: ChangeTextConfigVo) {
    return this.updateUnFixedTextObject(obj);
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
