<!--
 - linkageText 启用文本联动
 -->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
import { EditorTypeEnum, FabricObjectVO, OptArresVO, OptionsDisplayMode } from '@/utils/editor';
import { uniqBy } from 'lodash-es';
import { v4 as uuid } from 'uuid';

const { SelectEvent } = EventType;

const update = getCurrentInstance();
const { fabric, selectType, canvasEditor, isOne, isGroup, isImage, isOptions } = useSelect();
const conditionTempId = ref(uuid());

// 属性值
const baseAttr = reactive<Partial<FabricObjectVO>>({
  linkageText: {
    enable: false,
    textId: ''
  }
});

const lists = ref<FabricObjectVO[]>([]);

// 属性获取
const getObjectAttr = (e) => {
  conditionTempId.value = uuid();
  getOptionsList();
  const activeObject: FabricObjectVO = canvasEditor.fabricCanvas.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    const con = activeObject.get('linkageText');
    if (con) {
      baseAttr.linkageText = activeObject.get('linkageText');
    } else {
      baseAttr.linkageText = {
        enable: false,
        textId: ''
      };
      changeCommon('linkageText', baseAttr.linkageText);
    }
  }
};

// 获取选项图层列表
const getOptionsList = () => {
  const objects: FabricObjectVO[] = canvasEditor.fabricCanvas?.getObjects() || [];
  const activeObject: FabricObjectVO = canvasEditor.fabricCanvas.getActiveObject();
  // 创建新的数组并进行处理
  const processedList = [...objects]
    .filter((item) => {
      return (item?.type === EditorTypeEnum.IText || item?.type === EditorTypeEnum.TextBox) && item?.id !== activeObject?.id;
    })
    .reverse();

  const uniqueList = uniqBy(processedList, 'id');

  // 更新响应式变量
  lists.value = uniqueList as unknown as FabricObjectVO[];
};

// 通用属性改变
const changeCommon = (key: keyof FabricObjectVO, value: any) => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    // @ts-expect-error
    activeObject.set(key, value);
    canvasEditor.fabricCanvas.renderAll();
  }
};

const changeCondition = () => {
  changeCommon('linkageText', baseAttr.linkageText);
};

const onSwitchChange = () => {
  changeCondition();
};

const changeOption = () => {
  changeCondition();
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  getObjectAttr(null);
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
  <div v-if="isOne && !isGroup && !isImage && !isOptions" class="box attr-item-box">
    <Divider plain orientation="left"><h4>文本联动</h4></Divider>
    <div>
      <div class="hd-wrap">
        <div class="hd">
          <span>启用文本联动</span>
        </div>

        <iSwitch v-model="baseAttr.linkageText.enable" size="large" class="switch" @on-change="onSwitchChange">
          <template #open>
            <span>开启</span>
          </template>
          <template #close>
            <span>关闭</span>
          </template>
        </iSwitch>
      </div>

      <template v-if="baseAttr.linkageText.enable">
        <Form ref="formDynamicColor" :model="baseAttr.linkageText" style="width: 277px" label-position="top">
          <FormItem label="关联文本">
            <Select v-model="baseAttr.linkageText.textId" @on-change="changeOption">
              <Option v-for="litem in lists" :key="litem.id" :value="litem.id">
                {{ litem.text || litem.lLabel || litem.id }}
              </Option>
            </Select>
          </FormItem>
        </Form>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
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

.l-rules-item {
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 10px;
}
</style>
