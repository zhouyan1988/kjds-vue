import { FabricObjectVO } from '@/utils/editor';
import { cloneData } from '@deary/utils';
import { fabric } from 'fabric';
import { FabricClipPath } from '@/utils/FabricClipPath';
import { getImageInfo } from '@/utils/FabricCanvasEditor';

export class FabricImageUtils {
  constructor(
    private getCanvas: () => fabric.Canvas,
    private isCanRenderTempl: (obj: FabricObjectVO) => boolean,
    private requestRender: () => void
  ) {}

  /**
   * 计算图片大小比例
   */
  public getImageScale(obj: FabricObjectVO, src: string): Promise<FabricObjectVO> {
    return new Promise((resolve) => {
      getImageInfo(src).then((res) => {
        const tempCont = cloneData(obj);
        obj.src = res.src;
        obj.width = res.width;
        obj.height = res.height;
        // 计算缩放比例
        const scaleX = (tempCont.width * tempCont.scaleX) / obj.width;
        const scaleY = (tempCont.height * tempCont.scaleY) / obj.height;
        obj.scaleX = scaleX; // 应用宽度缩放
        obj.scaleY = scaleY; // 应用高度缩放
        resolve(obj);
      });
    });
  }

  /**
   * 添加图片
   * @param obj
   */

  public addImage(obj: FabricObjectVO) {
  const _this = this;
  obj = cloneData(obj);
  const isRender: boolean = _this.isCanRenderTempl(obj);
  _this.clearImage(obj.id, obj.type);

  return new Promise(async (resolve, reject) => {
    try {
      fabric.Image.fromURL(
        obj.src,
        async function (img) {
          if (!img) {
            return reject(new Error(`Image load error for ${obj.src}`));
          }

          // 直接在 fromURL 的回调里计算 scale（img.width/height 就是原图尺寸）
          const tempCont = cloneData(obj);
          const scaleX = (tempCont.width * tempCont.scaleX) / img.width!;
          const scaleY = (tempCont.height * tempCont.scaleY) / img.height!;
          obj.scaleX = scaleX;
          obj.scaleY = scaleY;

          if (obj.clipPath) {
            const { clipPath } = await FabricClipPath.create(obj);
            obj.clipPath = clipPath;
          }

          img.set({
            ...obj,
            selectable: false,
            visible: isRender
          });

          _this.getCanvas().add(img);
          await _this.requestRender();
          resolve(undefined);
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      reject(error);
    }
  });
}

  public addImageold(obj: FabricObjectVO) {
    const _this = this;

    // 深拷贝对象
    obj = cloneData(obj);

    // 检查是否可以渲染
    const isRender: boolean = _this.isCanRenderTempl(obj);

    // 清空画布上该位置的原图片
    _this.clearImage(obj.id, obj.type);

    return new Promise(async (resolve, reject) => {
      try {
        // 获取缩放后的对象
        const newObj = await _this.getImageScale(obj, obj.src);
        // 加载图片并添加到画布
        fabric.Image.fromURL(
          obj.src,
          async function (img) {
            if (!img) {
              console.error(`Failed to load image from ${obj.src}`);
              return reject(new Error(`Image load error for ${obj.src}`));
            }

            // 处理图片裁剪
            if (newObj && newObj.clipPath) {
              const { clipPath } = await FabricClipPath.create(newObj);
              newObj.clipPath = clipPath;
            }

            // 设置图片属性
            img.set({
              ...newObj,
              selectable: false, // 图片不可选中
              visible: isRender // 根据 isRender 设置可见性
            });

            // 添加到画布
            _this.getCanvas().add(img);

            // 渲染画布
            await _this.requestRender();
            resolve(undefined);
          },
          {
            crossOrigin: 'anonymous' // 处理跨域
          }
        );
      } catch (error) {
        console.error('Error in addImage:', error);
        reject(error); // 捕获错误并传递给 Promise
      }
    });
  }

  /**
   * 切换图片地址
   */
  public changeImage(obj: FabricObjectVO, src: string) {
    const _this = this;
    obj = cloneData(obj);
    _this.getCanvas().forEachObject(async (vo: FabricObjectVO) => {
      if (vo.type === obj.type && vo.id === obj.id) {
        const newObj = await _this.getImageScale(obj, src);
        // 当图片加载完成后，添加到画布上
        // @ts-ignore
        vo._element.src = src;
        // 处理图片裁剪
        if (newObj && newObj.clipPath) {
          const { clipPath } = await FabricClipPath.create(newObj);
          newObj.clipPath = clipPath;
        }
        vo.set({
          ...newObj,
          selectable: false // 设置为不可选中
        });
        _this.requestRender();
      }
    });
  }

  /**
   * 清除画布上某个位置的元素
   * @param id
   * @param type
   * @private
   */
  public clearImage(id: string, type: string) {
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
