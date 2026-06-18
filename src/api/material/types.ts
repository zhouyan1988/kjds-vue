export interface MaterialVO {
  /**
   * 素材ID
   */
  id?: string | number;

  /**
   * 素材名称
   */
  name?: string;

  /**
   * 素材图
   */
  imageList?: string[];

  /**
   * 图片总数
   */
  imageCount?: number;
}

export interface MaterialForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   *素材id
   */
  materialId?: string | number;

  /**
   * 素材名称
   */
  name?: string;

  /**
   * 素材文件
   */
  file?: string;

  /**
   * 素材预览图
   */
  img?: string;

  /**
   * 素材图片列表
   */
  imageList?: string[];

  /**
   * 状态（0正常 1停用）
   */
  status?: string;
}

export interface MaterialQuery extends PageQuery {
  /**
   *
   */
  id?: string | number;

  /**
   *素材id
   */
  materialId?: string | number;

  /**
   * 素材名称
   */
  name?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
