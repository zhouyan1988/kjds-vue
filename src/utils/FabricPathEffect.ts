import { FabricObjectVO } from '@/utils/editor';

export class FabricPathEffect {
  /**
   * 应用路径文字效果
   * @param textObject 文字对象
   * @param pathObject 路径对象
   * @param config 配置对象
   */
  public static apply(textObject: any, pathObject: any, config: FabricObjectVO) {
    const _this = this;

    // 设置文字沿路径排列
    if (pathObject && pathObject.path) {
      const pathLength = _this.getPathLength(pathObject.path);
      const textWidth = textObject.width || 0;

      // 计算文字在路径上的位置
      let startOffset = config.pathStartOffset || 0;

      if (config.pathAlign === 'center') {
        startOffset = (pathLength - textWidth) / 2;
      } else if (config.pathAlign === 'right') {
        startOffset = pathLength - textWidth;
      }

      // 应用变换
      textObject.set({
        pathStartOffset: Math.max(0, startOffset)
      });

      // 设置文字方向（路径的哪一侧）
      if (config.pathSide === 'right') {
        textObject.set({
          flipY: true
        });
      }
    }
  }

  /**
   * 获取路径长度
   * @param pathString 路径字符串
   * @returns 路径长度
   */
  public static getPathLength(pathString: string): number {
    // 验证并修复路径字符串格式
    if (!pathString || typeof pathString !== 'string') {
      return 0;
    }

    // 修复路径字符串格式，确保命令和数值之间有正确的分隔
    let fixedPathString = pathString.trim();
    // 修复类似 "M,340.847" 这样的格式问题，替换为 "M 340.847"
    fixedPathString = fixedPathString.replace(/([MmLlHhVvCcSsQqTtAaZz]),/g, '$1 ');
    // 修复多个连续逗号或逗号后没有空格的问题
    fixedPathString = fixedPathString.replace(/,+/g, ' ');
    // 移除多余的空格
    fixedPathString = fixedPathString.replace(/\s+/g, ' ');

    // 创建临时SVG元素来计算路径长度
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    path.setAttribute('d', fixedPathString);

    svg.appendChild(path);
    document.body.appendChild(svg);

    let length = 0;
    try {
      length = path.getTotalLength();
    } catch (e) {
      console.error('获取路径长度失败:', e);
      console.error('原始路径字符串:', pathString);
      console.error('修复后路径字符串:', fixedPathString);
    }

    document.body.removeChild(svg);

    return length;
  }
}
