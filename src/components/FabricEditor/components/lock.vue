<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:20:59
 * @Description: 锁定元素
-->

<template>
  <Tooltip v-if="isOne" :content="$t('quick.lock')">
    <Button v-if="isLock" long icon="md-lock" type="text" @click="doLock(false)"></Button>
    <Button v-else long icon="md-unlock" type="text" @click="doLock(true)"></Button>
  </Tooltip>
</template>

<script setup name="Lock" lang="ts">
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import { onBeforeUnmount, onMounted } from 'vue';

const { canvasEditor, isOne } = useSelect();
const isLock = ref(false);
const doLock = (isLock) => {
  isLock ? canvasEditor.lock() : canvasEditor.unLock();
};

const handleSelected = (items) => {
  isLock.value = !items[0].selectable;
};

onMounted(() => {
  canvasEditor.on(SelectEvent.ONE, handleSelected);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.ONE, handleSelected);
});
</script>

<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
