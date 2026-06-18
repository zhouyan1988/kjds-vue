export interface ProductVO {
  /**
   *
   */
  id: string | number;

  /**
   * 商品名称
   */
  name: string;

  /**
   * 价格(含税)
   */
  priceTaxIncluded: number;

  /**
   * 价格(不含税)
   */
  priceTaxNotIncluded: number;

  /**
   * 图像地址
   */
  imageUrl: string;

  /**
   * 类别
   */
  categories: string;

  /**
   * sku
   */
  sku: string;

  /**
   * 长度
   */
  length: number;

  /**
   * 宽度
   */
  wide: string | number;

  /**
   * 数量
   */
  number: number;

  /**
   * 介绍
   */
  introduction: string;

  /**
   * 状态（0正常 1停用）
   */
  status: string;
}

export interface ProductForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 商品名称
   */
  name?: string;

  /**
   * 价格(含税)
   */
  priceTaxIncluded?: number;

  /**
   * 价格(不含税)
   */
  priceTaxNotIncluded?: number;

  /**
   * 图像地址
   */
  imageUrl?: string;

  /**
   * 类别
   */
  categories?: string;

  /**
   * sku
   */
  sku?: string;

  /**
   * 长度
   */
  length?: number;

  /**
   * 宽度
   */
  wide?: string | number;

  /**
   * 数量
   */
  number?: number;

  /**
   * 介绍
   */
  introduction?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;
}

export interface ProductQuery extends PageQuery {
  /**
   * 商品名称
   */
  name?: string;

  /**
   * 价格(含税)
   */
  priceTaxIncluded?: number;

  /**
   * 价格(不含税)
   */
  priceTaxNotIncluded?: number;

  /**
   * 图像地址
   */
  imageUrl?: string;

  /**
   * 类别
   */
  categories?: string | number;

  /**
   * sku
   */
  sku?: string;

  /**
   * 长度
   */
  length?: number;

  /**
   * 宽度
   */
  wide?: string | number;

  /**
   * 数量
   */
  number?: number;

  /**
   * 介绍
   */
  introduction?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
