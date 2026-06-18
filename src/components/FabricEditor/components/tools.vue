<template>
  <div>
    <!-- 图片 -->
    <Divider plain orientation="left">{{ $t('common_img') }}</Divider>
    <div class="left_tool_box">
      <!-- 添加图片 -->
      <span :draggable="true" title="添加图片" @click="() => insertTypeHand('insertImg')" @dragend="insertTypeHand('insertImg')">
        <svg-icon icon-class="toolsImg" />
      </span>
      <!-- 导入PSD -->
      <span :draggable="true" title="导入PSD" @click="() => insertTypeHand('insertPsd')" @dragend="insertTypeHand('insertPsd')">
        <svg-icon icon-class="toolsPsd" />
      </span>
      <!-- 导入SVG -->
      <span :draggable="true" title="导入SVG" @click="() => insertTypeHand('insertSvg')" @dragend="insertTypeHand('insertSvg')">
        <svg-icon icon-class="toolsSvg" />
      </span>
      <!-- 添加选项 -->
      <span :draggable="true" title="添加选项" @click="() => insertTypeHand('insertOptions')" @dragend="insertTypeHand('insertOptions')">
        <svg-icon icon-class="toolsOptions" />
      </span>
      <!-- 添加日历 -->
      <!--<span :draggable="true" title="添加日历" @click="() => insertTypeHand('insertCalendar')" @dragend="insertTypeHand('insertCalendar')">-->
      <!--  <svg-icon icon-class="toolsCalendar" />-->
      <!--</span>-->
      <span :draggable="true" title="添加Spotify" @click="canvasEditor.addQrCode">
        <svg-icon icon-class="toolsSpotify" />
      </span>
      <span :draggable="true" title="添加Youtube" @click="canvasEditor.addQrCode">
        <svg-icon icon-class="toolsYoutube" />
      </span>
      <!--<span :draggable="true" title="添加拼图" @click="() => insertTypeHand('insertJigsaw_puzzle')" @dragend="insertTypeHand('insertJigsaw_puzzle')">-->
      <!--  <svg-icon icon-class="toolsBuilds" />-->
      <!--</span>-->
    </div>
    <!-- 元素 -->
    <Divider plain orientation="left">{{ $t('common_elements') }}</Divider>
    <div class="left_tool_box">
      <span :draggable="true" @click="() => addText(undefined)" @dragend="addText">
        <svg-icon icon-class="text" />
      </span>
      <span :draggable="true" @click="() => addTextBox(undefined)" @dragend="addTextBox">
        <svg-icon icon-class="textBig" />
      </span>
      <span :draggable="true" @click="() => addRect(undefined)" @dragend="addRect">
        <svg-icon icon-class="toolsFang" />
      </span>
      <span :draggable="true" @click="() => addCircle(undefined)" @dragend="addCircle">
        <svg-icon icon-class="toolsYuan" />
      </span>
      <span :draggable="true" @click="() => addTriangle(undefined)" @dragend="addTriangle">
        <svg-icon icon-class="toolsSanJiao" />
      </span>
      <!-- 多边形按钮 -->
      <span :draggable="true" @click="() => addPolygon(undefined)" @dragend="addPolygon">
        <svg-icon icon-class="toolsDuoBian" />
      </span>
    </div>
    <Divider plain orientation="left">{{ $t('draw_elements') }}</Divider>
    <div class="left_tool_box">
      <span :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.Line && 'bg'" @click="drawingLineModeSwitch(EditorTypeEnum.Line)">
        <svg-icon icon-class="toolsLine" />
      </span>
      <span :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.Arrow && 'bg'" @click="drawingLineModeSwitch(EditorTypeEnum.Arrow)">
        <svg-icon icon-class="toolsArrow" />
      </span>
      <span
        :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.ThinTailArrow && 'bg'"
        @click="drawingLineModeSwitch(EditorTypeEnum.ThinTailArrow)"
      >
        <svg-icon icon-class="toolsThinTailArrow" />
      </span>
      <span :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.Polygon && 'bg'" @click="drawPolygon">
        <svg-icon icon-class="toolsDuoBian" />
      </span>
      <!-- 隐藏功能入口（路径文本） -->
      <span :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.PathText && 'bg'" @click="drawPathText">
        <Icon type="logo-tumblr" :size="22" />
      </span>
      <span :class="state.isDrawingLineMode && state.lineType === EditorTypeEnum.FreeDraw && 'bg'" @click="freeDraw">
        <Icon type="md-brush" :size="22" />
      </span>
    </div>
    <Divider plain orientation="left">{{ $t('code_img') }}</Divider>
    <div class="left_tool_box">
      <span @click="canvasEditor.addQrCode">
        <svg-icon icon-class="toolsQrCode" />
      </span>
      <span @click="canvasEditor.addBarcode">
        <svg-icon icon-class="toolsBarCode" />
      </span>
    </div>

    <!-- 插入字符串svg元素 -->
    <Modal
      v-model="state.showModal"
      :title="$t('insertFile.modal_tittle')"
      @on-ok="insertTypeHand('insertSvgStr')"
      @on-cancel="state.showModal = false"
    >
      <Input v-model="state.svgStr" show-word-limit type="textarea" :placeholder="$t('insertFile.insert_SVGStr_placeholder')" />
    </Modal>
  </div>
</template>

<script setup name="Tools" lang="ts">
import { reactive } from 'vue';
import { getPolygonVertices } from '@/utils/math';
import useSelect from '@/hooks/select';
// import useCalculate from '@/hooks/useCalculate';
// const { getCanvasBound, isOutsideCanvas } = useCalculate();
import { Divider, Icon, Input, Modal, Spin } from 'view-ui-plus';
import { useI18n } from 'vue-i18n';
import { Utils } from '@kuaitu/core';
import { v4 as uuid } from 'uuid';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { EditorTypeEnum, FabricObjectVO } from '@/utils/editor';
import { fabric } from 'fabric';

const { getImgStr, selectFiles } = Utils;

// 默认属性
const defaultPosition = { shadow: '', fontFamily: 'arial' };

const { t } = useI18n();
const { canvasEditor } = useSelect();
const state: {
  showModal: boolean;
  svgStr: string;
  isDrawingLineMode: boolean;
  lineType: string | EditorTypeEnum;
} = reactive({
  showModal: false,
  svgStr: '',
  isDrawingLineMode: false,
  lineType: ''
});

const addText = (event?: DragEvent) => {
  cancelDraw();
  const text = new fabric.IText(t('everything_is_fine'), {
    ...defaultPosition,
    fontSize: 16,
    fill: '#000000FF'
  });

  canvasEditor.addBaseType(text as FabricObjectVO, { center: true, event });
};

const addTextBox = (event?: DragEvent) => {
  cancelDraw();
  const text = new fabric.Textbox(t('everything_goes_well'), {
    ...defaultPosition,
    splitByGrapheme: true,
    width: 70,
    fontSize: 16,
    fill: '#000000FF'
  });

  canvasEditor.addBaseType(text as FabricObjectVO, { center: true, event });
};

const addTriangle = (event?: DragEvent) => {
  cancelDraw();
  const triangle = new fabric.Triangle({
    ...defaultPosition,
    // width: 400,
    // height: 400,
    width: 80,
    height: 80,
    fill: '#92706BFF',
    name: '三角形'
  });
  canvasEditor.addBaseType(triangle as FabricObjectVO, { center: true, event });
};

const addPolygon = (event?: DragEvent) => {
  cancelDraw();
  const polygon = new fabric.Polygon(getPolygonVertices(5, 40), {
    ...defaultPosition,
    fill: '#CCCCCCFF',
    name: '多边形'
  });
  polygon.set({
    // 创建完设置宽高，不然宽高会变成自动的值
    // width: 400,
    // height: 400,
    width: 80,
    height: 80,
    // 关闭偏移
    pathOffset: new fabric.Point(0, 0)
  });
  canvasEditor.addBaseType(polygon as FabricObjectVO, { center: true, event });
};

const addCircle = (event?: DragEvent) => {
  cancelDraw();
  const circle = new fabric.Circle({
    ...defaultPosition,
    radius: 40,
    width: 80,
    height: 80,
    fill: '#57606BFF',
    // id: uuid(),
    name: '圆形'
  });
  canvasEditor.addBaseType(circle as FabricObjectVO, { center: true, event });
};

const addRect = (event?: DragEvent) => {
  cancelDraw();
  const rect = new fabric.Rect({
    ...defaultPosition,
    fill: '#F57274FF',
    // width: 400,
    // height: 400,
    width: 80,
    height: 80,
    name: '矩形'
  });

  canvasEditor.addBaseType(rect as FabricObjectVO, { center: true, event });
};
const drawPolygon = () => {
  //绘制多边形
  const onEnd = () => {
    state.lineType = '';
    state.isDrawingLineMode = false;
    ensureObjectSelEvStatus(!state.isDrawingLineMode, !state.isDrawingLineMode);
  };
  if (state.lineType !== EditorTypeEnum.Polygon) {
    endConflictTools();
    endDrawingLineMode();
    state.lineType = EditorTypeEnum.Polygon;
    state.isDrawingLineMode = true;
    canvasEditor.beginDrawPolygon(onEnd);
    canvasEditor.endDraw();
    ensureObjectSelEvStatus(!state.isDrawingLineMode, !state.isDrawingLineMode);
  } else {
    canvasEditor.discardPolygon();
  }
};

const drawPathText = () => {
  if (state.lineType === EditorTypeEnum.PathText) {
    state.lineType = '';
    state.isDrawingLineMode = false;
    canvasEditor.endTextPathDraw();
  } else {
    endConflictTools();
    endDrawingLineMode();
    state.lineType = EditorTypeEnum.PathText;
    state.isDrawingLineMode = true;
    canvasEditor.startTextPathDraw();
  }
};

const freeDraw = () => {
  if (state.lineType === EditorTypeEnum.FreeDraw) {
    canvasEditor.endDraw();
    state.lineType = '';
    state.isDrawingLineMode = false;
  } else {
    endConflictTools();
    endDrawingLineMode();
    state.lineType = EditorTypeEnum.FreeDraw;
    state.isDrawingLineMode = true;
    canvasEditor.startDraw({ width: 20 });
  }
};

const endConflictTools = () => {
  canvasEditor.discardPolygon();
  canvasEditor.endDraw();
  canvasEditor.endTextPathDraw();
};
const endDrawingLineMode = () => {
  state.isDrawingLineMode = false;
  state.lineType = '';
  canvasEditor.setMode(state.isDrawingLineMode);
  canvasEditor.setLineType(state.lineType);
};
const drawingLineModeSwitch = (type) => {
  if ([EditorTypeEnum.Polygon, EditorTypeEnum.FreeDraw, EditorTypeEnum.PathText].includes(state.lineType as EditorTypeEnum)) {
    endConflictTools();
  }
  if (state.lineType === type) {
    state.isDrawingLineMode = false;
    state.lineType = '';
  } else {
    state.isDrawingLineMode = true;
    state.lineType = type;
  }
  canvasEditor.setMode(state.isDrawingLineMode);
  canvasEditor.setLineType(type);
  // this.canvasEditor.setMode(this.isDrawingLineMode);
  // this.canvasEditor.setArrow(isArrow);
  ensureObjectSelEvStatus(!state.isDrawingLineMode, !state.isDrawingLineMode);
};

const HANDLEMAP = {
  // 插入图片
  insertImg: function () {
    selectFiles({ accept: 'image/*', multiple: true }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        getImgStr(item).then((file) => {
          insertImgFile(file);
        });
      });
    });
  },
  // 插入psd
  insertPsd: function () {
    canvasEditor.insertPSD().finally(Spin.hide);
  },
  // 插入Svg
  insertSvg: function () {
    selectFiles({ accept: '.svg', multiple: true }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        getImgStr(item).then((file) => {
          insertSvgFile(file);
        });
      });
    });
  },
  // 插入SVG元素
  insertSvgStrModal: function () {
    state.svgStr = '';
    state.showModal = true;
  },
  // 插入字符串元素
  insertSvgStr: function () {
    fabric.loadSVGFromString(state.svgStr, (objects, options) => {
      const item = fabric.util.groupSVGElements(objects, {
        ...options,
        name: 'defaultSVG'
      });
      canvasEditor.addBaseType(item as FabricObjectVO, { scale: true });
    });
  },
  // todo 添加日历
  insertCalendar: function () {
    drawCalendar(2024, 1);
  },
  // 添加选项
  insertOptions: function () {
    cancelDraw();
    const text = new fabric.IText('', {
      type: EditorTypeEnum.Options,
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      opacity: 0,
      // 禁止选中
      selectable: false,
      // 隐藏控制条
      hasControls: false
    });

    canvasEditor.addBaseType(text as FabricObjectVO, { center: true, lLabel: '选项' });
  },
  // 添加拼图
  insertJigsaw_puzzle: function () {}
};
// 定义一个简单的日历函数
const drawCalendar = (year, month) => {
  const date = new Date();
  date.setFullYear(year, month - 1, 1); // 设置为当月的第一天
  const numDays = new Date(year, month, 0).getDate(); // 获取当月天数
  const startDay = date.getDay(); // 获取当月第一天是周几

  // 绘制日历的网格
  for (let i = 0; i < 7; i++) {
    const text = new fabric.Text(`周${'日一二三四五六'[i]}`, {
      left: 10 + i * 50,
      top: 10,
      fontSize: 12
    });
    canvasEditor.addBaseType(text as FabricObjectVO, { center: true });
  }

  for (let i = 0; i < numDays; i++) {
    const text = new fabric.Text((i + 1).toString(), {
      left: 10 + ((i + startDay) % 7) * 50,
      top: 30 + Math.floor((i + startDay) / 7) * 50,
      fontSize: 12
    });
    canvasEditor.addBaseType(text as FabricObjectVO, { center: true });
  }
};
const insertTypeHand = (type) => {
  const cb = HANDLEMAP[type];
  cb && typeof cb === 'function' && cb();
};
// 插入图片文件
function insertImgFile(file) {
  if (!file) throw new Error('file is undefined');
  const imgEl = document.createElement('img');
  imgEl.src = file;
  // 插入页面
  document.body.appendChild(imgEl);
  imgEl.onload = async () => {
    const imgItem = await canvasEditor.createImgByElement(imgEl);
    canvasEditor.addBaseType(imgItem as FabricObjectVO, {
      src: imgEl.src,
      userupload: false,
      personalized: false,
      scale: true
    });
    imgEl.remove();
  };
}

// 插入文件元素
function insertSvgFile(svgFile) {
  if (!svgFile) throw new Error('file is undefined');
  fabric.loadSVGFromURL(svgFile, (objects, options) => {
    const item = fabric.util.groupSVGElements(objects, {
      ...options,
      name: 'defaultSVG',
      id: uuid()
    });
    canvasEditor.addBaseType(item as FabricObjectVO, {
      scale: true
    });
  });
}

const ensureObjectSelEvStatus = (evented, selectable) => {
  canvasEditor.fabricCanvas.forEachObject((obj) => {
    if (obj?.id !== 'workspace') {
      obj.selectable = selectable;
      obj.evented = evented;
    }
  });
};

// 退出绘制状态
const cancelDraw = () => {
  if (!state.isDrawingLineMode) return;
  state.isDrawingLineMode = false;
  state.lineType = '';
  canvasEditor.setMode(false);
  endConflictTools();
  ensureObjectSelEvStatus(true, true);
};

onDeactivated(() => {
  cancelDraw();
});
</script>

<style scoped lang="less"></style>
