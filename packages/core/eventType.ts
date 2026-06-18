/*
 * @Author: 秦少卫
 * @Date: 2024-04-10 14:00:05
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-04-10 14:01:39
 * @Description: 事件类型
 */
// 选择模式
export enum SelectMode {
  /**
   * 无选择
   */
  EMPTY = '',
  /**
   * 单选
   */
  ONE = 'one',
  /**
   * 多选
   */
  MULTI = 'multiple'
}

// 选择事件（用于广播）
export enum SelectEvent {
  /**
   * 单选
   */
  ONE = 'selectOne',
  /**
   * 多选
   */
  MULTI = 'selectMultiple',
  /**
   * 取消选择
   */
  CANCEL = 'selectCancel'
}

export default { SelectMode, SelectEvent };
