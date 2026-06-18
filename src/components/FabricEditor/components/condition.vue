<!--
 - condition 启用条件
 -->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import useSelect from '@/hooks/select';
import { EventType } from '@kuaitu/core';
import {
  ConditionActionEnum,
  ConditionMatchEnum,
  ConditionRulesLogicEnum,
  EditorTypeEnum,
  FabricObjectVO,
  OptArresVO,
  OptionsDisplayMode
} from '@/utils/editor';
import { uniqBy } from 'lodash-es';
import { v4 as uuid } from 'uuid';

const { SelectEvent } = EventType;

const update = getCurrentInstance();
const { isOne, isOptions, canvasEditor } = useSelect();
const conditionTempId = ref(uuid());

// 属性值
const baseAttr = reactive<Partial<FabricObjectVO>>({
  condition: {
    enable: false,
    rules: [],
    action: ConditionActionEnum.Show,
    match: ConditionMatchEnum.All
  }
});

const lists = ref<FabricObjectVO[]>([]);
// 当前可选项
const listsOptionsObject = ref<{ [key: string]: OptArresVO[] }>({});

// 属性获取
const getObjectAttr = (e) => {
  conditionTempId.value = uuid();
  getOptionsList();
  const activeObject: FabricObjectVO = canvasEditor.fabricCanvas.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    const con = activeObject.get('condition');
    if (con) {
      baseAttr.condition = activeObject.get('condition');
    } else {
      baseAttr.condition = {
        enable: false,
        rules: [],
        action: ConditionActionEnum.Show,
        match: ConditionMatchEnum.All
      };
      changeCommon('condition', baseAttr.condition);
    }
  }
};

// 获取选项图层列表
const getOptionsList = () => {
  const objects: FabricObjectVO[] = canvasEditor.fabricCanvas?.getObjects() || [];
  // 创建新的数组并进行处理
  const processedList = [...objects]
    .filter((item) => {
      return item?.type === EditorTypeEnum.Options && item?.optDisplayMode !== OptionsDisplayMode.Toggle;
    })
    .reverse();

  const uniqueList = uniqBy(processedList, 'id');

  // 更新响应式变量
  lists.value = uniqueList as unknown as FabricObjectVO[];
  // 获取选项列表
  listsOptionsObject.value = lists.value.reduce((acc, cur) => {
    acc[cur.id] = cur.optArres || [];
    return acc;
  }, {});
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
  changeCommon('condition', baseAttr.condition);
};

const onSwitchChange = () => {
  changeCondition();
};

const handleAdd = () => {
  baseAttr.condition.rules.push({
    logic: ConditionRulesLogicEnum.EqualTo,
    option: '',
    value: ''
  });
  changeCondition();
};

const changeOption = (index: number) => {
  baseAttr.condition.rules[index].value = '';
  changeCondition();
};

const changeLogic = () => {
  changeCondition();
};

const changeValue = () => {
  changeCondition();
};

const handleRemove = (index: number) => {
  baseAttr.condition.rules.splice(index, 1);
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
  <div v-if="isOne" class="box attr-item-box">
    <Divider plain orientation="left"><h4>条件</h4></Divider>
    <div>
      <div class="hd-wrap">
        <div class="hd">
          <span>启用条件</span>
        </div>

        <iSwitch v-model="baseAttr.condition.enable" size="large" class="switch" @on-change="onSwitchChange">
          <template #open>
            <span>开启</span>
          </template>
          <template #close>
            <span>关闭</span>
          </template>
        </iSwitch>
      </div>

      <template v-if="baseAttr.condition.enable">
        <Form ref="formDynamic" :model="baseAttr.condition" style="width: 277px" label-position="top">
          <FormItem label="当前字段">
            <Select v-model="baseAttr.condition.action">
              <Option :value="ConditionActionEnum.Show">显示</Option>
              <Option :value="ConditionActionEnum.Hide">隐藏</Option>
            </Select>
          </FormItem>
          <FormItem label="以下规则匹配">
            <Select v-model="baseAttr.condition.match">
              <Option :value="ConditionMatchEnum.All">全部匹配</Option>
              <Option :value="ConditionMatchEnum.One">任意一条</Option>
              <Option :value="ConditionMatchEnum.None">不匹配</Option>
            </Select>
          </FormItem>
          <FormItem
            v-for="(item, index) in baseAttr.condition.rules"
            :key="index"
            class="l-rules-item"
            :label="'规则' + (index + 1)"
            :prop="'rules.' + index + '.value'"
            :rules="{ required: true, message: '不能为空', trigger: 'blur' }"
          >
            <Row :gutter="10">
              <Col span="21" class="mb-10px">
                <Select v-model="item.option" @on-change="changeOption(index)">
                  <Option v-for="litem in lists" :key="litem.id" :value="litem.id">
                    {{ litem.lLabel || litem.id }}
                  </Option>
                </Select>
              </Col>
              <Col span="3">
                <div>
                  <Icon type="md-close" class="cursor-pointer" size="22" color="red" @click="handleRemove(index)" />
                </div>
              </Col>
              <Col span="12">
                <Select v-model="item.logic" @on-change="changeLogic">
                  <Option :value="ConditionRulesLogicEnum.EqualTo">等于</Option>
                  <Option :value="ConditionRulesLogicEnum.NotEqualTo">不等于</Option>
                </Select>
              </Col>
              <Col span="12">
                <Select v-model="item.value" @on-change="changeValue">
                  <Option v-for="oitem in listsOptionsObject[item.option]" :key="`${conditionTempId}` + oitem.value" :value="oitem.value">
                    {{ oitem.label || oitem.value }}
                  </Option>
                </Select>
              </Col>
            </Row>
          </FormItem>
          <FormItem>
            <Row>
              <Col span="24">
                <Button type="dashed" long icon="md-add" @click="handleAdd"> 添加 </Button>
              </Col>
            </Row>
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
