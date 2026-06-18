import { FabricObjectVO, PersonalizedImgVo } from '@/utils/editor';
import { ActiveObjectInterface } from '@/utils/FabricTypes';
import { get, set } from 'lodash-es';

export class FabricUtils {
  /**
   * 获取裁剪路径
   * @param activeObject
   */
  public static getBoundsClipPath(activeObject: FabricObjectVO): ActiveObjectInterface {
    const { width = 0, height = 0, left = 0, top = 0, scaleX = 0, scaleY = 0, angle = 0 } = activeObject?.clipPath;
    return {
      width,
      height,
      left,
      top,
      scaleX,
      scaleY,
      angle
    };
  }

  /**
   * 获取边界
   * @param activeObject
   */
  public static getBounds(activeObject: FabricObjectVO): ActiveObjectInterface {
    const { width = 0, height = 0, left = 0, top = 0, scaleX = 0, scaleY = 0 } = activeObject;
    return {
      width: width * scaleX,
      originalWidth: width,
      height: height * scaleY,
      originalHeight: height,
      left,
      top,
      scaleX,
      scaleY
    };
  }

  /**
   * 绑定信息
   * @param shell
   * @param activeObject
   */
  public static bindInfo(shell: FabricObjectVO, activeObject: FabricObjectVO) {
    this.bindFlagToObject(shell);
    this.bindFlagToObject(shell, 'targetId', get(activeObject, 'id'));
    this.bindFlagToObject(shell, 'targetType', get(activeObject, 'type'));
  }

  /**
   * 绑定信息
   * @param activeObject
   * @param key
   * @param value
   */
  public static bindFlagToObject(activeObject: FabricObjectVO, key = 'clip', value: any = true) {
    set(activeObject, key, value);
  }

  public static getPersonalizedImageSrc(item: string | PersonalizedImgVo): string {
    return this.isPersonalizedImgVo(item) ? item.src : item;
  }

  /**
   * 获取所有图片的src数组（用于兼容旧逻辑）
   * @param imgs
   */
  public static getPersonalizedImageSrcArray(imgs: (string | PersonalizedImgVo)[]): string[] {
    if (!imgs) return [];
    return imgs.map((item) => this.getPersonalizedImageSrc(item));
  }

  /**
   * 判断是否为PersonalizedImgVo对象
   * @param item
   */
  public static isPersonalizedImgVo(item: string | PersonalizedImgVo): item is PersonalizedImgVo {
    return typeof item === 'object' && item !== null && 'src' in item;
  }

  /**
   * 将字符串数组转换为PersonalizedImgVo数组
   * @param imgs
   */
  public static convertToPersonalizedImgVoArray(imgs: (string | PersonalizedImgVo)[]): PersonalizedImgVo[] {
    if (!imgs) return [];
    return imgs.map((item) => {
      if (this.isPersonalizedImgVo(item)) {
        return item;
      }
      return { src: item, name: '' };
    });
  }
}
