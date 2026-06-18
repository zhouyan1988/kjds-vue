<!--
 * @Author: 秦少卫
 * @Date: 2024-05-21 09:23:36
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:33:41
 * @Description: file content
-->
<template>
  <div v-if="isOne && !isOptions" class="box attr-item-box">
    <!-- <h3>位置信息</h3> -->
    <Divider plain orientation="left"><h4>位置信息</h4></Divider>
    <!-- 通用属性 -->
    <div v-show="isMatchType">
      <Row :gutter="10">
        <Col flex="1">
          <InputNumber v-model="baseAttr.left" :append="$t('attributes.left')" @on-change="(value) => changeCommon('left', value)"></InputNumber>
        </Col>
        <Col flex="1">
          <InputNumber v-model="baseAttr.top" :append="$t('attributes.top')" @on-change="(value) => changeCommon('top', value)"></InputNumber>
        </Col>
      </Row>
      <Row :gutter="10">
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.width"
            :min="0"
            :append="$t('attributes.width')"
            @on-change="(value) => changeCommon('width', value)"
          ></InputNumber>
        </Col>
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.height"
            :min="0"
            :append="$t('attributes.height')"
            @on-change="(value) => changeCommon('height', value)"
          ></InputNumber>
        </Col>
      </Row>
      <div v-show="isIText || isTextBox" class="l-switch">
        <div class="hd">
          <span>固定宽高</span>
          <p>超出区域文本自动缩放</p>
        </div>

        <iSwitch v-model="baseAttr.fixedWidthAndHeight" size="large" @on-change="onSwitchChange">
          <template #open>
            <span>开启</span>
          </template>
          <template #close>
            <span>关闭</span>
          </template>
        </iSwitch>
      </div>
      <Form :label-width="40" class="form-wrap">
        <FormItem :label="$t('attributes.angle')">
          <Slider v-model="baseAttr.angle" :max="360" @on-input="(value) => changeCommon('angle', value)"></Slider>
        </FormItem>
        <FormItem :label="$t('attributes.opacity')">
          <Slider v-model="baseAttr.opacity" @on-input="(value) => changeCommon('opacity', value)"></Slider>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script setup name="AttrBute" lang="ts">
import { reactive, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import InputNumber from '@/components/inputNumber';
import { EditorTypeEnum } from '@/utils/editor';
import { Col, Divider, Form, FormItem, Row, Slider } from 'view-ui-plus';

const update = getCurrentInstance();

// 可修改的元素
const baseType = [
  EditorTypeEnum.Text,
  EditorTypeEnum.IText,
  EditorTypeEnum.TextBox,
  EditorTypeEnum.Rect,
  EditorTypeEnum.Circle,
  EditorTypeEnum.Triangle,
  EditorTypeEnum.Polygon,
  EditorTypeEnum.Image,
  EditorTypeEnum.Group,
  EditorTypeEnum.Line,
  EditorTypeEnum.Arrow,
  EditorTypeEnum.ThinTailArrow
];
const { isMatchType, canvasEditor, isOne, isOptions, isIText, isTextBox } = useSelect(baseType);

// 属性值
const baseAttr = reactive({
  opacity: 0,
  angle: 0,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  rx: 0,
  ry: 0,
  // 固定宽高
  fixedWidthAndHeight: false
});

// 属性获取
const getObjectAttr = (e?: any) => {
  const activeObject = canvasEditor.activeObject;
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && isMatchType) {
    baseAttr.opacity = activeObject.get('opacity') * 100;
    baseAttr.left = activeObject.get('left');
    baseAttr.top = activeObject.get('top');
    baseAttr.angle = activeObject.get('angle') || 0;
    baseAttr.width = activeObject.get('width') * (activeObject.get('scaleX') || 1);
    baseAttr.height = activeObject.get('height') * (activeObject.get('scaleY') || 1);
    baseAttr.fixedWidthAndHeight = activeObject.get('fixedWidthAndHeight') || false;
  }
};

// 通用属性改变
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    // 透明度特殊转换
    if (key === 'opacity') {
      activeObject && activeObject.set(key, value / 100);
      canvasEditor.fabricCanvas.renderAll();
      return;
    }
    // 旋转角度适配
    if (key === 'angle') {
      activeObject.rotate(value);
      canvasEditor.fabricCanvas.renderAll();
      return;
    }
    // 宽度和高度特殊处理
    if (key === 'width' || key === 'height') {
      const originalWidth = activeObject.get('width');
      const originalHeight = activeObject.get('height');
      const currentScaleX = activeObject.get('scaleX') || 1;
      const currentScaleY = activeObject.get('scaleY') || 1;

      if (key === 'width') {
        const newScaleX = value / originalWidth;
        activeObject.set('scaleX', newScaleX);
      } else {
        const newScaleY = value / originalHeight;
        activeObject.set('scaleY', newScaleY);
      }

      activeObject.setCoords();
      canvasEditor.fabricCanvas.renderAll();
      return;
    }
    activeObject && activeObject.set(key, value);
    canvasEditor.fabricCanvas.renderAll();
  }
};

const onSwitchChange = (value) => {
  changeCommon('fixedWidthAndHeight', value);
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr();
  canvasEditor.on(SelectEvent.CANCEL, selectCancel);
  canvasEditor.on(SelectEvent.ONE, getObjectAttr);
  canvasEditor.fabricCanvas.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.CANCEL, selectCancel);
  canvasEditor.off(SelectEvent.ONE, getObjectAttr);
  canvasEditor.fabricCanvas.off('object:modified', getObjectAttr);
});
</script>

<style scoped lang="less">
:deep(.ivu-input-number) {
  display: block;
  width: 100%;
}

.ivu-form-item {
  background: #f6f7f9;
  border-radius: 5px;
  padding: 0 5px;
  margin-bottom: 10px;
}

.ivu-row {
  margin-bottom: 10px;
}

.l-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  background-color: #f8f8f9;
  padding: 5px 7px;
  border-radius: 4px;

  .hd {
    flex: 1;
    & > span {
      margin-right: 5px;
    }
  }
}
</style>
