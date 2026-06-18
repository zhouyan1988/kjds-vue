<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 爱宇阳
 * @LastEditTime: 2025-08-26 13:14:27
 * @Description: 图层面板 - 使用 @vueuse/integrations useSortable 实现拖拽排序
-->

<template>
  <div class="box">
    <template v-if="list.length">
      <Divider plain orientation="left">{{ $t('layers') }}</Divider>
      <div class="layer-box">
        <div ref="sortableContainer" class="sortable-container">
          <div
            v-for="(item, index) in list"
            :key="item.id + index"
            :data-id="item.id"
            :class="['layer-item', { active: isSelect(item) }]"
            @click="select(item.id)"
          >
            <Row class="ellipsis">
              <Col span="2" class="drag-handle">
                <Icon type="md-menu" class="drag-icon" />
              </Col>
              <Col span="18">
                <Tooltip :content="item.name || item.text || item.type" placement="left">
                  <span v-dompurify-html="iconType(item.type)" :class="isSelect(item) && 'active'"></span> | {{ textType(item.type, item) }}
                </Tooltip>
              </Col>
              <Col span="4">
                <Button long :icon="item.isLock ? 'md-lock' : 'md-unlock'" type="text" @click.stop="doLock(item)"></Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <!-- 层级调整按钮 -->
      <div class="btn-box">
        <ButtonGroup v-show="isOne" size="small">
          <Button @click="up"><span v-dompurify-html="btnIconType('up')"></span></Button>
          <Button @click="down"><span v-dompurify-html="btnIconType('down')"></span></Button>
          <Button @click="upTop"><span v-dompurify-html="btnIconType('upTop')"></span></Button>
          <Button @click="downTop"><span v-dompurify-html="btnIconType('downTop')"></span></Button>
        </ButtonGroup>
      </div>
    </template>
    <template v-else>
      <p class="empty-text">暂无图层</p>
    </template>
  </div>
</template>

<script setup name="Layer" lang="ts">
import { ref } from 'vue';
import { isNumber, uniqBy } from 'lodash-es';
import { useSortable } from '@vueuse/integrations/useSortable';
import type { SortableOptions } from 'sortablejs';
import useSelect from '@/hooks/select';
import optionsIcon from '@/assets/icons/svg/toolsOptions.svg?raw';
import groupIcon from '@/assets/icon/layer/group.svg?raw';
import textbox from '@/assets/icon/layer/textbox.svg?raw';
import iText from '@/assets/icon/layer/iText.svg?raw';
import imageIcon from '@/assets/icon/layer/image.svg?raw';
import rectIcon from '@/assets/icon/layer/rect.svg?raw';
import circleIcon from '@/assets/icon/layer/circle.svg?raw';
import triangleIcon from '@/assets/icon/layer/triangle.svg?raw';
import polygonIcon from '@/assets/icon/layer/polygon.svg?raw';

import upIcon from '@/assets/icon/layer/up.svg?raw';
import downIcon from '@/assets/icon/layer/down.svg?raw';
import upTopIcon from '@/assets/icon/layer/upTop.svg?raw';
import downTopIcon from '@/assets/icon/layer/downTop.svg?raw';
import { EditorTypeEnum, FabricObjectVO, PersonalizedImgVo } from '@/utils/editor';
import { Button, ButtonGroup, Col, Divider, Row, Tooltip, Icon } from 'view-ui-plus';
import { FabricUtils } from '@/utils/FabricUtils';
import { cloneData } from '@deary/utils';

const { canvasEditor, isOne, fabric, mixinState } = useSelect();

const list = ref<FabricObjectVO[]>([]);
const sortableContainer = ref<HTMLElement>();
const isDragging = ref(false);

// Sortable 配置选项
const sortableOptions: SortableOptions = {
  animation: 200,
  handle: '.drag-handle',
  ghostClass: 'ghost',
  chosenClass: 'chosen',
  dragClass: 'dragging',
  forceFallback: false,
  fallbackClass: 'fallback',
  dataIdAttr: 'data-id',
  onStart: () => {
    isDragging.value = true;
  },
  onEnd: () => {
    isDragging.value = false;
  },
  onUpdate: (evt) => {
    if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
      updateCanvasLayerOrder(evt.oldIndex, evt.newIndex);
    }
  }
};

// 初始化 useSortable
const sortable = useSortable(sortableContainer, list, sortableOptions);

// 是否选中元素
const isSelect = (item: FabricObjectVO) => {
  return item.id === mixinState.mSelectId || mixinState.mSelectIds.includes(item.id);
};

// 图层类型图标
const iconType = (type: string) => {
  const iconType = {
    [EditorTypeEnum.Options]: optionsIcon,
    [EditorTypeEnum.Group]: groupIcon,
    [EditorTypeEnum.TextBox]: textbox,
    [EditorTypeEnum.IText]: iText,
    [EditorTypeEnum.Image]: imageIcon,
    [EditorTypeEnum.Rect]: rectIcon,
    [EditorTypeEnum.Circle]: circleIcon,
    [EditorTypeEnum.Triangle]: triangleIcon,
    [EditorTypeEnum.Polygon]: polygonIcon
  };
  const defaultIcon = '';
  return iconType[type] || defaultIcon;
};

/**
 * 获取当前图片下标
 */
const getImgIndex = (src: string, arr: PersonalizedImgVo[] = []) => {
  if (!src || !arr || !arr.length) {
    return 1;
  }
  const index = arr?.findIndex((item) => item.src === src);
  const item = arr[index] as PersonalizedImgVo;
  if (item?.name) {
    return item.name;
  }
  return isNumber(index) && index >= 0 ? index + 1 : 1;
};

/**
 * 图层类型文字
 * @param type
 * @param item
 */
const textType = (type: string, item: FabricObjectVO) => {
  if (type.includes(EditorTypeEnum.Text)) {
    return item.name || item?.text;
  }
  const typeText = {
    [EditorTypeEnum.Image]: item?.personalized
      ? item?.lLabel
        ? item?.lLabel + ' #' + getImgIndex(item.src, item.personalizedImgs as PersonalizedImgVo[])
        : '图片 #' + getImgIndex(item.src, item.personalizedImgs as PersonalizedImgVo[])
      : item?.lLabel
        ? item?.lLabel
        : '图片',
    [EditorTypeEnum.Options]: item?.lLabel ? item?.lLabel : '选项',
    [EditorTypeEnum.Group]: item?.lLabel ? item?.lLabel : '组合',
    [EditorTypeEnum.Rect]: item?.lLabel ? item?.lLabel : '矩形',
    [EditorTypeEnum.Circle]: item?.lLabel ? item?.lLabel : '圆形',
    [EditorTypeEnum.Triangle]: item?.lLabel ? item?.lLabel : '三角形',
    [EditorTypeEnum.Polygon]: item?.lLabel ? item?.lLabel : '多边形',
    [EditorTypeEnum.Path]: item?.lLabel ? item?.lLabel : '路径'
  };
  return typeText[type] || '默认元素';
};

// 选中元素
const select = (id?: string) => {
  if (isDragging.value) return; // 拖拽时不触发选中

  const objects: FabricObjectVO[] = canvasEditor.fabricCanvas?.getObjects() || [];
  const info = objects?.find((item) => item?.id === id);
  canvasEditor.fabricCanvas?.discardActiveObject();
  canvasEditor.fabricCanvas?.setActiveObject(info);
  canvasEditor.fabricCanvas?.requestRenderAll();
};

// 按钮类型
const btnIconType = (type: string) => {
  const iconType = {
    up: upIcon,
    down: downIcon,
    upTop: upTopIcon,
    downTop: downTopIcon
  };
  return iconType[type];
};

const up = () => {
  canvasEditor.up();
};
const upTop = () => {
  canvasEditor.toFront();
};
const down = () => {
  canvasEditor.down();
};
const downTop = () => {
  canvasEditor.toBack();
};

const getList = () => {
  const objects: FabricObjectVO[] = canvasEditor.fabricCanvas?.getObjects() || [];

  // 创建新的数组并进行处理
  const processedList = [...objects] // 使用扩展运算符创建新数组
    .filter((item) => {
      // @ts-expect-error
      return !(item instanceof fabric.GuideLine || item.id === 'workspace');
    })
    .reverse()
    .map((item) => ({
      type: item.type,
      id: item.id,
      name: item.name,
      text: item.text,
      lLabel: item.lLabel,
      isLock: !item.selectable,
      // 图片类型
      src: item.src,
      personalized: item.personalized,
      personalizedImgs: FabricUtils.convertToPersonalizedImgVoArray(item.personalizedImgs)
    }));

  const uniqueList = uniqBy(processedList, 'id');

  // 更新响应式变量
  list.value = uniqueList as unknown as FabricObjectVO[];
};

const doLock = (item: FabricObjectVO) => {
  select(item.id);
  item.isLock ? canvasEditor.unLock() : canvasEditor.lock();
  canvasEditor.fabricCanvas?.discardActiveObject();
};

// 更新Canvas图层顺序
const updateCanvasLayerOrder = (oldIndex: number, newIndex: number) => {
  const canvas = canvasEditor.fabricCanvas;
  if (!canvas) return;

  const objects = canvas.getObjects();

  // 过滤出有效的对象（排除辅助线和工作区）
  const validObjects = objects.filter((item) => {
    // @ts-expect-error
    return !(item instanceof fabric.GuideLine || item.id === 'workspace');
  });

  // 由于list是reverse的，需要计算实际的canvas对象索引
  const actualOldIndex = validObjects.length - 1 - oldIndex;
  const actualNewIndex = validObjects.length - 1 - newIndex;

  // 获取要移动的对象
  const objectToMove = validObjects[actualOldIndex];
  if (!objectToMove) return;

  // 移动对象到新位置
  const targetIndex = canvas.getObjects().indexOf(validObjects[actualNewIndex]);

  if (actualOldIndex < actualNewIndex) {
    // 向上移动
    canvas.moveTo(objectToMove, targetIndex + 1);
  } else {
    // 向下移动
    canvas.moveTo(objectToMove, targetIndex);
  }

  // 重新渲染画布
  canvas.requestRenderAll();
};

// 启用/禁用拖拽
const enableSortable = () => {
  sortable.start();
};

const disableSortable = () => {
  sortable.stop();
};

onMounted(() => {
  getList();
  canvasEditor.fabricCanvas?.on('after:render', getList);

  // 启用拖拽功能
  nextTick(() => {
    enableSortable();
  });
});

onUnmounted(() => {
  // 清理拖拽功能
  disableSortable();
});

// 监听列表变化，重新初始化sortable
watch(
  list,
  () => {
    nextTick(() => {
      if (sortableContainer.value) {
        disableSortable();
        enableSortable();
      }
    });
  },
  { deep: true }
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
:deep(.ivu-tooltip-inner) {
  white-space: normal;
}

:deep(.ivu-tooltip) {
  display: block;
}

.box {
  width: 100%;
}

.layer-box {
  height: calc(100vh - 737px);
  overflow-y: auto;
  margin-bottom: 5px;

  .sortable-container {
    min-height: 50px;
  }

  .layer-item {
    padding: 0 5px;
    margin: 3px 0;
    background: #f7f7f7;
    color: #c8c8c8;
    border-radius: 3px;
    font-size: 14px;
    line-height: 28px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background: #e8f4f8;
      .drag-handle {
        opacity: 1;
      }
    }

    &.active {
      color: #2d8cf0;
      background: #f0faff;
      font-weight: bold;
    }

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      cursor: grab;

      &:active {
        cursor: grabbing;
      }

      .drag-icon {
        color: #999;
        font-size: 14px;
      }
    }
  }
}

// useSortable 相关样式
:deep(.ghost) {
  opacity: 0.4;
  background: #c8ebfb !important;
  border: 2px dashed #2d8cf0 !important;
}

:deep(.chosen) {
  background: #f0faff !important;
  border: 1px solid #2d8cf0 !important;
  box-shadow: 0 2px 8px rgba(45, 140, 240, 0.2);
}

:deep(.dragging) {
  opacity: 0.8 !important;
  box-shadow: 0 8px 25px rgba(45, 140, 240, 0.4) !important;
  z-index: 1000 !important;
  background: #ffffff !important;
  border: 2px solid #2d8cf0 !important;
}

:deep(.fallback) {
  opacity: 0.8;
  background: #ffffff;
  border: 2px solid #2d8cf0;
  border-radius: 3px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

// 拖拽时的指示线
:deep(.sortable-ghost) {
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #2d8cf0;
    border-radius: 1px;
  }
}

.btn-box {
  width: 100%;
  margin-bottom: 20px;
  background: #f3f3f3;
  .ivu-btn-group {
    display: flex;
  }
  .ivu-btn-group > .ivu-btn {
    flex: 1;
  }
}

svg {
  vertical-align: text-top;
}

:deep(.ivu-divider-plain) {
  &.ivu-divider-with-text-left {
    margin: 10px 0;
    font-size: 16px;
    font-weight: bold;
    color: #000000;
  }
}

.empty-text {
  width: 100%;
  text-align: center;
  padding-top: 10px;
  color: #999;
}
</style>

<style lang="less">
span {
  svg {
    vertical-align: middle;
  }
  &.active {
    svg.icon {
      fill: #2d8cf0;
    }
  }
}
</style>
