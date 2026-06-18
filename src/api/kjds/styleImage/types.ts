export interface StyleImageVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 风格id
   */
  styleId: string | number;

  /**
   * 图片地址
   */
  imageUrl: string;

}

export interface StyleImageForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 风格id
   */
  styleId?: string | number;

  /**
   * 图片地址
   */
  imageUrl?: string;

}

export interface StyleImageQuery extends PageQuery {

  /**
   * 风格id
   */
  styleId?: string | number;

  /**
   * 图片地址
   */
  imageUrl?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



