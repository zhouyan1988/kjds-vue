<template>
  <Tooltip v-if="isOne" :content="$t('quick.copy')">
    <Button long icon="ios-copy" type="text" @click="clone"></Button>
  </Tooltip>
</template>

<script setup name="Clone" lang="ts">
import useSelect from '@/hooks/select';
import { debounce } from 'lodash-es';

const { canvasEditor, isOne } = useSelect();
const clone = debounce(function () {
  canvasEditor.clone();
}, 300);
</script>
