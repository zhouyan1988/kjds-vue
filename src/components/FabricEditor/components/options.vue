<!--
 - options 选项
 -->

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import useSelect from '@/hooks/select';
import { EventType, Utils } from '@kuaitu/core';
import { FabricObjectVO, OptionsDisplayMode } from '@/utils/editor';
import { v4 as uuid } from 'uuid';

const { SelectEvent } = EventType;
const { selectImgSrc } = Utils;
const update = getCurrentInstance();
const { isOne, isOptions, canvasEditor } = useSelect();
const optTempId = ref(uuid());

// 模式列表
const displayModeList = [
  {
    label: '下拉框',
    value: OptionsDisplayMode.Dropdown
  },
  {
    label: '按钮',
    value: OptionsDisplayMode.Button
  },
  {
    label: '图像切换器',
    value: OptionsDisplayMode.Image
  },
  {
    label: '颜色切换器',
    value: OptionsDisplayMode.Color
  },
  {
    label: '图像颜色切换器',
    value: OptionsDisplayMode.ImageColor
  },
  {
    label: '切换',
    value: OptionsDisplayMode.Toggle
  }
];
// 属性值
const baseAttr = reactive<Partial<FabricObjectVO>>({
  optDefVal: '',
  optDisplayMode: '',
  optArres: [
    {
      label: '选项1',
      value: 'option-1',
      image: '2024-08/RkYHaG2vSs__957x1278.png',
      color: '#fcb900'
    }
  ],
  optToggle: {
    label: '',
    enable: false
  }
});

// 属性获取
const getObjectAttr = (e) => {
  optTempId.value = uuid();
  const activeObject: FabricObjectVO = canvasEditor.fabricCanvas.getActiveObject();

  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    baseAttr.optDefVal = activeObject.get('optDefVal') || '';

    const mode = activeObject.get('optDisplayMode');
    if (mode) {
      baseAttr.optDisplayMode = mode;
    } else {
      baseAttr.optDisplayMode = OptionsDisplayMode.Dropdown;
      changeCommon('optDisplayMode', OptionsDisplayMode.Dropdown);
    }

    baseAttr.optArres = activeObject.get('optArres') || [];

    const toggle = activeObject.get('optToggle');
    if (toggle) {
      baseAttr.optToggle = toggle;
    } else {
      baseAttr.optToggle = { enable: false, label: '' };
      changeCommon('optToggle', { enable: false, label: '' });
    }
  }
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

const uploadOptImg = (idx: number) => {
  selectImgSrc().then((src) => {
    baseAttr.optArres[idx].image = src;
    optArresChange();
  });
};

const radioGroupChange = () => {
  changeCommon('optDisplayMode', baseAttr.optDisplayMode);
};

const optDefValChange = (val: string) => {
  baseAttr.optDefVal = val;
  changeCommon('optDefVal', val);
};

const optArresChange = () => {
  // 判断默认值是否存在选项中
  const defVal = baseAttr.optDefVal;
  if (defVal && !baseAttr.optArres.some((i) => i.value === defVal)) {
    optDefValChange('');
  }

  setTimeout(() => {
    changeCommon('optArres', baseAttr.optArres);
  }, 0);
};

const optToggleChange = () => {
  changeCommon('optToggle', baseAttr.optToggle);
};

// 根据模式获取 col span
const getColSpan = (type: string) => {
  const mode = baseAttr.optDisplayMode;
  switch (mode) {
    case OptionsDisplayMode.Dropdown:
      return type === 'label' ? 11 : type === 'value' ? 11 : type === 'del' ? 2 : 6;
    case OptionsDisplayMode.Button:
      return type === 'label' ? 11 : type === 'value' ? 11 : type === 'del' ? 2 : 6;
    case OptionsDisplayMode.Image:
      return type === 'image' ? 7 : type === 'label' ? 7 : type === 'value' ? 7 : type === 'del' ? 3 : 6;
    case OptionsDisplayMode.Color:
      return type === 'color' ? 7 : type === 'label' ? 7 : type === 'value' ? 7 : type === 'del' ? 3 : 6;
    case OptionsDisplayMode.ImageColor:
      return type === 'image' ? 6 : type === 'label' ? 5 : type === 'value' ? 5 : type === 'del' ? 2 : 6;
    case OptionsDisplayMode.Toggle:
      return 12;
    default:
      return 6;
  }
};

const handleAdd = () => {
  baseAttr.optArres.push({
    label: '选项' + (baseAttr.optArres.length + 1),
    value: 'option-' + (baseAttr.optArres.length + 1),
    image: '',
    color: ''
  });
  optArresChange();
};

const handleRemove = (idx: number) => {
  baseAttr.optArres.splice(idx, 1);
  optArresChange();
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
  <div v-if="isOne && isOptions" class="box attr-item-box">
    <Divider plain orientation="left"><h4>选项</h4></Divider>
    <div>
      <h5>显示模式</h5>
      <RadioGroup v-model="baseAttr.optDisplayMode" vertical @on-change="radioGroupChange">
        <Radio v-for="(i, idx) in displayModeList" :key="idx" :label="i.value">
          <span>{{ i.label }}</span>
        </Radio>
      </RadioGroup>
      <!--可选项-->
      <template v-if="baseAttr.optDisplayMode !== OptionsDisplayMode.Toggle">
        <Form ref="formDynamic" :model="baseAttr" style="width: 277px" label-position="top">
          <FormItem
            v-for="(item, index) in baseAttr.optArres"
            :key="'optArres_' + index"
            :prop="'optArres.' + index + '.value'"
            :rules="{ required: true, message: '选项和值不能为空', trigger: 'blur' }"
          >
            <Row :gutter="10">
              <Col v-if="baseAttr.optDisplayMode === OptionsDisplayMode.Image" :span="getColSpan('image')">
                <span style="color: red">*</span>图片
                <div class="l-upload">
                  <div class="l-upload-drag" @click="uploadOptImg(index)">
                    <div class="l-upload-box">
                      <template v-if="item.image">
                        <Image :src="item.image" fit="contain" width="70px" height="70px" />
                      </template>
                      <template v-else>
                        <Icon type="ios-camera" size="20"></Icon>
                      </template>
                    </div>
                  </div>
                </div>
              </Col>
              <Col v-else-if="baseAttr.optDisplayMode === OptionsDisplayMode.Color" :span="getColSpan('color')">
                <span style="color: red">*</span>颜色
                <ColorPicker v-model="item.color" transfer @on-change="optArresChange" />
              </Col>
              <template v-else-if="baseAttr.optDisplayMode === OptionsDisplayMode.ImageColor">
                <Col :span="getColSpan('image')">
                  <span style="color: red">*</span>图片
                  <div class="l-upload">
                    <div class="l-upload-drag" @click="uploadOptImg(index)">
                      <div class="l-upload-box">
                        <template v-if="item.image">
                          <Image :src="item.image" fit="contain" width="70px" height="70px" />
                        </template>
                        <template v-else>
                          <Icon type="ios-camera" size="20"></Icon>
                        </template>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col :span="getColSpan('color')">
                  <span style="color: red">*</span>颜色
                  <ColorPicker v-model="item.color" transfer @on-change="optArresChange" />
                </Col>
              </template>
              <Col :span="getColSpan('label')">
                <span style="color: red">*</span>选项
                <Input v-model="item.label" type="text" placeholder="请输入选项名" @on-change="optArresChange"></Input>
              </Col>
              <Col :span="getColSpan('value')">
                <span style="color: red">*</span>值
                <Input v-model="item.value" type="text" placeholder="请输入选项值" @on-change="optArresChange"></Input>
              </Col>
              <Col :span="getColSpan('del')">
                &nbsp;
                <div>
                  <Icon type="md-close" class="cursor-pointer" @click="handleRemove(index)" />
                </div>
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <Row>
              <Col span="24">
                <Button type="dashed" long icon="md-add" @click="handleAdd">添加</Button>
              </Col>
            </Row>
          </FormItem>
          <!--默认值-->
          <FormItem>
            <FormItem label="默认值">
              <Select v-model="baseAttr.optDefVal" clearable @on-change="optDefValChange">
                <Option v-for="item in baseAttr.optArres" :key="`${optTempId}` + item.value" :value="item.value">
                  {{ item.label }}
                </Option>
              </Select>
            </FormItem>
          </FormItem>
        </Form>
      </template>
      <template v-else>
        <Form ref="formDynamic" :model="baseAttr" style="width: 277px" label-position="top">
          <Row :gutter="10">
            <Col span="12">
              <FormItem label="标签" :prop="'optToggle.label'" :rules="{ required: true, message: '值不能为空', trigger: 'blur' }">
                <Input v-model="baseAttr.optToggle.label" type="text" @on-change="optToggleChange"></Input>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="启用" :prop="'optArres.enable'">
                <Switch v-model="baseAttr.optToggle.enable" @on-change="optToggleChange" />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.l-upload {
  display: inline-block;
  width: 70px;

  .l-upload-drag {
    background: #fff;
    border: 1px dashed #dcdee2;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .l-upload-box {
    width: 70px;
    height: 70px;
    line-height: 70px;
  }
}
</style>
