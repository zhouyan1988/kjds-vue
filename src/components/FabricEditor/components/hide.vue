<!--
 * @Author: wuchenguang1998
 * @Date: 2024-05-13 22:34:03
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:20:20
 * @Description: 隐藏或显示元素
-->

<template>
  <Tooltip v-if="isOne" :content="$t('quick.hide')">
    <Button v-if="isHide" long icon="md-eye-off" type="text" @click="doHide(false)"></Button>
    <Button v-else long icon="md-eye" type="text" @click="doHide(true)"></Button>
  </Tooltip>
</template>

<script setup name="Hide" lang="ts">
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import { onBeforeUnmount, onMounted } from 'vue';

const { isOne, canvasEditor } = useSelect();
const isHide = ref(false);

const doHide = (hide) => {
  // 修改visible属性
  const activeObject = canvasEditor.activeObject;
  activeObject.set('visible', !hide);
  canvasEditor.canvas.requestRenderAll();
  isHide.value = hide;
};

const handleSelected = () => {
  const activeObject = canvasEditor.activeObject;
  isHide.value = !activeObject.visible;
};

onMounted(() => {
  canvasEditor.on(SelectEvent.ONE, handleSelected);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.ONE, handleSelected);
});
</script>
