export interface TemplateImageCoordinateVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 模板id
   */
  templateId: string | number;

  /**
   * 第几张图
   */
  fewNumber: number;

  /**
   * 横向坐标
   */
  horizontalCoordinate: string;

  /**
   * 纵向坐标
   */
  verticalCoordinate: string;

}

export interface TemplateImageCoordinateForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 模板id
   */
  templateId?: string | number;

  /**
   * 第几张图
   */
  fewNumber?: number;

  /**
   * 横向坐标
   */
  horizontalCoordinate?: string;

  /**
   * 纵向坐标
   */
  verticalCoordinate?: string;

}

export interface TemplateImageCoordinateQuery extends PageQuery {

  /**
   * 模板id
   */
  templateId?: string | number;

  /**
   * 第几张图
   */
  fewNumber?: number;

  /**
   * 横向坐标
   */
  horizontalCoordinate?: string;

  /**
   * 纵向坐标
   */
  verticalCoordinate?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



