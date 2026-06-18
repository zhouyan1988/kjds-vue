<template>
  <div v-if="isOne && isImage" class="box">
    <Divider plain orientation="left">
      <h4>图像个性化</h4>
    </Divider>
    <div class="hd-wrap">
      <div class="hd">
        <span>用户上传</span>
      </div>

      <Switch v-model="baseAttr.userupload" size="large" class="switch" @on-change="onSwitchUploadChange">
        <template #open>
          <span>开启</span>
        </template>
        <template #close>
          <span>关闭</span>
        </template>
      </Switch>
    </div>
    <div class="hd-wrap">
      <div class="hd">
        <span>启用个性化</span>
      </div>

      <Switch v-model="baseAttr.personalized" size="large" class="switch" @on-change="onSwitchChange">
        <template #open>
          <span>开启</span>
        </template>
        <template #close>
          <span>关闭</span>
        </template>
      </Switch>
    </div>

    <template v-if="baseAttr.personalized">
      <div class="operation mb-10px">
        <Button type="primary" size="small" @click="insertImg">添加图片</Button>
        <Button type="success" size="small" @click="openMaterialDialog">素材库</Button>
      </div>
      <RadioGroup v-model="baseAttr.index" class="l-radio-group" @on-change="radioGroupChange">
        <Radio v-for="(item, idx) in baseAttr.personalizedImgs" :key="idx" :label="idx" class="l-radio">
          <img class="l-radio-img" :src="FabricUtils.getPersonalizedImageSrc(item)" alt="" style="object-fit: contain" />
          <div class="l-radio-name">
            <el-input v-model="baseAttr.personalizedImgs[idx].name" placeholder="图片名称" @blur="onImageNameBlur(idx)"></el-input>
          </div>

          <Icon
            v-if="baseAttr.personalizedImgs && baseAttr.personalizedImgs.length !== 1"
            class="l-radio-close cursor-pointer"
            type="md-close"
            :size="20"
            color="red"
            @click.stop="delRadio(idx)"
          />
        </Radio>
      </RadioGroup>
    </template>
    <!-- 素材库选择对话框 -->
    <DialogSelMaterial ref="materialDialogRef" @confirm="handleMaterialConfirm" />
  </div>
</template>

<script name="ImgPersonalized" lang="ts" setup>
import { reactive } from 'vue';
import useSelect from '@/hooks/select';
import { fabric } from 'fabric';
import { Utils, EventType } from '@kuaitu/core';
import { EditorTypeEnum, FabricObjectType, FabricObjectVO, ImgPersonalizedBaseAttr, PersonalizedImgVo } from '@/utils/editor';
import { Button, Divider, Icon, Input, Radio, RadioGroup, Switch } from 'view-ui-plus';
import { ElMessage } from 'element-plus';
import { MaterialVO } from '@/api/material/types';
import DialogSelMaterial from '@/components/Dialog/DialogSelMaterial.vue';
import { FabricUtils } from '@/utils/FabricUtils';

const update = getCurrentInstance();
const { SelectEvent } = EventType;
const { selectImgsSrc, insertImgFile, urlsToBase64 } = Utils;

interface IExtendImage {
  [x: string]: any;
  originWidth?: number;
  originHeight?: number;
  originSrc?: string;
}

const { isOne, canvasEditor } = useSelect();
const isImage = ref(false);

// 可修改的元素
const baseType = [EditorTypeEnum.Image];

// 属性值
const baseAttr: ImgPersonalizedBaseAttr = reactive({
  index: 0,
  src: '',
  // 是否用户上传
  userupload: false,
  // 是否个性化
  personalized: false,
  // 个性化图片列表
  personalizedImgs: []
});

const onImageNameBlur = (index: number) => {
  changeCommon('personalizedImgs', [...baseAttr.personalizedImgs]);
};

const getActiveObject = (): (fabric.Image & IExtendImage) | undefined => {
  const activeObject = canvasEditor.fabricCanvas?.getActiveObject();
  if (!activeObject || !Utils.isImage(activeObject)) return;
  return activeObject;
};

const getImgs = (): (string | PersonalizedImgVo)[] => {
  const activeObject = canvasEditor.fabricCanvas?.getActiveObject();
  let imgs: (string | PersonalizedImgVo)[] = [];
  if (activeObject && baseType.includes(activeObject.type as EditorTypeEnum)) {
    imgs = (activeObject as any).get('personalizedImgs') || [];
    if (!(imgs && imgs.length)) {
      const src = (activeObject as any).get('src') || '';
      imgs = src === '' ? [] : [src];
    }
  }
  return imgs;
};

const onSwitchUploadChange = async (val: boolean) => {
  if (val) {
    changeCommon('userupload', true);
    changeCommon('personalized', false);
  } else {
    changeCommon('userupload', false);
  }
};

const onSwitchChange = async (val: boolean) => {
  if (val) {
    changeCommon('personalized', true);
    changeCommon('userupload', false);
  } else {
    changeCommon('personalized', false);
  }

  changeCommon('personalizedImgs', FabricUtils.convertToPersonalizedImgVoArray(getImgs()));
  changeIndex();
};

// 改变当前选项
const changeIndex = () => {
  const srcArray = FabricUtils.getPersonalizedImageSrcArray(baseAttr.personalizedImgs);
  const srcIndex = srcArray.indexOf(baseAttr.src);
  baseAttr.index = srcIndex >= 0 ? srcIndex : 0;
};

// 通用属性改变
const changeCommon = (key: FabricObjectType, value: boolean | string | (string | PersonalizedImgVo)[]) => {
  const activeObject: FabricObjectVO = canvasEditor.fabricCanvas?.getActiveObjects()[0];
  if (activeObject) {
    if (key === 'personalizedImgs') {
      activeObject && activeObject.set(key, value as (string | PersonalizedImgVo)[]);
      baseAttr.personalizedImgs = value as (string | PersonalizedImgVo)[];
      return;
    }
    activeObject && activeObject.set(key, value);
    baseAttr[key] = value;
    canvasEditor.fabricCanvas?.renderAll();
  }
};

// 属性获取
const getObjectAttr = (e: any) => {
  isImage.value = !!getActiveObject();

  const activeObject = canvasEditor.fabricCanvas?.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && baseType.includes(activeObject.type as EditorTypeEnum)) {
    baseAttr.src = (activeObject as any).get('src') || '';
    baseAttr.userupload = (activeObject as any).get('userupload') || false;
    baseAttr.personalized = (activeObject as any).get('personalized') || false;
    baseAttr.personalizedImgs = FabricUtils.convertToPersonalizedImgVoArray((activeObject as any).get('personalizedImgs') || []);
    changeIndex();
  }
};

const insertImg = () => {
  selectImgsSrc().then((imgs) => {
    if (!imgs || !imgs.length) return;
    for (let i = 0; i < imgs?.length; i++) {
      const src = imgs[i];
      // 添加为PersonalizedImgVo对象，支持图片描述
      baseAttr.personalizedImgs.push({ src, name: '' });
    }
    changeCommon('personalizedImgs', baseAttr.personalizedImgs);
  });
};

const radioGroupChange = async (ev) => {
  const selectedItem = baseAttr.personalizedImgs[ev];
  const src = FabricUtils.getPersonalizedImageSrc(selectedItem);
  await repleace(src);
};

const delRadio = (idx: number) => {
  baseAttr.personalizedImgs.splice(idx, 1);
  changeCommon('personalizedImgs', baseAttr.personalizedImgs);
  // 如果删除的是当前选中的图片，则需要替换图片为前一张
  if (baseAttr.index === idx) {
    const newIndex = Math.max(0, idx - 1);
    baseAttr.index = newIndex;
    if (baseAttr.personalizedImgs.length > 0) {
      const newSelectedItem = baseAttr.personalizedImgs[newIndex];
      const newSrc = FabricUtils.getPersonalizedImageSrc(newSelectedItem);
      repleace(newSrc);
    }
  } else if (baseAttr.index > idx) {
    // 如果删除的图片在当前选中图片之前，需要调整索引
    baseAttr.index--;
  }
};

// 替换图片
const repleace = async (src: string) => {
  const activeObject = canvasEditor.fabricCanvas?.getActiveObjects()[0];
  if (activeObject && activeObject.type === EditorTypeEnum.Image) {
    // 字符串转El
    const imgEl = await insertImgFile(src);
    const width = activeObject.get('width');
    const height = activeObject.get('height');
    const scaleX = activeObject.get('scaleX');
    const scaleY = activeObject.get('scaleY');
    // @ts-expect-error: 内置函数
    activeObject?.setSrc(imgEl.src, () => {
      changeCommon('src', src);
      activeObject.set('scaleX', (width * scaleX) / imgEl.width);
      activeObject.set('scaleY', (height * scaleY) / imgEl.height);
      canvasEditor.fabricCanvas?.renderAll();
    });
    imgEl.remove();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

// 打开素材库对话框
const materialDialogRef = ref();
const openMaterialDialog = () => {
  if (materialDialogRef.value) {
    materialDialogRef.value.open();
  } else {
    console.error('materialDialogRef 未找到');
  }
};

// 处理素材库选择确认
const handleMaterialConfirm = async (data: { images: string[]; material: MaterialVO }) => {
  if (!data.images) {
    ElMessage.warning('请选择一张图片');
    return;
  }
  const base64Images = await urlsToBase64(data.images);
  // 是否需要去重
  const needUnique = false;
  let duplicateCount = 0;

  base64Images.forEach(({ base64 }) => {
    if (needUnique) {
      const existingSrcArray = FabricUtils.getPersonalizedImageSrcArray(baseAttr.personalizedImgs);
      const existingIndex = existingSrcArray.findIndex((src) => src === base64);
      if (existingIndex !== -1) {
        duplicateCount++;
      } else {
        baseAttr.personalizedImgs.push({ src: base64, name: '' });
      }
    } else {
      baseAttr.personalizedImgs.push({ src: base64, name: '' });
    }
  });
  changeCommon('personalizedImgs', baseAttr.personalizedImgs);
  if (duplicateCount > 0) {
    ElMessage.success(`${duplicateCount} 张图片已存在于个性化图片列表中，已跳过`);
  }
  if (baseAttr.personalizedImgs.length === 1) {
    baseAttr.index = 0;
    const firstItem = baseAttr.personalizedImgs[0];
    const firstSrc = FabricUtils.getPersonalizedImageSrc(firstItem);
    await repleace(firstSrc);
  }
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

<style lang="less" scoped>
.l-radio-group {
  .l-radio {
    position: relative;
    border: 1px solid #e6e6e6;
    margin-bottom: 8px;

    :deep(.ivu-radio) {
      position: absolute;
      top: 2px;
      left: 2px;
    }

    .l-radio-close {
      position: absolute;
      top: 0;
      right: 0;
    }

    .l-radio-img {
      width: 77px;
      height: 77px;
    }
  }
}
// :deep(.ivu-divider-plain) {
//   &.ivu-divider-with-text-left {
//     margin: 10px 0;
//     font-weight: bold;
//     font-size: 16px;
//     color: #000000;
//   }
// }
.box {
  margin-bottom: 20px;
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
  .operation {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    .slide-wrap {
      width: 100%;
    }
  }
}
</style>
