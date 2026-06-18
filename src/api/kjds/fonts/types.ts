export interface FontsVO {
  /**
   *
   */
  id: string | number;

  /**
   * 字体名称
   */
  name: string;
  /**
   * 字体类型
   */
  type: string;

  /**
   * 字体文件
   */
  file: string;

  /**
   * 字体文件Url
   */
  fileUrl: string;

  /**
   * 字体预览图
   */
  img: string;

  /**
   * 字体预览图Url
   */
  imgUrl: string;
  /**
   * 状态（0正常 1停用）
   */
  status: string;
}

export interface FontsForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 字体名称
   */
  name?: string;

  /**
   * 字体文件
   */
  file?: string;

  /**
   * 字体预览图
   */
  img?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;
}

export interface FontsQuery extends PageQuery {
  /**
   * 字体名称
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
