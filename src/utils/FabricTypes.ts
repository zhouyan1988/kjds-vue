import { FabricObjectVO } from '@/utils/editor';

export interface ActiveObjectInterface {
  width: number;
  originalWidth?: number;
  height: number;
  originalHeight?: number;
  left: number;
  top: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
}

export interface FabricClipPathVo {
  shell: FabricObjectVO | fabric.Rect | fabric.Ellipse | fabric.Triangle | fabric.Polygon;
  clipPath: FabricObjectVO | fabric.Rect | fabric.Ellipse | fabric.Triangle | fabric.Polygon;
}
