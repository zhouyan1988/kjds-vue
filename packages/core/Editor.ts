import EventEmitter from 'events';
import hotkeys from 'hotkeys-js';
import ContextMenu from './ContextMenu.js';
import ServersPlugin from './ServersPlugin';
import { AsyncSeriesHook } from 'tapable';
import type { IPluginMenu, IPluginClass, IPluginOption, IEditorHooksType, IPluginTempl } from '@kuaitu/core';
import Utils from './utils/utils';
import { FabricObjectVO } from '@/utils/editor';

/**
 * 编辑器配置接口
 */
export interface IEditorConfig {
  enableContextMenu?: boolean;
  enableHotkeys?: boolean;
  enableServersPlugin?: boolean;
}

/**
 * 插件注册信息
 */
export interface IPluginRegistration {
  plugin: IPluginTempl;
  instance: IPluginTempl;
  options?: IPluginOption;
}

/**
 * 图形编辑器核心类
 * 基于 Fabric.js 的可扩展编辑器，支持插件系统、生命周期钩子、快捷键和右键菜单
 */
class Editor extends EventEmitter {
  // 核心属性
  private canvas: fabric.Canvas | null = null;
  private contextMenu: ContextMenu | null = null;
  private isInitialized: boolean = false;

  // 插件相关
  private readonly pluginMap = new Map<string, IPluginTempl>();
  private readonly pluginRegistrations: IPluginRegistration[] = [];

  // 自定义扩展
  private readonly customEvents = new Set<string>();
  private readonly customApis = new Set<string>();

  // 生命周期钩子
  private readonly hooks: readonly IEditorHooksType[] = [
    'hookImportBefore',
    'hookImportAfter',
    'hookSaveBefore',
    'hookSaveAfter',
    'hookTransform'
  ] as const;

  public readonly hooksEntity: Record<string, AsyncSeriesHook<any, any>> = {};

  // 工具类
  public readonly Utils = Utils;

  constructor(private config: IEditorConfig = {}) {
    super();
    this._setDefaultConfig();
  }

  /**
   * 初始化编辑器
   */
  public init(canvas: fabric.Canvas): this {
    if (this.isInitialized) {
      console.warn('编辑器已经初始化');
      return this;
    }

    this.canvas = canvas;
    this._initializeComponents();
    this.isInitialized = true;

    this.emit('editor:initialized', { canvas, editor: this });
    return this;
  }

  /**
   * 获取 Fabric Canvas 实例
   */
  public get fabricCanvas(): fabric.Canvas {
    this._ensureInitialized();
    return this.canvas!;
  }

  /**
   * 获取当前激活对象
   */
  public get activeObject(): FabricObjectVO | null {
    return this.canvas?.getActiveObject() || null;
  }

  /**
   * 获取所有激活的对象
   */
  public get activeObjects(): FabricObjectVO[] {
    return this.canvas?.getActiveObjects() || [];
  }

  /**
   * 获取第一个激活的对象（常用于单选场景）
   */
  public get firstActiveObject(): FabricObjectVO | null {
    const activeObjects = this.activeObjects;
    return activeObjects.length > 0 ? activeObjects[0] : null;
  }

  /**
   * 注册插件
   * @param plugin 插件类
   * @param options 插件配置选项
   */
  public use(plugin: IPluginTempl, options?: IPluginOption): this {
    try {
      this._validatePlugin(plugin);

      if (!this.canvas) {
        // 如果 canvas 未初始化，先存储插件信息
        this.pluginRegistrations.push({ instance: undefined, plugin, options });
        return this;
      }

      const pluginInstance = this._createPluginInstance(plugin, options);
      this._registerPlugin(plugin.pluginName, pluginInstance);

      this.emit('plugin:registered', {
        pluginName: plugin.pluginName,
        instance: pluginInstance
      });
    } catch (error) {
      console.error(`注册插件${plugin.pluginname}失败:`, error);
      this.emit('plugin:error', { pluginName: plugin.pluginName, error });
      throw error;
    }

    return this;
  }

  /**
   * 获取插件实例
   */
  public getPlugin<T extends IPluginTempl = IPluginTempl>(name: string): T | undefined {
    return this.pluginMap.get(name) as T;
  }

  /**
   * 检查插件是否已注册
   */
  public hasPlugin(name: string): boolean {
    return this.pluginMap.has(name);
  }

  /**
   * 获取所有已注册的插件名称
   */
  public getPluginNames(): string[] {
    return Array.from(this.pluginMap.keys());
  }

  /**
   * 卸载插件
   */
  public unregisterPlugin(name: string): boolean {
    const plugin = this.pluginMap.get(name);
    if (!plugin) return false;

    // 清理插件相关资源
    this._cleanupPlugin(plugin);
    this.pluginMap.delete(name);

    this.emit('plugin:unregistered', { pluginName: name });
    return true;
  }

  /**
   * 销毁编辑器实例
   */
  public destroy(): void {
    if (!this.isInitialized) return;

    try {
      // 清理所有插件
      for (const [name, plugin] of this.pluginMap) {
        this._cleanupPlugin(plugin);
      }
      this.pluginMap.clear();

      // 清理快捷键
      this._cleanupHotkeys();

      // 清理右键菜单
      if (this.contextMenu) {
        this.contextMenu.uninstall();
        this.contextMenu = null;
      }

      // 清理画布事件监听
      this._cleanupCanvasEvents();

      // 重置状态
      this._resetState();

      this.emit('editor:destroyed');
      this.removeAllListeners();
    } catch (error) {
      console.error('编辑器销毁时发生错误:', error);
    }
  }

  /**
   * 获取编辑器状态
   */
  public getState() {
    return {
      isInitialized: this.isInitialized,
      hasCanvas: !!this.canvas,
      pluginCount: this.pluginMap.size,
      registeredPlugins: this.getPluginNames(),
      customEventsCount: this.customEvents.size,
      customApisCount: this.customApis.size
    };
  }

  /**
   * 重写 off 方法，解决 listener 为 undefined 的问题
   */
  public off(eventName: string, listener?: any): this {
    return listener ? super.off(eventName, listener) : this;
  }

  // ===================
  // 私有方法
  // ===================

  private _setDefaultConfig(): void {
    const defaultConfig: Required<IEditorConfig> = {
      enableContextMenu: true,
      enableHotkeys: true,
      enableServersPlugin: true
    };

    this.config = { ...defaultConfig, ...this.config };
  }

  private _initializeComponents(): void {
    this._initActionHooks();

    if (this.config.enableContextMenu) {
      this._initContextMenu();
      this._bindContextMenu();
    }

    if (this.config.enableServersPlugin) {
      this._initServersPlugin();
    }

    // 注册延迟的插件
    this._registerPendingPlugins();
  }

  private _registerPendingPlugins(): void {
    if (this.pluginRegistrations.length === 0) return;

    const registrations = [...this.pluginRegistrations];
    this.pluginRegistrations.length = 0; // 清空待注册列表

    registrations.forEach(({ plugin, options }) => {
      try {
        this.use(plugin, options);
      } catch (error) {
        console.error(`注册挂起的插件失败 ${plugin.pluginName}:`, error);
      }
    });
  }

  private _ensureInitialized(): void {
    if (!this.isInitialized || !this.canvas) {
      throw new Error('编辑器未初始化。先调用init()。');
    }
  }

  private _validatePlugin(plugin: IPluginTempl): void {
    if (!plugin || typeof plugin !== 'function') {
      throw new Error('插件必须是有效的构造函数');
    }

    const { pluginName, events = [], apis = [] } = plugin;

    if (!pluginName || typeof pluginName !== 'string') {
      throw new Error('插件必须有一个有效的pluginName');
    }

    if (this.pluginMap.has(pluginName)) {
      throw new Error(`插件 ${pluginName} 已经注册`);
    }

    // 检查事件名冲突
    const conflictingEvent = events.find((eventName) => this.customEvents.has(eventName));
    if (conflictingEvent) {
      throw new Error(`插件 ${pluginName} 中的事件 ${conflictingEvent} 与现有事件冲突`);
    }

    // 检查 API 名冲突
    const conflictingApi = apis.find((apiName) => this.customApis.has(apiName));
    if (conflictingApi) {
      throw new Error(`插件“${pluginName}”中的API“${conflictingApi}”与现有API冲突`);
    }
  }

  private _createPluginInstance(plugin: IPluginTempl, options?: IPluginOption): IPluginTempl {
    const PluginClass = plugin as IPluginClass;
    const instance = new PluginClass(this.canvas!, this, options || {});
    instance.pluginName = plugin.pluginName;
    return instance;
  }

  private _registerPlugin(name: string, instance: IPluginTempl): void {
    this.pluginMap.set(name, instance);
    this._saveCustomAttributes(instance.constructor as IPluginTempl);
    this._bindingHooks(instance);

    if (this.config.enableHotkeys) {
      this._bindingHotkeys(instance);
    }

    this._bindingApis(instance);
  }

  private _cleanupPlugin(plugin: IPluginTempl): void {
    try {
      // 调用插件的清理方法
      if (typeof plugin.destroy === 'function') {
        plugin.destroy();
      }

      // 清理快捷键
      if (plugin.hotkeys) {
        plugin.hotkeys.forEach((keyName) => {
          hotkeys.unbind(keyName);
        });
      }

      // 清理自定义属性（如果需要的话）
      // 注意：这里可能需要更复杂的清理逻辑
    } catch (error) {
      console.error(`清理插件错误 ${plugin.pluginName}:`, error);
    }
  }

  private _bindingHooks(plugin: IPluginTempl): void {
    this.hooks.forEach((hookName) => {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        // @ts-expect-error: 忽略类型检查
        this.hooksEntity[hookName].tapPromise(`${plugin.pluginName}_${hookName}`, (...args: any[]) => {
          try {
            const result = hook.apply(plugin, args);
            return result instanceof Promise ? result : Promise.resolve(result);
          } catch (error) {
            console.error(`插件${plugin.pluginname}中的 Hook ${hookName}错误:`, error);
            return Promise.reject(error);
          }
        });
      }
    });
  }

  private _bindingHotkeys(plugin: IPluginTempl): void {
    if (!plugin.hotkeys || !Array.isArray(plugin.hotkeys)) return;

    plugin.hotkeys.forEach((keyName: string) => {
      try {
        hotkeys(keyName, { keyup: true }, (e) => {
          if (plugin.hotkeyEvent && typeof plugin.hotkeyEvent === 'function') {
            plugin.hotkeyEvent(keyName, e);
          }
        });
      } catch (error) {
        console.error(`为插件${plugin.pluginname}绑定热键${keyName}失败:`, error);
      }
    });
  }

  private _saveCustomAttributes(pluginConstructor: IPluginTempl): void {
    const { events = [], apis = [] } = pluginConstructor;

    events.forEach((eventName) => this.customEvents.add(eventName));
    apis.forEach((apiName) => this.customApis.add(apiName));
  }

  private _bindingApis(pluginInstance: IPluginTempl): void {
    const pluginConstructor = pluginInstance.constructor as any;
    const { apis = [] } = pluginConstructor;

    apis.forEach((apiName: string) => {
      if (typeof pluginInstance[apiName] === 'function') {
        // 使用箭头函数保持 this 上下文
        (this as any)[apiName] = (...args: any[]) => {
          try {
            // eslint-disable-next-line prefer-spread
            return pluginInstance[apiName].apply(pluginInstance, args);
          } catch (error) {
            console.error(`${pluginInstance.pluginName}插件中的API ${apiName}错误:`, error);
            throw error;
          }
        };
      }
    });
  }

  private _bindContextMenu(): void {
    if (!this.canvas || !this.config.enableContextMenu) return;

    this.canvas.on('mouse:down', (opt) => {
      if (opt.button === 3) {
        // 右键
        this._handleContextMenu(opt);
      }
    });
  }

  private _handleContextMenu(opt: { e: MouseEvent }): void {
    try {
      const menuItems: IPluginMenu[] = [];

      for (const [, plugin] of this.pluginMap) {
        if (typeof plugin.contextMenu === 'function') {
          const pluginMenu = plugin.contextMenu();
          if (Array.isArray(pluginMenu) && pluginMenu.length > 0) {
            menuItems.push(...pluginMenu);
          }
        }
      }

      this._renderMenu(opt, menuItems);
    } catch (error) {
      console.error('错误处理上下文菜单:', error);
    }
  }

  private _renderMenu(opt: { e: MouseEvent }, menu: IPluginMenu[]): void {
    if (menu.length === 0 || !this.contextMenu) return;

    try {
      this.contextMenu.hideAll();
      this.contextMenu.setData(menu);
      this.contextMenu.show(opt.e.clientX, opt.e.clientY);
    } catch (error) {
      console.error('渲染上下文菜单出错:', error);
    }
  }

  private _initActionHooks(): void {
    this.hooks.forEach((hookName) => {
      this.hooksEntity[hookName] = new AsyncSeriesHook(['data']);
    });
  }

  private _initContextMenu(): void {
    if (!this.canvas) return;

    try {
      this.contextMenu = new ContextMenu(this.canvas.wrapperEl, []);
      this.contextMenu.install();
    } catch (error) {
      console.error('初始化上下文菜单出错:', error);
    }
  }

  private _initServersPlugin(): void {
    try {
      this.use(ServersPlugin);
    } catch (error) {
      console.error('初始化serverplugin错误:', error);
    }
  }

  private _cleanupHotkeys(): void {
    try {
      hotkeys.unbind(); // 解绑所有快捷键
    } catch (error) {
      console.error('清理热键时出错:', error);
    }
  }

  private _cleanupCanvasEvents(): void {
    if (!this.canvas) return;

    try {
      // 清理画布事件监听器（如果有的话）
      // this.canvas.off('mouse:down');
      // 注意：具体的事件清理需要根据实际绑定的事件来处理
    } catch (error) {
      console.error('清理canvas事件时出错:', error);
    }
  }

  private _resetState(): void {
    this.canvas = null;
    this.contextMenu = null;
    this.isInitialized = false;
    this.pluginMap.clear();
    this.customEvents.clear();
    this.customApis.clear();
    this.pluginRegistrations.length = 0;

    // 重置钩子实体
    Object.keys(this.hooksEntity).forEach((key) => {
      delete this.hooksEntity[key];
    });
  }
}

export default Editor;
