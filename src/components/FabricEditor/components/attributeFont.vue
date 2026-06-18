<!--
 * @Author: 秦少卫
 * @Date: 2024-05-21 10:35:12
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:32:41
 * @Description: 字体属性
-->

<template>
  <div v-if="isOne && isMatchType" class="box attr-item-box">
    <!-- <h3>字体属性</h3> -->
    <Divider plain orientation="left"><h4>字体属性</h4></Divider>
    <div>
      <!-- <Divider plain orientation="left">{{ $t('attributes.font') }}</Divider> -->
      <div class="flex-view">
        <div class="flex-item">
          <div class="left font-selector">
            <Select v-model="baseAttr.fontFamily" @on-change="changeFontFamily">
              <Option v-for="item in fontsList" :key="`font-${item.name}`" :value="item.name">
                <div class="font-item" :style="`background-image:url('${item.img}');`">
                  {{ !item.img ? item : '' }}
                  <!-- 解决无法选中问题 -->
                  <span style="display: none">{{ item.name }}</span>
                </div>
              </Option>
            </Select>
          </div>
          <div class="right">
            <InputNumber v-model="baseAttr.fontSize" append="字号" :min="1" @on-change="(value) => changeCommon('fontSize', value)"></InputNumber>
          </div>
        </div>
      </div>

      <div class="flex-view">
        <div class="flex-item">
          <RadioGroup v-model="baseAttr.textAlign" class="button-group" type="button" @on-change="(value) => changeCommon('textAlign', value)">
            <Radio v-for="(item, i) in textAlignList" :key="item" :label="item">
              <span v-dompurify-html="textAlignListSvg[i]"></span>
            </Radio>
          </RadioGroup>
        </div>
      </div>

      <div class="flex-view">
        <div class="flex-item">
          <ButtonGroup class="button-group">
            <Button @click="changeFontWeight('fontWeight', baseAttr.fontWeight)">
              <fontWeight :fill="baseAttr.fontWeight === 'bold' ? '#305ef4' : '#666'" width="14" height="14"></fontWeight>
            </Button>
            <Button @click="changeFontStyle('fontStyle', baseAttr.fontStyle)">
              <fontStyle :fill="baseAttr.fontStyle === 'italic' ? '#305ef4' : '#666'" width="14" height="14"></fontStyle>
            </Button>
            <Button @click="changeLineThrough('linethrough', baseAttr.linethrough)">
              <linethrough :fill="baseAttr.linethrough ? '#305ef4' : '#666'" width="14" height="14"></linethrough>
            </Button>
            <Button @click="changeUnderline('underline', baseAttr.underline)">
              <underline :fill="baseAttr.underline ? '#305ef4' : '#666'" width="14" height="14"></underline>
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <Row :gutter="12">
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.lineHeight"
            :step="0.1"
            :append="$t('attributes.line_height')"
            @on-change="(value) => changeCommon('lineHeight', value)"
          ></InputNumber>
        </Col>
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.charSpacing"
            :append="$t('attributes.char_spacing')"
            @on-change="(value) => changeCommon('charSpacing', value)"
          ></InputNumber>
        </Col>
      </Row>

      <div class="flex-view">
        <div class="flex-item">
          <span class="label">{{ $t('background') }}</span>
          <div class="content">
            <ColorPicker v-model="baseAttr.textBackgroundColor" alpha @on-change="(value) => changeCommon('textBackgroundColor', value)" />
          </div>
        </div>
      </div>
    </div>
    <!-- <Divider plain></Divider> -->
  </div>
</template>

<script setup name="AttrBute" lang="ts">
import { ref, getCurrentInstance } from 'vue';
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import { Button, ButtonGroup, Col, Divider, Option, Radio, RadioGroup, Row, Spin } from 'view-ui-plus';
import InputNumber from '@/components/inputNumber';
import fontWeight from '@/assets/icon/attribute/fontWeight.svg';
import fontStyle from '@/assets/icon/attribute/fontStyle.svg';
import linethrough from '@/assets/icon/attribute/linethrough.svg';
import underline from '@/assets/icon/attribute/underline.svg';

import textAlignLeft from '@/assets/icon/attribute/textAlignLeft.svg?raw';
import textAlignRight from '@/assets/icon/attribute/textAlignRight.svg?raw';
import textAlignCenter from '@/assets/icon/attribute/textAlignCenter.svg?raw';
import textAlignJustitfy from '@/assets/icon/attribute/textAlignJustitfy.svg?raw';
import { EditorTypeEnum } from '@/utils/editor';

const update = getCurrentInstance();

// 文字元素
const { canvasEditor, isMatchType, isOne } = useSelect([EditorTypeEnum.IText, EditorTypeEnum.TextBox, EditorTypeEnum.Text]);

// 属性值
const baseAttr = reactive({
  fontSize: 0,
  fontFamily: '',
  fontFamilyUrl: '',
  lineHeight: 0,
  charSpacing: 0,
  fontWeight: '',
  textBackgroundColor: '#fff',
  textAlign: '',
  fontStyle: '',
  underline: false,
  linethrough: false,
  overline: false
});

const fontsList = ref([]);
canvasEditor.getFontList().then((list) => {
  fontsList.value = list;
});

// 字体对齐方式
const textAlignList = ['left', 'center', 'right', 'justify'];
// 对齐图标
const textAlignListSvg = [textAlignLeft, textAlignCenter, textAlignRight, textAlignJustitfy];

// 属性获取
const getObjectAttr = (e: any = null) => {
  const activeObject = canvasEditor.activeObject;
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && isMatchType) {
    baseAttr.fontSize = (activeObject as any).get('fontSize');
    baseAttr.fontFamily = (activeObject as any).get('fontFamily');
    baseAttr.fontFamilyUrl = (activeObject as any).get('fontFamilyUrl');
    baseAttr.lineHeight = (activeObject as any).get('lineHeight');
    baseAttr.textAlign = (activeObject as any).get('textAlign');
    baseAttr.underline = (activeObject as any).get('underline');
    baseAttr.linethrough = (activeObject as any).get('linethrough');
    baseAttr.charSpacing = (activeObject as any).get('charSpacing');
    baseAttr.overline = (activeObject as any).get('overline');
    baseAttr.fontStyle = (activeObject as any).get('fontStyle');
    baseAttr.textBackgroundColor = (activeObject as any).get('textBackgroundColor');
    baseAttr.fontWeight = (activeObject as any).get('fontWeight');
  }
};

// 通用属性改变
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    activeObject && activeObject.set(key, value);
    canvasEditor.fabricCanvas.renderAll();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

const changeFontFamily = async (fontName) => {
  if (!fontName) return;
  const fileurl = fontsList.value.find((item) => item.name === fontName)?.file;
  const activeObject = canvasEditor.firstActiveObject;
  activeObject && (activeObject as any).set('fontFamilyUrl', fileurl);
  Spin.show();
  canvasEditor.loadFont(fontName).finally(() => Spin.hide());
};
const changeFontWeight = (key, value) => {
  const nValue = value === 'normal' ? 'bold' : 'normal';
  baseAttr.fontWeight = nValue;
  const activeObject = canvasEditor.firstActiveObject;
  activeObject && activeObject.set(key, nValue);
  canvasEditor.fabricCanvas.renderAll();
};

// 斜体
const changeFontStyle = (key, value) => {
  const nValue = value === 'normal' ? 'italic' : 'normal';
  baseAttr.fontStyle = nValue;
  const activeObject = canvasEditor.firstActiveObject;
  activeObject && activeObject.set(key, nValue);
  canvasEditor.fabricCanvas.renderAll();
};

// 中划
const changeLineThrough = (key, value) => {
  const nValue = value === false;
  baseAttr.linethrough = nValue;
  const activeObject = canvasEditor.firstActiveObject;
  activeObject && activeObject.set(key, nValue);
  canvasEditor.fabricCanvas.renderAll();
};

// 下划
const changeUnderline = (key, value) => {
  const nValue = value === false;
  baseAttr.underline = nValue;
  const activeObject = canvasEditor.firstActiveObject;
  activeObject && activeObject.set(key, nValue);
  canvasEditor.fabricCanvas.renderAll();
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

:deep(.ivu-color-picker) {
  display: block;
}
.ivu-row {
  margin-bottom: 8px;
  .ivu-col {
    position: inherit;
    &__box {
      display: flex;
      align-items: center;
      background: #f8f8f8;
      border-radius: 4px;
      gap: 8px;
    }
  }

  .label {
    padding-left: 8px;
  }
  .content {
    flex: 1;
    :deep(.--input),
    :deep(.ivu-select-selection) {
      background-color: transparent;
      border: none !important;
      box-shadow: none !important;
    }
  }
}
.font-selector {
  :deep(.ivu-select-item) {
    padding: 1px 4px;
  }

  .font-item {
    height: 40px;
    width: 280px;
    background-size: auto 28px;
    background-repeat: no-repeat;
  }
}

.flex-view {
  width: 100%;
  margin-bottom: 5px;
  padding: 5px;
  display: inline-flex;
  justify-content: space-between;
  border-radius: 5px;
  background: #f6f7f9;
}
.flex-item {
  display: inline-flex;
  flex: 1;
  .label {
    width: 32px;
    height: 32px;
    line-height: 32px;
    display: inline-block;
    font-size: 14px;
    // color: #333333;
  }
  .content {
    flex: 1;
    // width: 60px;
  }
  .slider-box {
    width: calc(100% - 50px);
    margin-left: 10px;
  }
  .left {
    flex: 1;
  }
  .right {
    flex: 1;
    margin-left: 10px;
    :deep(.ivu-input-number) {
      display: block;
      width: 100%;
    }
  }
  :deep(.ivu-slider-wrap) {
    margin: 13px 0;
  }
  :deep(.ivu-radio-group-button) {
    display: flex;
    flex: 1;
    width: 100%;
    & .ivu-radio-wrapper {
      // width: 48px;
      flex: 1;
      line-height: 40px;
      text-align: center;
      svg {
        vertical-align: baseline;
      }
    }
  }

  :deep(.ivu-btn-group) {
    display: flex;
    flex: 1;
    .ivu-btn {
      flex: 1;
    }
  }

  :deep(.ivu-btn-group-large) {
    & > .ivu-btn {
      font-size: 24px;
      flex: 1;
    }
  }

  :deep(.ivu-radio-group-button) {
    &.ivu-radio-group-large .ivu-radio-wrapper {
      font-size: 24px;
    }
  }
}
</style>
