import { EditorTemplVo } from '@/utils/editor';
import { StyleTemplateVO } from '@/api/kjds/styleTemplate/types';

export interface CategoriesStyleVO {
  /**
   *
   */
  id: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 示意图
   */
  definitionImageUrl: string;

  /**
   * 所属类别ID
   */
  categoriesId: string | number;

  /**
   * 所属类别
   */
  categoriesName: string;

  /**
   * 长度
   */
  length: number;

  /**
   * 宽度
   */
  width: string | number;

  /**
   * 格式
   */
  type: string;

  /**
   * 状态（0正常 1停用）
   */
  status: string;

  /**
   * 模板
   */
  templs: string | null | EditorTemplVo[];

  /**
   * 创建时间
   */
  createTime: string;

  dsStyleTemplateVoList: StyleTemplateVO[];
}

export interface CategoriesStyleForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 示意图
   */
  definitionImageUrl?: string;

  /**
   * 所属类别
   */
  categoriesId?: string | number;

  /**
   * 长度
   */
  length?: number;

  /**
   * 宽度
   */
  width?: string | number;

  /**
   * 格式
   */
  type?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;
}

export interface CategoriesStyleQuery extends PageQuery {
  /**
   * 名称
   */
  name?: string;

  /**
   * 示意图
   */
  definitionImageUrl?: string;

  /**
   * 所属类别
   */
  categoriesId?: string | number;

  /**
   * 长度
   */
  length?: number;

  /**
   * 宽度
   */
  width?: string | number;

  /**
   * 格式
   */
  type?: string;

  /**
   * 状态（0正常 1停用）
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
