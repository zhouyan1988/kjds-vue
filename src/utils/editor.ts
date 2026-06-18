import { fabric } from 'fabric';
import { CodeType } from '@kuaitu/core/plugin/BarCodePlugin';
import { Point } from 'fabric/fabric-impl';

/**
 * 需要保留的路径属性
 */
export const PATH_ATTRIBUTES: string[] = [
  'path', // 路径
  'pathData', // 路径数据（SVG路径字符串）
  'closePath', // 路径是否闭合
  'pathType', // 路径类型
  'pathAlign', // 文字在路径上的对齐方式
  'pathSide', // 文字在路径的哪一侧
  'pathStartOffset', // 文字在路径上的起始偏移量
  'curveHeight', // 曲线高度（curve类型）
  'waveHeight', // 波浪高度（wave类型）
  'waveCount' // 波浪数量（wave类型）
];

/**
 * 需要保留的个性化属性
 */
export const PERSONALIZED_ATTRIBUTES: string[] = [
  'personalized', // 是否开启图片&文字个性化
  'userupload', // 是否用户上传
  'personalizedImgs' // 个性化图片列表
];

/**
 * 需要保留的标签属性
 */
export const TAG_ATTRIBUTES: string[] = [
  'lLabel', // 标签文本
  'lHelpText', // 帮助文本
  'lPlaceholder' // 占位符文本
];

/**
 * 需要保留的选项属性
 */
export const OPTIONS_ATTRIBUTES: string[] = [
  'optDefVal', // 选项默认值
  'optDisplayMode', // 选项显示模式
  'optArres', // 可选项数组
  'optToggle' // 切换选项
];

/**
 * 需要保留的文本联动属性
 */
export const LINK_ATTRIBUTES: string[] = [
  'conditionColor', // 颜色联动配置
  'linkageText', // 文本联动配置
  'fontFamily', // 字体族
  'fontFamilyUrl' // 字体文件URL
];
/**
 * 需要保留的裁剪属性
 */
export const CLIP_ATTRIBUTES: string[] = [
  /**
   * 缩放比例
   */
  'canvasScaleW', // 画布宽度缩放比例
  'canvasScaleH', // 画布高度缩放比例
  /**
   * 裁剪中心点
   */
  'clipPathLeft', // 裁剪X轴偏移量
  'clipPathTop' // 裁剪Y轴偏移量
];

/**
 * 需要保留的位置信息属性
 */
export const POSITION_ATTRIBUTES: string[] = [
  'opacity', // 透明度
  'angle', // 旋转角度
  'left', // 水平位置坐标
  'top', // 垂直位置坐标
  'width', // 宽度
  'height', // 高度
  'rx', // 水平圆角半径
  'ry', // 垂直圆角半径
  'fixedWidthAndHeight' // 固定宽高比例
];
/**
 * 需要保留的原始数据
 */
export const ORIGINAL_ATTRIBUTES: string[] = [
  'originalFontSize', // 原始字体大小
  'originalWidth', // 原始宽度
  'originalHeight', // 原始高度
  'originalTop', // 原始高度
  'originalLeft' // 原始高度
];

/**
 * 需要保留的额外属性
 */
export const EXTRA_ATTRIBUTES: string[] = [
  'id', // 唯一标识
  'gradientAngle', // 渐变角度
  'selectable', // 对象是否可选择
  'hasControls', // 是否显示控制控件
  'linkData', // 关联数据
  'editable', // 是否可编辑
  'extensionType', // 扩展类型
  'extension', // 扩展属性
  'verticalAlign', // 垂直对齐方式
  'roundValue', // 圆角值
  'text', // 文本
  'src', // 图片地址
  'isLock', // 是否锁定
  'fontSize', // 字体大小
  'condition', // 条件配置
  /**
   * 原始数据
   */
  ...ORIGINAL_ATTRIBUTES,
  /**
   * 路径
   */
  ...PATH_ATTRIBUTES,
  /**
   * 个性化
   */
  ...PERSONALIZED_ATTRIBUTES,
  /**
   * 标签
   */
  ...TAG_ATTRIBUTES,
  /**
   * 选项
   */
  ...OPTIONS_ATTRIBUTES,
  /**
   * 文字联动
   */
  ...LINK_ATTRIBUTES,
  /**
   * 裁剪属性
   */
  ...CLIP_ATTRIBUTES,
  /**
   * 位置信息
   */
  ...POSITION_ATTRIBUTES
];

/**
 * fabric.Object 属性 + 自定义属性
 */
export interface FabricObjectVO extends fabric.Object {
  /**
   * 唯一标识
   */
  id?: string;

  /**
   * 渐变角度
   */
  gradientAngle?: string;

  /**
   * 对象是否可选择
   */
  selectable?: boolean | undefined;

  /**
   * 是否显示控制控件
   */
  hasControls?: boolean | undefined;

  /**
   * 关联数据
   */
  linkData?: string[] | number[];

  /**
   * 是否可编辑
   */
  editable?: boolean;

  /**
   * 扩展类型
   */
  extensionType?: string;

  /**
   * 扩展属性（可选）
   */
  extension: ExtensionInterface;

  /**
   * 垂直对齐方式
   */
  verticalAlign?: 'null' | 'bottom' | 'top';

  /**
   * 圆角值
   */
  roundValue?: number;

  /**
   * 路径
   */
  path?: null | FabricPath;

  /**
   * 文本
   */
  text?: string;

  /**
   * 图片地址
   */
  src?: string;

  /**
   * 是否锁定
   */
  isLock?: boolean;

  /**
   * 是否用户上传
   */
  userupload?: boolean;

  /**
   * 是否开启图片个性化
   */
  personalized?: boolean;

  /**
   * 个性化图片列表
   */
  personalizedImgs?: (string | PersonalizedImgVo)[];

  /**
   * 标签文本
   */
  lLabel?: string;

  /**
   * 帮助文本
   */
  lHelpText?: string;

  /**
   * 占位符文本
   */
  lPlaceholder?: string;

  /**
   * 选项默认值
   */
  optDefVal?: string;

  /**
   * 选项显示模式
   */
  optDisplayMode?: OptionsDisplayMode | '';

  /**
   * 可选项数组
   */
  optArres?: OptArresVO[];

  /**
   * 切换选项
   */
  optToggle?: OptToggleVO;

  /**
   * 条件配置
   */
  condition?: ConditionVO;

  /**
   * 颜色联动配置
   */
  conditionColor?: ConditionColorVO;

  /**
   * 文本联动配置
   */
  linkageText?: LinkageTextVO;

  /**
   * 字体族
   */
  fontFamily?: string;

  /**
   * 字体文件URL
   */
  fontFamilyUrl?: string;

  /**
   * 画布宽度缩放比例
   */
  canvasScaleW?: number;

  /**
   * 画布高度缩放比例
   */
  canvasScaleH?: number;

  /**
   * 裁剪X轴偏移量
   */
  clipPathLeft?: number;

  /**
   * 裁剪Y轴偏移量
   */
  clipPathTop?: number;

  /**
   * 固定宽高
   */
  fixedWidthAndHeight?: boolean;

  /**
   * 字体大小
   */
  fontSize?: number;

  /**
   * 原始字体大小
   */
  originalFontSize?: number;

  /**
   * 原始宽度
   */
  originalWidth?: number;

  /**
   * 原始高度
   */
  originalHeight?: number;

  /**
   * 原始TOP
   */
  originalTop?: number;

  /**
   * 原始LEFT
   */
  originalLeft?: number;

  /**
   * 路径数据（SVG路径字符串）
   */
  pathData?: string;

  /**
   * 路径是否闭合
   */
  closePath?: string;

  /**
   * 路径类型
   */
  pathType?: 'line' | 'curve' | 'circle' | 'wave' | 'custom';

  /**
   * 文字在路径上的对齐方式
   */
  pathAlign?: 'left' | 'center' | 'right';

  /**
   * 文字在路径的哪一侧
   */
  pathSide?: 'left' | 'right';

  /**
   * 文字在路径上的起始偏移量
   */
  pathStartOffset?: number;

  /**
   * 曲线高度（curve类型）
   */
  curveHeight?: number;

  /**
   * 波浪高度（wave类型）
   */
  waveHeight?: number;

  /**
   * 波浪数量（wave类型）
   */
  waveCount?: number;

  /**
   * 行高
   */
  lineHeight: number;
}

/**
 * 使用 fabric.Object
 */
export interface FabricObjectUseVO extends FabricObjectVO {
  personalizedImgs?: PersonalizedImgVo[];
}

// 定义一个类型，包含 FabricObjectVO 中允许设置的键
export type FabricObjectType = keyof FabricObjectVO;

/**
 * 类型枚举
 */
export enum EditorTypeEnum {
  /**
   * 线
   */
  Line = 'line',
  /**
   * 小箭头
   */
  Arrow = 'arrow',
  /**
   * 细尾箭头
   */
  ThinTailArrow = 'thinTailArrow',
  /**
   * 路径文本
   */
  PathText = 'pathText',
  /**
   * 自由绘制
   */
  FreeDraw = 'freeDraw',
  /**
   * 文本
   */
  Text = 'text',
  /**
   * 文本
   */
  IText = 'i-text',
  /**
   * 文本框
   */
  TextBox = 'textbox',
  /**
   * 图片
   */
  Image = 'image',
  /**
   * 选项
   */
  Options = 'options',
  /**
   * 组合
   */
  Group = 'group',
  /**
   * 矩形
   */
  Rect = 'rect',
  /**
   * 圆形
   */
  Circle = 'circle',
  /**
   * 三角形
   */
  Triangle = 'triangle',
  /**
   * 多边形
   */
  Polygon = 'polygon',
  /**
   * 路径
   */
  Path = 'path',
  /**
   * 辅助线
   */
  GuideLine = 'GuideLine',
  /**
   * 选择
   */
  ActiveSelection = 'activeSelection'
}

/**
 * 剪切路径类型
 */
export enum ClipPathTypeEnum {
  /**
   * 多边形
   */
  Polygon = 'polygon',
  /**
   * 矩形
   */
  Rect = 'rect',
  /**
   * 圆形
   */
  Circle = 'circle',
  Ellipse = 'ellipse',
  /**
   * 三角形
   */
  Triangle = 'triangle'
}

/**
 * 编辑器JSON数据接口
 */
export interface EditorJsonVO {
  /**
   * 版本号
   */
  version: string;

  /**
   * 裁剪路径
   */
  clipPath: FabricObjectVO;

  /**
   * 对象列表
   */
  objects: FabricObjectVO[];
}

/**
 * 编辑器模板接口
 */
export interface EditorTemplVo {
  /**
   * 模板名称
   */
  name: string;

  /**
   * 模板JSON数据
   */
  json: EditorJsonVO;
}

/**
 * 图片信息接口
 */
export interface ImageInfo {
  /**
   * 图片源地址
   */
  src: string;

  /**
   * 图片宽度
   */
  width: number;

  /**
   * 图片高度
   */
  height: number;
}

export interface OptArresVO {
  /**
   * 标签
   */
  label: string;
  /**
   * 值
   */
  value: string;
  /**
   * 图片
   */
  image: string;
  /**
   * 颜色
   */
  color: string;
  /**
   * 是否设置附加价格
   */
  setPrice?: boolean;
  /**
   * 附加价格
   */
  price?: number;
}

/**
 * 切换选项配置接口
 */
export interface OptToggleVO {
  /**
   * 选项标签
   */
  label: string;

  /**
   * 是否启用
   */
  enable: boolean;
}

/**
 * 条件动作类型
 */
export enum ConditionActionEnum {
  /**
   * 显示
   */
  Show = 'show',
  /**
   * 隐藏
   */
  Hide = 'hide'
}

/**
 * 条件动作类型，表示在条件满足时可以执行的动作
 * 可以是显示或隐藏操作
 */
export type ConditionAction = ConditionActionEnum.Show | ConditionActionEnum.Hide;

/**
 * 条件匹配枚举
 */
export enum ConditionMatchEnum {
  /**
   * 全部条件都满足
   */
  All = 'all',
  /**
   * 任意条件满足
   */
  One = 'one',
  /**
   * 无条件满足（即所有条件都不满足）
   */
  None = 'none'
}

/**
 * 条件匹配类型，表示多个条件之间的匹配逻辑
 * 可以是全部匹配、任意匹配或都不匹配
 */
export type ConditionMatch = ConditionMatchEnum.All | ConditionMatchEnum.One | ConditionMatchEnum.None;

/**
 * 条件规则逻辑枚举
 */
export enum ConditionRulesLogicEnum {
  /**
   * 等于
   */
  EqualTo = 'equal_to',
  /**
   * 不等于
   */
  NotEqualTo = 'not_equal_to'
}

/**
 * 条件规则逻辑类型，表示条件判断的逻辑关系
 * 可以是等于或不等于
 */
export type ConditionRulesLogic = ConditionRulesLogicEnum.EqualTo | ConditionRulesLogicEnum.NotEqualTo;

/**
 * 条件规则接口
 */
export interface ConditionRulesVO {
  /**
   * 条件逻辑关系
   */
  logic: ConditionRulesLogic;

  /**
   * 关联的选项ID
   */
  option: string;

  /**
   * 关联的选项值
   */
  value: string;
}

/**
 * 条件配置接口
 */
export interface ConditionVO {
  /**
   * 是否启用条件功能
   */
  enable: boolean;

  /**
   * 是否修改颜色
   */
  enableColor?: boolean;

  /**
   * 条件规则列表
   */
  rules: ConditionRulesVO[];

  /**
   * 满足条件时执行的动作
   */
  action: ConditionAction;

  /**
   * 条件匹配逻辑
   */
  match: ConditionMatch;
}

/**
 * 颜色联动配置接口
 */
export interface ConditionColorVO {
  /**
   * 是否启用颜色联动功能
   */
  enable: boolean;

  /**
   * 关联的选项对象ID
   */
  option: string;
}

/**
 * 文本联动配置接口
 */
export interface LinkageTextVO {
  /**
   * 是否启用文本联动功能
   */
  enable: boolean;

  /**
   * 关联的文本对象ID
   */
  textId: string;
}

/**
 * 扩展属性接口，用于定义对象的额外属性
 */
export interface ExtensionInterface {
  /**
   * 值
   */
  value?: string;

  /**
   * 格式类型
   */
  format?: CodeType;

  /**
   * 文本内容
   */
  text?: string;

  /**
   * 文本对齐方式
   */
  textAlign?: string;

  /**
   * 文本位置
   */
  textPosition?: string;

  /**
   * 字体大小
   */
  fontSize?: number;

  /**
   * 背景颜色
   */
  background?: string;

  /**
   * 线条颜色
   */
  lineColor?: string;

  /**
   * 是否显示值
   */
  displayValue?: boolean;
}

/**
 * 选项显示模式
 */
export enum OptionsDisplayMode {
  /**
   * 下拉菜单
   */
  Dropdown = 'dropdown',
  /**
   * 按钮
   */
  Button = 'button',
  /**
   * 图片
   */
  Image = 'image',
  /**
   * 颜色
   */
  Color = 'color',
  /**
   * 开关
   */
  Toggle = 'toggle',
  /**
   * 图片+颜色
   */
  ImageColor = 'imageColor'
}

export interface ChangeTextConfigVo {
  /**
   * 限制行数
   */
  line: number;
}

/**
 * Path 数据结构
 */
export interface FabricPath {
  type: 'path';
  version: string;
  originX: 'left' | 'right' | 'center';
  originY: 'top' | 'bottom' | 'center';
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  strokeDashArray: number[] | null;
  strokeLineCap: 'butt' | 'round' | 'square';
  strokeDashOffset: number;
  strokeLineJoin: 'miter' | 'round' | 'bevel';
  strokeUniform: boolean;
  strokeMiterLimit: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
  shadow: string | null;
  visible: boolean;
  backgroundColor: string;
  fillRule: 'nonzero' | 'evenodd';
  paintFirst: 'fill' | 'stroke';
  globalCompositeOperation: string;
  skewX: number;
  skewY: number;

  /**
   * SVG Path 指令数组
   * e.g. ["M", 10, 20], ["Q", 30, 40, 50, 60]
   */
  path: string | Point[];
}

/**
 * 定制图片数据结构
 */
export interface PersonalizedImgVo {
  /**
   * 图片源
   */
  src: string;
  /**
   * 图片名称
   */
  name: string;
}

/**
 * 图像个性化 属性类型
 */
export interface ImgPersonalizedBaseAttr {
  index: number;
  src: string;
  userupload: boolean;
  personalized: boolean;
  personalizedImgs: (string | PersonalizedImgVo)[];
}
