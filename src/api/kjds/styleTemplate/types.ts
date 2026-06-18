export interface StyleTemplateVO {
  /**
   *
   */
  id: string | number;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 可选择图片数量
   */
  imageQuantity: number;

  /**
   * 可添加的文字数量
   */
  textQuantity: number;

  /**
   * 风格id
   */
  styleId: string | number;
}

export interface TemplateOptionsVO extends StyleTemplateVO {
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 价格
   */
  price?: number;
}

export interface StyleTemplateForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 可选择图片数量
   */
  imageQuantity?: number;

  /**
   * 可添加的文字数量
   */
  textQuantity?: number;

  /**
   * 风格id
   */
  styleId?: string | number;
}

export interface StyleTemplateQuery extends PageQuery {
  /**
   * 模板名称
   */
  name?: string;

  /**
   * 可选择图片数量
   */
  imageQuantity?: number;

  /**
   * 可添加的文字数量
   */
  textQuantity?: number;

  /**
   * 风格id
   */
  styleId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
