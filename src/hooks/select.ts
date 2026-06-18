/*
 * @Author: 秦少卫
 * @Date: 2024-10-07 17:12:29
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-10-07 17:14:13
 * @Description: 通用属性hook
 */

import { inject, computed, reactive, onMounted, onBeforeMount } from 'vue';

import { EventType, IEditor } from '@kuaitu/core';
const { SelectMode, SelectEvent } = EventType;

import { useI18n } from 'vue-i18n';
import { EditorTypeEnum } from '@/utils/editor';

export default function useSelect(matchType?: Array<string>) {
  const { t } = useI18n();
  const fabric = inject('fabric');
  const canvasEditor = inject('canvasEditor') as IEditor;

  const state = reactive({
    mSelectMode: SelectMode.EMPTY,
    mSelectOneType: '',
    mSelectId: '' as any, // 选择id
    mSelectIds: [] as any, // 选择id
    mSelectActive: [] as fabric.Object[]
  });
  const selectOne = (arr: fabric.Object[]) => {
    state.mSelectMode = SelectMode.ONE;
    const [item] = arr;
    if (item) {
      state.mSelectActive = [item];
      state.mSelectId = item?.id;
      state.mSelectOneType = item.type;
      state.mSelectIds = [item?.id];
    }
    callBack();
  };

  const selectMulti = (arr: fabric.Object[]) => {
    state.mSelectMode = SelectMode.MULTI;
    state.mSelectId = '';
    state.mSelectIds = arr.map((item) => item?.id);
    callBack();
  };

  const selectCancel = () => {
    state.mSelectId = '';
    state.mSelectIds = [];
    state.mSelectMode = SelectMode.EMPTY;
    state.mSelectOneType = '';
    callBack();
  };

  let callBack = () => {
    //
  };
  const getObjectAttr = (cb: any) => {
    callBack = cb;
  };
  onMounted(() => {
    canvasEditor.on(SelectEvent.ONE, selectOne);
    canvasEditor.on(SelectEvent.MULTI, selectMulti);
    canvasEditor.on(SelectEvent.CANCEL, selectCancel);
  });

  onBeforeMount(() => {
    canvasEditor.off(SelectEvent.ONE, selectOne);
    canvasEditor.off(SelectEvent.MULTI, selectMulti);
    canvasEditor.off(SelectEvent.CANCEL, selectCancel);
  });

  let isMatchType;
  if (matchType) {
    isMatchType = computed(() => matchType.includes(state.mSelectOneType));
  }
  // 单选
  const isOne = computed(() => state.mSelectMode === SelectMode.ONE);
  // 多选
  const isMultiple = computed(() => state.mSelectMode === SelectMode.MULTI);
  // 文本
  const isIText = computed(() => state.mSelectMode === SelectMode.ONE && state.mSelectOneType === EditorTypeEnum.IText);
  // 文本框
  const isTextBox = computed(() => state.mSelectMode === SelectMode.ONE && state.mSelectOneType === EditorTypeEnum.TextBox);
  // 组
  const isGroup = computed(() => state.mSelectMode === SelectMode.ONE && state.mSelectOneType === EditorTypeEnum.Group);
  // 图片
  const isImage = computed(() => state.mSelectMode === SelectMode.ONE && state.mSelectOneType === EditorTypeEnum.Image);
  // 选项
  const isOptions = computed(() => state.mSelectMode === SelectMode.ONE && state.mSelectOneType === EditorTypeEnum.Options);
  // 选择
  const isSelect = computed(() => state.mSelectMode);

  const selectType = computed(() => state.mSelectOneType);

  const matchTypeHander = (types: string[]) => {
    return computed(() => types.includes(state.mSelectOneType));
  };
  return {
    fabric,
    canvasEditor,
    mixinState: state,
    selectType,
    isSelect,
    isGroup,
    isImage,
    isOptions,
    isOne,
    isMultiple,
    isIText,
    isTextBox,
    isMatchType,
    matchTypeHander,
    getObjectAttr,
    t
  };
}
