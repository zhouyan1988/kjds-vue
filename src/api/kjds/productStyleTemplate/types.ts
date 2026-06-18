export interface ProductStyleTemplateVO {
  /**
   *
   */
  id: string | number;

  /**
   * 组合id
   */
  productMergeStyleId: string | number;

  /**
   * 风格模板id
   */
  styleTemplateId: string | number;

  /**
   * 价格
   */
  price: number;
}

export interface ProductStyleTemplateForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 组合id
   */
  productMergeStyleId?: string | number;

  /**
   * 风格模板id
   */
  styleTemplateId?: string | number;

  /**
   * 价格
   */
  price?: number;
}

export interface ProductStyleTemplateQuery extends PageQuery {
  /**
   * 组合id
   */
  productMergeStyleId?: string | number;

  /**
   * 风格模板id
   */
  styleTemplateId?: string | number;

  /**
   * 价格
   */
  price?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
