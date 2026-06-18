<template>
  <div v-if="isOne && isMatchType" class="box attr-item-box">
    <Divider plain orientation="left">
      <h4>字体个性化</h4>
    </Divider>
    <div class="hd-wrap">
      <div class="hd">
        <span>启用个性化</span>
      </div>

      <iSwitch v-model="baseAttr.personalized" size="large" class="switch" @on-change="onSwitchChange">
        <template #open>
          <span>开启</span>
        </template>
        <template #close>
          <span>关闭</span>
        </template>
      </iSwitch>
    </div>
  </div>
</template>

<script setup name="FontPersonalized" lang="ts">
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import { EditorTypeEnum } from '@/utils/editor';

const update = getCurrentInstance();
const { isOne, isMatchType, canvasEditor } = useSelect([EditorTypeEnum.IText, EditorTypeEnum.TextBox, EditorTypeEnum.Text]);

// 属性值
const baseAttr = reactive({
  personalized: false
});

// 属性获取
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.fabricCanvas?.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && isMatchType) {
    baseAttr.personalized = (activeObject as any).get('personalized') || false;
  }
};

// 通用属性改变
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.fabricCanvas?.getActiveObjects()[0];
  if (activeObject) {
    activeObject && activeObject.set(key, value);
    canvasEditor.fabricCanvas?.renderAll();
  }
};

const onSwitchChange = async (val: boolean) => {
  if (val) {
    changeCommon('personalized', true);
  } else {
    changeCommon('personalized', false);
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr(null);
  canvasEditor.on(SelectEvent.CANCEL, selectCancel);
  canvasEditor.on(SelectEvent.ONE, getObjectAttr);
  canvasEditor.fabricCanvas?.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.CANCEL, selectCancel);
  canvasEditor.off(SelectEvent.ONE, getObjectAttr);
  canvasEditor.fabricCanvas?.off('object:modified', getObjectAttr);
});
</script>

<style scoped lang="scss">
.hd-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .hd {
    flex: 1;
    & > span {
      margin-right: 5px;
    }
  }
}
</style>
