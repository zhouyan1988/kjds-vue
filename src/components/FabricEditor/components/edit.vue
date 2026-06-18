<script setup lang="ts">
import useSelect from '@/hooks/select';
import { EditorTypeEnum } from '@/utils/editor';
const { isMatchType, canvasEditor } = useSelect([EditorTypeEnum.Polygon]);
import { Message } from 'view-ui-plus';
const onEditPolygon = () => {
  const obj = canvasEditor.fabricCanvas?.getActiveObject();
  if (obj && obj.type === EditorTypeEnum.Polygon) {
    canvasEditor.activeEdit();
  } else {
    Message.warning('请检查选择polygon');
  }
};
</script>

<template>
  <Tooltip v-if="isMatchType" :content="$t('quick.editPoly')">
    <Button long icon="md-brush" type="text" @click="onEditPolygon"></Button>
  </Tooltip>
</template>

<style scoped lang="less"></style>
