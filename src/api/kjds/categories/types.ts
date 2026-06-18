export interface CategoriesVO {
  /**
   *
   */
  id: string | number;

  /**
   * 类别名称
   */
  categories: string;
}

export interface CategoriesForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 类别名称
   */
  categories?: string;
}

export interface CategoriesQuery extends PageQuery {
  /**
   * 类别名称
   */
  categories?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
