import Editor from './Editor';
import { SelectMode } from './eventType';
import { EditorTypeEnum } from '../../src/utils/editor';
import FontFaceObserver from 'fontfaceobserver';
type IEditor = Editor;

class FontPlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  // 插件名称
  static pluginName = 'FontPlugin';
  // 挂载API名称
  static apis = ['downFontByJSON'];
  // 发布事件
  static events = ['textEvent1', 'textEvent2'];
  // 快捷键 keyCode hotkeys-js
  public hotkeys: string[] = ['backspace', 'space'];
  // 私有属性
  repoSrc: string;

  constructor(canvas: fabric.Canvas, editor: IEditor, config: { repoSrc: string }) {
    // 初始化
    this.canvas = canvas;
    this.editor = editor;
    // 可插入外部配置
    this.repoSrc = config.repoSrc;
  }

  // 钩子函数 hookImportAfter/hookSaveBefore/hookSaveAfter Promise
  hookImportBefore(json: string) {
    return this.downFontByJSON(json);
  }

  // 挂载API方法
  downFontByJSON(str: string) {
    console.log(str);
  }

  // 私有方法 + 发布事件
  _createFontCSS() {
    const params = [];
    this.editor.emit('textEvent1', params);
  }

  flip(type: 'X' | 'Y') {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(`flip${type}`, !activeObject[`flip${type}`]).setCoords();
      this.canvas.requestRenderAll();
    }
  }

  // 右键菜单
  contextMenu() {
    const selectedMode = this.editor.getSelectMode();
    if (selectedMode === SelectMode.ONE) {
      return [
        null, // 分割线
        {
          text: '翻转',
          hotkey: '❯',
          subitems: [
            {
              text: '水平翻转',
              hotkey: '|',
              onclick: () => this.flip('X')
            },
            {
              text: '垂直翻转',
              hotkey: '-',
              onclick: () => this.flip('Y')
            }
          ]
        }
      ];
    }
  }

  del() {
    const { canvas } = this;
    const activeObject = canvas.getActiveObjects();
    if (activeObject) {
      activeObject.map((item) => canvas.remove(item));
      canvas.requestRenderAll();
      canvas.discardActiveObject();
    }
  }

  // 快捷键
  hotkeyEvent(eventName: string, { type }: KeyboardEvent) {
    // eventName：hotkeys中的属性 backspace、space
    // type：keyUp keyDown
    // code：hotkeys-js Code
    if (eventName === 'backspace' && type === 'keydown') {
      this.del();
    }
  }

  // 注销
  destroy() {
    console.log('pluginDestroy');
  }
}

export default FontPlugin;
