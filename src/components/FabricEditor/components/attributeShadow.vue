<!--
 * @Author: 秦少卫
 * @Date: 2024-05-21 10:10:24
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:18:47
 * @Description: 阴影
-->

<template>
  <div v-if="isOne && !isOptions" class="box attr-item-box">
    <!-- <h3>阴影</h3> -->
    <Divider plain orientation="left"><h4>阴影</h4></Divider>
    <!-- 通用属性 -->
    <div>
      <Row :gutter="10">
        <Col flex="1">
          <div class="ivu-col__box">
            <span class="label">{{ $t('color') }}</span>
            <div class="content">
              <ColorPicker v-model="baseAttr.shadow.color" alpha @on-change="changeCommon" />
            </div>
          </div>
        </Col>
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.shadow.blur"
            :default-value="0"
            :append="$t('attributes.blur')"
            :min="0"
            @on-change="changeCommon"
          ></InputNumber>
        </Col>
      </Row>
      <div>
        <Row :gutter="10">
          <Col flex="1">
            <InputNumber
              v-model="baseAttr.shadow.offsetX"
              :default-value="0"
              :append="$t('attributes.offset_x')"
              @on-change="changeCommon"
            ></InputNumber>
          </Col>
          <Col flex="1">
            <InputNumber
              v-model="baseAttr.shadow.offsetY"
              :default-value="0"
              :append="$t('attributes.offset_y')"
              @on-change="changeCommon"
            ></InputNumber>
          </Col>
        </Row>
      </div>
    </div>
    <!-- <Divider plain></Divider> -->
  </div>
</template>

<script setup name="AttrBute" lang="ts">
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import InputNumber from '@/components/inputNumber';

const update = getCurrentInstance();
const { fabric, isOne, canvasEditor, isOptions } = useSelect();

// 属性值
const baseAttr = reactive({
  shadow: {}
});

// 属性获取
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.activeObject;
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    baseAttr.shadow = activeObject.get('shadow') || {};
  }
};

// 通用属性改变
const changeCommon = () => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    activeObject.set('shadow', new fabric.Shadow(baseAttr.shadow));
    canvasEditor.canvas.renderAll();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr();
  canvasEditor.on(SelectEvent.CANCEL, selectCancel);
  canvasEditor.on(SelectEvent.ONE, getObjectAttr);
  canvasEditor.canvas.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.CANCEL, selectCancel);
  canvasEditor.off(SelectEvent.ONE, getObjectAttr);
  canvasEditor.canvas.off('object:modified', getObjectAttr);
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
.box {
  width: 100%;
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
</style>
