import { FabricObjectVO } from '@/utils/editor';

/**
 * 路径生成器
 */
export class FabricPathGenerator {
  /**
   * 创建文字路径
   * @param obj 路径文字配置对象
   * @returns 路径字符串
   */
  public static generate(obj: FabricObjectVO): string {
    const _this = this;
    // 如果 obj.path 已经有点集，优先使用
    if (obj.path && Array.isArray(obj.path.path)) {
      return this.pathArrayToString(obj.path.path);
    }
    const { pathData, pathType = 'curve' } = obj;

    // 如果已有路径数据，直接使用
    if (pathData && typeof pathData === 'string') {
      return pathData;
    }

    // 根据路径类型生成默认路径
    switch (pathType) {
      case 'line':
        return _this.line(obj);
      case 'curve':
        return _this.curve(obj);
      case 'circle':
        return _this.circle(obj);
      case 'wave':
        return _this.wave(obj);
      default:
        return _this.curve(obj);
    }
  }

  /**
   * 将 fabric.Path 的 path 数组转换为 SVG path 字符串
   */
  public static pathArrayToString(pathArray: any[]): string {
    return pathArray
      .map((seg) => seg.join(' ')) // 每个子数组转成 "M x y" / "Q x1 y1 x y"
      .join(' ');
  }

  /**
   * 根据 obj.path 点集创建路径
   * @param obj FabricObjectVO
   * @returns 路径字符串
   */
  public static custom(obj: FabricObjectVO): string {
    const { path } = obj;
    if (!Array.isArray(path) || path.length < 2) {
      console.warn('无效的 path 数据:', path);
      return '';
    }

    // path: [{ x: number, y: number }, ...]
    const [first, ...rest] = path;
    let pathStr = `M ${first.x} ${first.y}`;

    for (const p of rest) {
      pathStr += ` L ${p.x} ${p.y}`;
    }

    // 如果是闭合路径，加 Z
    if (obj.closePath) {
      pathStr += ' Z';
    }

    return pathStr;
  }

  /**
   * 创建直线路径
   */
  public static line(obj: FabricObjectVO): string {
    const width = obj.width || 200;
    const startX = obj.left || 0;
    const startY = obj.top || 0;

    return `M ${startX} ${startY} L ${startX + width} ${startY}`;
  }

  /**
   * 创建曲线路径
   */
  public static curve(obj: FabricObjectVO): string {
    const width = obj.width || 200;
    const height = obj.height || 100;
    const startX = obj.left || 0;
    const startY = obj.top || 0;
    const curveHeight = obj.curveHeight || 50;

    const cp1x = startX + width * 0.25;
    const cp1y = startY - curveHeight;
    const cp2x = startX + width * 0.75;
    const cp2y = startY - curveHeight;
    const endX = startX + width;
    const endY = startY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`;
  }

  /**
   * 创建圆形路径
   */
  public static circle(obj: FabricObjectVO): string {
    const radius = (obj.width || 200) / 2;
    const centerX = (obj.left || 0) + radius;
    const centerY = (obj.top || 0) + radius;

    return `M ${centerX - radius} ${centerY}
          A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}
          A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`;
  }

  /**
   * 创建波浪路径
   */
  public static wave(obj: FabricObjectVO): string {
    const width = obj.width || 200;
    const startX = obj.left || 0;
    const startY = obj.top || 0;
    const waveHeight = obj.waveHeight || 20;
    const waveCount = obj.waveCount || 3;

    let path = `M ${startX} ${startY}`;
    const waveWidth = width / waveCount;

    for (let i = 0; i < waveCount; i++) {
      const x1 = startX + i * waveWidth + waveWidth * 0.25;
      const y1 = startY + (i % 2 === 0 ? -waveHeight : waveHeight);
      const x2 = startX + i * waveWidth + waveWidth * 0.75;
      const y2 = startY + (i % 2 === 0 ? -waveHeight : waveHeight);
      const x3 = startX + (i + 1) * waveWidth;
      const y3 = startY;

      path += ` Q ${x1} ${y1} ${startX + i * waveWidth + waveWidth * 0.5} ${startY}`;
      path += ` Q ${x2} ${y2} ${x3} ${y3}`;
    }

    return path;
  }
}
