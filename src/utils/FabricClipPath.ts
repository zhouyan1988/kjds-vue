import { ClipPathTypeEnum, FabricObjectVO } from '@/utils/editor';
import { ClipPathOriginX, ClipPathOriginY } from '@/enums/ClipPathOriginEnums';
import { fabric } from 'fabric';
import { getPolygonVertices } from '@/utils/math';
import { FabricUtils } from '@/utils/FabricUtils';
import { FabricClipPathVo } from '@/utils/FabricTypes';

export class FabricClipPath {
  public static create(obj: FabricObjectVO): Promise<FabricClipPathVo> {
    const _this = this;
    let clip: FabricClipPathVo | null = null;
    return new Promise(async (resolve, reject) => {
      const type = obj?.clipPath?.type;
      const isInverted = obj?.clipPath?.inverted;
      switch (type) {
        case ClipPathTypeEnum.Rect:
          clip = _this.createRectClip(obj, isInverted);
          break;
        case ClipPathTypeEnum.Circle:
        case ClipPathTypeEnum.Ellipse:
          clip = _this.createCircleClip(obj, isInverted);
          break;
        case ClipPathTypeEnum.Triangle:
          clip = _this.createTriClip(obj, isInverted);
          break;
        case ClipPathTypeEnum.Polygon:
          clip = _this.createPolygonClip(obj, isInverted);
          break;
      }
      if (clip && clip.clipPath) {
        // 处理缩放等情况
        (clip.clipPath as fabric.Object).set({
          angle: clip.shell.angle,
          scaleX: clip.shell.scaleX,
          scaleY: clip.shell.scaleY
        });
        clip.clipPath.setPositionByOrigin(clip.shell.getCenterPoint(), ClipPathOriginX, ClipPathOriginY);
      }
      if (clip == null) {
        reject();
      } else {
        resolve(clip);
      }
    });
  }

  private static createRectClip(activeObject: FabricObjectVO, inverted: boolean) {
    const { canvasScaleW, canvasScaleH, clipPathLeft, clipPathTop } = activeObject;
    const { width = 0, height = 0, left = 0, top = 0, angle = 0 } = FabricUtils.getBoundsClipPath(activeObject);
    const shell = new fabric.Rect({
      width: width * canvasScaleW,
      height: height * canvasScaleH,
      fill: 'rgba(0,0,0,0)',
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: clipPathLeft * canvasScaleW,
      top: clipPathTop * canvasScaleH,
      angle: angle
    });
    FabricUtils.bindInfo(<FabricObjectVO>shell, activeObject);
    const clipPath = new fabric.Rect({
      absolutePositioned: true,
      width: shell.width,
      height: shell.height,
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: shell.left,
      top: shell.top,
      inverted: inverted
    });
    return { clipPath, shell };
  }

  private static createCircleClip(activeObject: FabricObjectVO, inverted: boolean) {
    const { canvasScaleW, canvasScaleH, clipPathLeft, clipPathTop } = activeObject;
    const { width = 0, height = 0, left = 0, top = 0, angle = 0 } = FabricUtils.getBoundsClipPath(activeObject);
    const shell = new fabric.Ellipse({
      fill: 'rgba(0,0,0,0)',
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: clipPathLeft * canvasScaleW,
      top: clipPathTop * canvasScaleH,
      rx: (width * canvasScaleW) / 2,
      ry: (height * canvasScaleH) / 2,
      angle: angle
    });
    // @ts-expect-error：忽略fabric类型检查
    FabricUtils.bindInfo(<FabricObjectVO>shell, activeObject);
    const clipPath = new fabric.Ellipse({
      absolutePositioned: true,
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: shell.left,
      top: shell.top,
      inverted: inverted,
      rx: shell.rx,
      ry: shell.ry
    });
    return { shell, clipPath };
  }

  private static createTriClip(activeObject: FabricObjectVO, inverted: boolean) {
    const { canvasScaleW, canvasScaleH, clipPathLeft, clipPathTop } = activeObject;
    const { width = 0, height = 0, left = 0, top = 0, angle = 0 } = FabricUtils.getBoundsClipPath(activeObject);
    const shell = new fabric.Triangle({
      fill: 'rgba(0,0,0,0)',
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: clipPathLeft * canvasScaleW,
      top: clipPathTop * canvasScaleH,
      width: width * canvasScaleW,
      height: height * canvasScaleH,
      angle: angle
    });
    FabricUtils.bindInfo(<FabricObjectVO>shell, activeObject);
    const clipPath = new fabric.Triangle({
      absolutePositioned: true,
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: shell.left,
      top: shell.top,
      width: shell.width,
      height: shell.height,
      inverted: inverted
    });
    return { shell, clipPath };
  }

  /**
   * todo !!! 暂未使用，存在与实际大小不符，待优化
   */
  private static createPolygonClip(activeObject: FabricObjectVO, inverted: boolean) {
    const { canvasScaleW, canvasScaleH, clipPathLeft, clipPathTop } = activeObject;
    const { width = 0, height = 0, left = 0, top = 0, angle = 0 } = FabricUtils.getBoundsClipPath(activeObject);
    const points = getPolygonVertices(5, 200);
    const shell = new fabric.Polygon(points, {
      fill: 'rgba(0,0,0,0)',
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: clipPathLeft * canvasScaleW,
      top: clipPathTop * canvasScaleH,
      width: width * canvasScaleW,
      height: height * canvasScaleH,
      angle: activeObject.angle
    });
    // @ts-expect-error：忽略fabric类型检查
    FabricUtils.bindInfo(<FabricObjectVO>shell, activeObject);
    const clipPath = new fabric.Polygon([...points], {
      absolutePositioned: true,
      originX: ClipPathOriginX,
      originY: ClipPathOriginY,
      left: shell.left,
      top: shell.top,
      inverted: inverted
    });
    return { shell, clipPath };
  }
}
