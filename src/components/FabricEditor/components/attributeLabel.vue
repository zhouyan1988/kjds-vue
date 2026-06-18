<script setup name="AttrButeLabel" lang="ts">
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;

const update = getCurrentInstance();
const { canvasEditor, isOne } = useSelect();
const baseAttr = reactive({
  lLabel: '',
  lHelpText: '',
  lPlaceholder: ''
});
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.activeObject;
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    baseAttr.lLabel = (activeObject as any).get('lLabel') || '';
    baseAttr.lHelpText = (activeObject as any).get('lHelpText') || '';
    baseAttr.lPlaceholder = (activeObject as any).get('lPlaceholder') || '';
  }
};
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    baseAttr[key] = value;
    activeObject.set(key, value);
    canvasEditor.fabricCanvas.renderAll();
  }
};
const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};
onMounted(() => {
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

<template>
  <div v-if="isOne" class="box attr-item-box">
    <Divider plain orientation="left"><h4>标签</h4></Divider>

    <Form :label-width="80" class="form-wrap">
      <FormItem :label="$t('attributes.lLabel')">
        <Input v-model="baseAttr.lLabel" size="small" @on-change="changeCommon('lLabel', baseAttr.lLabel)"></Input>
      </FormItem>
      <FormItem :label="$t('attributes.lHelpText')">
        <Input v-model="baseAttr.lHelpText" size="small" @on-change="changeCommon('lHelpText', baseAttr.lHelpText)"></Input>
      </FormItem>
      <FormItem :label="$t('attributes.lPlaceholder')">
        <Input v-model="baseAttr.lPlaceholder" size="small" @on-change="changeCommon('lPlaceholder', baseAttr.lPlaceholder)"></Input>
      </FormItem>
    </Form>
  </div>
</template>

<style scoped lang="less">
.color-bar {
  // width: 30px;
  height: 30px;
  cursor: pointer;
  border: 2px solid #f6f7f9;
}

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
</style>
