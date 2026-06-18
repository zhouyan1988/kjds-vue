import { markRaw } from 'vue';
import { ChangeTextConfigVo, EditorTypeEnum, FabricObjectVO } from '@/utils/editor';
import { fabric } from 'fabric';

/**
 * 文本缩放与测量工具
 */
export class TextFitHelper {
  /**
   * 测量单行文本宽度（不依赖 Fabric 渲染）
   * 自动考虑中英文字符差异和安全边距
   */
  private measureTextWidth(textObject: FabricObjectVO): number {
    const ctx = document.createElement('canvas').getContext('2d')!;
    const fontSize = textObject.fontSize || 16;
    const fontFamily = textObject.fontFamily || 'sans-serif';
    ctx.font = `${fontSize}px ${fontFamily}`;

    let width = 0;
    const text = textObject.text || '';
    for (const char of text) {
      // 中文字符稍微增加 5% 宽度作为安全修正
      const charWidth = ctx.measureText(char).width;
      width += /[\u4e00-\u9fa5]/.test(char) ? charWidth * 1.05 : charWidth;
    }

    // 增加更大的安全边距，特别是为西文字符预留空间
    // 英文字符通常需要更多边距以避免截断
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const buffer = isChinese ? 7 : 10;
    return width + buffer;
  }

  /**
   * 计算指定字体大小下文本的实际行数
   */
  private calculateLineCount(textObject: FabricObjectVO, containerWidth: number, fontSize: number): number {
    const originalFontSize = textObject.fontSize;
    textObject.set({ fontSize });

    const textWidth = this.measureTextWidth(textObject);
    const lineCount = Math.ceil(textWidth / containerWidth);

    // 恢复原字体大小
    textObject.set({ fontSize: originalFontSize });
    return lineCount;
  }

  /**
   * 计算文本的最大适应宽度
   * @param textObject 文本对象
   * @param maxWidth 最大宽度
   * @param config 配置对象 {line:限制行数}
   */
  public resizeTextToFitWidth(textObject: FabricObjectVO, maxWidth?: number, config?: ChangeTextConfigVo): void {
    if (!textObject.fixedWidthAndHeight || !textObject.text) return;

    // 初始化原始字体大小
    const baseFontSize = textObject.originalFontSize || 16;
    textObject.set({ fontSize: baseFontSize });

    // 最大宽度
    const targetMaxWidth = maxWidth || textObject.width || this.measureTextWidth(textObject);
    // 最大行数
    const targetMaxLines = config?.line || 1;

    // 如果是单行文本或者不支持多行的类型，直接使用原来的逻辑
    if (targetMaxLines === 1 || textObject.type !== EditorTypeEnum.TextBox) {
      this.fitSingleLineText(textObject, targetMaxWidth, baseFontSize);
      return;
    }

    // 多行文本处理逻辑
    this.fitMultiLineText(textObject, targetMaxWidth, targetMaxLines, baseFontSize);
  }

  /**
   * 处理单行文本适配
   */
  private fitSingleLineText(textObject: FabricObjectVO, targetMaxWidth: number, baseFontSize: number): void {
    let low = 0;
    let high = baseFontSize;
    let newFontSize = baseFontSize;

    while (high - low > 0.1) {
      const mid = (low + high) / 2;
      textObject.set({ fontSize: mid });
      const width = this.measureTextWidth(textObject);

      if (width > targetMaxWidth) {
        high = mid - 0.1;
      } else {
        low = mid + 0.1;
        newFontSize = mid;
      }
    }

    textObject.set({ fontSize: newFontSize });
  }

  /**
   * 处理多行文本适配
   */
  private fitMultiLineText(textObject: FabricObjectVO, targetMaxWidth: number, targetMaxLines: number, baseFontSize: number): void {
    // 首先检查原始字体大小下的行数
    const originalLineCount = this.calculateLineCount(textObject, targetMaxWidth, baseFontSize);

    // 如果原始字体大小下不超过最大行数，直接使用原始字体大小
    if (originalLineCount <= targetMaxLines) {
      textObject.set({ fontSize: baseFontSize });
      console.log(`文本在原始字体大小 ${baseFontSize}px 下为 ${originalLineCount} 行，未超过最大行数 ${targetMaxLines}，保持原字体大小`);
      // 强制触发视图更新
      this.forceUpdateTextObject(textObject);
      return;
    }

    console.log(`文本在原始字体大小 ${baseFontSize}px 下为 ${originalLineCount} 行，超过最大行数 ${targetMaxLines}，开始缩放字体`);

    // 如果超过最大行数，使用二分法找到合适的字体大小
    let low = 1; // 最小字号设为1，避免字体过小
    let high = baseFontSize;
    let newFontSize = baseFontSize;

    while (high - low > 0.1) {
      const mid = (low + high) / 2;
      const lineCount = this.calculateLineCount(textObject, targetMaxWidth, mid);

      if (lineCount > targetMaxLines) {
        // 行数还是太多，需要继续缩小字体
        high = mid - 0.1;
      } else {
        // 行数符合要求，尝试使用更大的字体
        low = mid + 0.1;
        newFontSize = mid;
      }
    }

    console.log(`最终字体大小：${newFontSize}px，预计行数：${this.calculateLineCount(textObject, targetMaxWidth, newFontSize)}`);
    textObject.set({ fontSize: newFontSize });
  }

  /**
   * 最终解决方案：完全重新设置文本对象 - Vue 3 兼容版本
   */
  private async forceCompleteUpdate(textObject: FabricObjectVO): Promise<void> {
    console.log('使用 Vue 3 兼容的最终解决方案：完全重新设置文本对象');

    return new Promise<void>((resolve) => {
      const canvas = textObject.canvas;
      if (!canvas) {
        console.log('没有找到 canvas 对象');
        resolve();
        return;
      }

      // 保存对象的所有属性
      const savedProps = {
        ...textObject,
        text: textObject.text,
        fontSize: textObject.fontSize,
        fontFamily: textObject.fontFamily,
        width: textObject.originalWidth
      };

      console.log('保存的属性:', savedProps);

      // 使用 setTimeout 确保移除操作完成
      setTimeout(() => {
        try {
          // 创建新的文本对象 - 这是关键！
          let newTextObject;

          if (textObject.type === EditorTypeEnum.TextBox) {
            //@ts-expect-error: 使用 fabric.Textbox 创建新对象
            newTextObject = new fabric.Textbox(savedProps.text, { ...savedProps });
          } else {
            // 使用 fabric.Text 创建新对象
            newTextObject = new fabric.Text(savedProps.text, {
              ...savedProps
            });
          }

          // 设置自定义属性
          newTextObject.set({
            id: savedProps.id,
            fixedWidthAndHeight: savedProps.fixedWidthAndHeight,
            originalFontSize: savedProps.originalFontSize,
            originalWidth: savedProps.originalWidth,
            width: savedProps.originalWidth
          });

          // 使用 markRaw 避免 Vue 3 响应式系统干扰
          const rawTextObject = markRaw(newTextObject);

          console.log('创建新的文本对象完成');

          // 强制渲染
          canvas.requestRenderAll();
          console.log('已请求重新渲染');

          // 更新原对象的引用（如果需要）
          Object.assign(textObject, rawTextObject);

          resolve();
        } catch (error) {
          console.error('创建新文本对象失败:', error);
          resolve();
        }
      }, 10);
    });
  }

  /**
   * 强制更新文本对象，确保视图同步
   */
  private forceUpdateTextObject(textObject: FabricObjectVO, isKeepOriginalSize: boolean = false): void {
    console.log(`强制更新文本对象，当前字体大小: ${textObject.fontSize}, 保持原始大小: ${isKeepOriginalSize}`);
    console.log(`当前文本内容: "${textObject.text}"`);

    if (isKeepOriginalSize) {
      // 对于保持原始大小的情况，使用更强力的更新方式
      console.log('使用强力更新方式');

      // 方法1: 强制重新设置文本内容，触发文本重新渲染
      const originalText = textObject.text;
      textObject.set({ text: '' }); // 先清空文本

      // 使用 setTimeout 确保异步更新
      setTimeout(() => {
        textObject.set({ text: originalText }); // 恢复文本内容
        this.forceCompleteUpdate(textObject);
      }, 0);
    } else {
      this.forceCompleteUpdate(textObject);
    }
  }
}
