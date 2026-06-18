import { OptArresVO } from '@/utils/editor';

export interface OptArresPriceVo extends OptArresVO {
  /**
   * 是否设置附加价格
   */
  setPrice: boolean;
  /**
   * 附加价格
   */
  price: number;
}

export interface TemplateOptionsPriceVo {
  [key: string]: OptArresPriceVo[];
}

export interface textConfigItemVo {
  /**
   * 最小数字限制
   */
  min?: number;
  /**
   * 最大数字限制
   */
  max?: number;
  /**
   * 限制行数
   */
  line?: number;
}

/**
 * 配置项
 */
export interface textConfigVO {
  /**
   * 文本域配置
   */
  textConfig: textConfigItemVo;
}

export interface ProductMergeStyleTemplateConfigVO {
  [key: string]: textConfigVO;
}

export interface ProductMergeStyleVO {
  /**
   *
   */
  id: string | number;

  /**
   * 图像地址
   */
  imageUrl: string;

  /**
   * 名称
   */
  name: string;

  /**
   * 模板选项标签
   */
  templateOptionLabel: string;

  /**
   * 模板配置
   */
  templateConfig: string | ProductMergeStyleTemplateConfigVO;

  /**
   * 产品id
   */
  productId: string | number;

  /**
   * 风格id
   */
  styleId: string | number;

  /**
   * 状态（0正常 1停用）
   */
  status: string;
}

export interface ProductMergeStyleForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 图像地址
   */
  imageUrl?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 产品id
   */
  productId?: string | number;

  /**
   * 风格id
   */
  styleId?: string | number;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;
}

export interface ProductMergeStyleQuery extends PageQuery {
  /**
   * 图像地址
   */
  imageUrl?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 产品id
   */
  productId?: string | number;

  /**
   * 风格id
   */
  styleId?: string | number;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
