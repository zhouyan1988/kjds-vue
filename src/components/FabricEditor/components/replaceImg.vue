<!--
 * @Author: 秦少卫
 * @Date: 2023-04-06 22:26:57
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:15:32
 * @Description: 图片替换
-->

<template>
  <div v-if="isOne && type === EditorTypeEnum.Image" class="attr-item-box">
    <div class="bg-item">
      <Button type="text" long @click="repleace">{{ $t('repleaceImg') }}</Button>
    </div>
  </div>
</template>

<script setup name="ReplaceImg" lang="ts">
import useSelect from '@/hooks/select';
import { Utils, EventType } from '@kuaitu/core';
const { SelectEvent } = EventType;
import { EditorTypeEnum } from '@/utils/editor';
const { getImgStr, selectFiles, insertImgFile } = Utils;

const update = getCurrentInstance();
// const canvasEditor = inject('canvasEditor');
const { canvasEditor, isOne } = useSelect();
const type = ref('');

// 替换图片
const repleace = async () => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject && activeObject.type === EditorTypeEnum.Image) {
    // 图片
    const [file] = await selectFiles({ accept: 'image/*', multiple: false });
    // 转字符串
    const fileStr = await getImgStr(file);
    // 字符串转El
    const imgEl = await insertImgFile(fileStr);
    const width = activeObject.get('width');
    const height = activeObject.get('height');
    const scaleX = activeObject.get('scaleX');
    const scaleY = activeObject.get('scaleY');
    activeObject.setSrc(imgEl.src, () => {
      activeObject.set('scaleX', (width * scaleX) / imgEl.width);
      activeObject.set('scaleY', (height * scaleY) / imgEl.height);
      canvasEditor.canvas.renderAll();
    });
    imgEl.remove();
  }
};

const init = () => {
  const activeObject = canvasEditor.firstActiveObject;
  if (activeObject) {
    type.value = activeObject.type;
    update?.proxy?.$forceUpdate();
  }
};

onMounted(() => {
  canvasEditor.on(SelectEvent.ONE, init);
});

onBeforeUnmount(() => {
  canvasEditor.off(SelectEvent.ONE, init);
});
</script>
<style lang="less" scoped>
.attr-item-box {
  margin-top: 8px;
}
</style>
