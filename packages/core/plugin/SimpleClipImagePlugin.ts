import { fabric } from 'fabric';
import { getPolygonVertices } from '@/utils/math';
import { get, set } from 'lodash-es';
import type { IEditor, IPluginTempl } from '@kuaitu/core';
import { ClipPathTypeEnum, EditorTypeEnum } from '@/utils/editor';
import { ClipPathOriginX, ClipPathOriginY } from '@/enums/ClipPathOriginEnums';

type IPlugin = Pick<SimpleClipImagePlugin, 'addClipPathToImage' | 'removeClip'>;

declare module '@kuaitu/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IEditor extends IPlugin {}
}

const getBounds = (activeObject: fabric.Object) => {
  const { left = 0, top = 0 } = activeObject;
  return {
    width: activeObject.getScaledWidth(),
    height: activeObject.getScaledHeight(),
    left,
    top
  };
};
const bindInfo = (shell: fabric.Object, activeObject: fabric.Object) => {
  bindFlagToObject(shell);
  bindFlagToObject(shell, 'targetId', get(activeObject, 'id'));
  bindFlagToObject(shell, 'targetType', get(activeObject, 'type'));
};
const bindFlagToObject = (activeObject: fabric.Object, key = 'clip', value: any = true) => {
  set(activeObject, key, value);
};
const createRectClip = (activeObject: fabric.Object, inverted: boolean) => {
  const { width = 0, height = 0, left = 0, top = 0 } = getBounds(activeObject);
  const clipW = Math.round(width / 2);
  const clipH = Math.round(height / 2);
  const shell = new fabric.Rect({
    width: clipW,
    height: clipH,
    fill: 'rgba(0,0,0,0)',
    originX: ClipPathOriginX,
    originY: ClipPathOriginY,
    left: left + width / 2,
    top: top + height / 2
  });
  bindInfo(shell, activeObject);
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
};
const createCircleClip = (activeObject: fabric.Object, inverted: boolean) => {
  const point = activeObject.getCenterPoint();
  const { width } = getBounds(activeObject);
  const shell = new fabric.Ellipse({
    fill: 'rgba(0,0,0,0)',
    originX: ClipPathOriginX,
    originY: ClipPathOriginY,
    left: point.x,
    top: point.y,
    rx: width / 4,
    ry: width / 4
  });
  bindInfo(shell, activeObject);
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
};
const createTriClip = (activeObject: fabric.Object, inverted: boolean) => {
  const point = activeObject.getCenterPoint();
  const { width = 0, height = 0 } = getBounds(activeObject);
  const clipW = Math.round(width / 2);
  const clipH = Math.round(height / 2);
  const shell = new fabric.Triangle({
    fill: 'rgba(0,0,0,0)',
    originX: ClipPathOriginX,
    originY: ClipPathOriginY,
    left: point.x,
    top: point.y,
    width: clipW,
    height: clipH
  });
  bindInfo(shell, activeObject);
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
};
const createPolygonClip = (activeObject: fabric.Object, inverted: boolean) => {
  const point = activeObject.getCenterPoint();
  const points = getPolygonVertices(5, 200);
  const shell = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0)',
    originX: ClipPathOriginX,
    originY: ClipPathOriginY,
    left: point.x,
    top: point.y
  });
  bindInfo(shell, activeObject);
  const clipPath = new fabric.Polygon([...points], {
    absolutePositioned: true,
    originX: ClipPathOriginX,
    originY: ClipPathOriginY,
    left: shell.left,
    top: shell.top,
    inverted: inverted
  });
  return { shell, clipPath };
};
export default class SimpleClipImagePlugin implements IPluginTempl {
  static pluginName = 'SimpleClipImagePlugin';
  //  static events = ['sizeChange'];
  static apis = ['addClipPathToImage', 'removeClip'];
  constructor(
    public canvas: fabric.Canvas,
    public editor: IEditor
  ) {}
  addClipPathToImage(value: string) {
    const activeObject = this.canvas.getActiveObjects()[0];
    if (activeObject && activeObject.type === EditorTypeEnum.Image) {
      let clip: { shell: fabric.Object; clipPath: fabric.Object } | null = null;
      const [name, inverted] = value.split('-');
      const isInverted = !!inverted;
      switch (name) {
        case ClipPathTypeEnum.Polygon:
          clip = createPolygonClip(activeObject, isInverted);
          break;
        case ClipPathTypeEnum.Rect:
          clip = createRectClip(activeObject, isInverted);
          break;
        case ClipPathTypeEnum.Circle:
          clip = createCircleClip(activeObject, isInverted);
          break;
        case ClipPathTypeEnum.Triangle:
          clip = createTriClip(activeObject, isInverted);
          break;
      }
      if (clip == null) return;
      const { shell, clipPath } = clip;
      // 公共更新方法
      const updatePosition = () => {
        clipPath.setPositionByOrigin(shell.getCenterPoint(), 'center', 'center');
        activeObject.set('dirty', true);
        this.setPosition(activeObject, shell, clipPath);
      };

      // 绑定事件监听
      shell.on('moving', updatePosition);

      shell.on('rotating', () => {
        clipPath.set('angle', shell.angle);
        activeObject.set('dirty', true);
        this.setPosition(activeObject, shell, clipPath);
      });

      shell.on('scaling', () => {
        clipPath.set({
          scaleX: shell.scaleX,
          scaleY: shell.scaleY
        });
        updatePosition();
      });

      shell.on('deselected', () => {
        // 形状特异性调整
        if (clipPath instanceof fabric.Ellipse && shell instanceof fabric.Ellipse) {
          clipPath.set({ rx: shell.getRx(), ry: shell.getRy() });
        } else if (shell instanceof fabric.Polygon) {
          const { scaleX: cSx = 1, scaleY: cSy = 1 } = clipPath;
          const { scaleX: sSx = 1, scaleY: sSy = 1 } = shell;
          clipPath.set('scaleX', cSx * sSx).set('scaleY', cSy * sSy);
        } else {
          clipPath.set({
            width: shell.getScaledWidth(),
            height: shell.getScaledHeight()
          });
        }

        // 公共反选逻辑
        this.correctPosition(activeObject, shell, clipPath);
        activeObject.set('dirty', true);
        this.setPosition(activeObject, shell, clipPath);
        this.canvas.remove(shell);
        this.canvas.requestRenderAll();
      });
      this.setPosition(activeObject, shell, clipPath);

      // 初始化设置
      activeObject.set({ clipPath: clipPath });
      this.canvas.add(shell);
      this.canvas.setActiveObject(shell);
    }
  }
  correctPosition(activeObject: fabric.Object, shell: fabric.Object, clipPath: fabric.Object) {
    const position = activeObject.toLocalPoint(shell.getCenterPoint(), 'center', 'center');
    const { scaleX = 1, scaleY = 1 } = activeObject;
    clipPath.set({
      absolutePositioned: false,
      left: position.x / scaleX,
      top: position.y / scaleY,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY
    });
  }
  setPosition(activeObject: fabric.Object, shell: fabric.Object, clipPath: fabric.Object) {
    activeObject.set({
      // @ts-ignore
      clipPathLeft: shell.left,
      // @ts-ignore
      clipPathTop: shell.top
    });
  }
  removeClip() {
    const activeObject = this.canvas.getActiveObjects()[0];
    if (activeObject && activeObject.type === EditorTypeEnum.Image) {
      activeObject.set({ clipPath: undefined });
      activeObject.set('dirty', true);
      this.canvas.requestRenderAll();
    }
  }
}
