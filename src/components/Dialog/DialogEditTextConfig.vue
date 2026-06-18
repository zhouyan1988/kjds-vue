<!--
 - DialogEditTextConfig 修改文本域配置
 -->

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ProductMergeStyleVO, textConfigVO } from '@/api/kjds/productMergeStyle/types';
import { EditorTypeEnum, FabricObjectVO } from '@/utils/editor';

const emits = defineEmits(['confirm']);

defineProps({
  title: {
    type: String,
    default: '修改配置'
  }
});

const dialogVisible = ref<boolean>(false);
const fabricObject = ref<FabricObjectVO>();
const open = (i: FabricObjectVO, ev: ProductMergeStyleVO) => {
  fabricObject.value = i;
  if (typeof ev?.templateConfig !== 'string' && ev.templateConfig[i.id]) {
    ruleForm.textConfig = ev.templateConfig[i.id]?.textConfig ?? { min: undefined, max: undefined, line: 1 };
  } else {
    ruleForm.textConfig = { min: undefined, max: undefined, line: 1 };
  }
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<textConfigVO>({
  textConfig: {
    min: undefined,
    max: undefined,
    line: 1
  }
});

const rules = reactive<FormRules<any>>({});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      dialogVisible.value = false;
      emits('confirm', fabricObject.value, ruleForm);
    } else {
      console.log('error submit!', fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  dialogVisible.value = false;
};

defineExpose({
  open,
  close
});
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" width="527px">
    <div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label="最小数字限制">
          <el-input-number v-model="ruleForm.textConfig.min" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="最大数字限制">
          <el-input-number v-model="ruleForm.textConfig.max" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item v-if="fabricObject.type === EditorTypeEnum.TextBox" label="限制行数">
          <el-input-number v-model="ruleForm.textConfig.line" placeholder="请输入" clearable :min="1" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetForm(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.l-top {
  .l-top-add {
    margin-bottom: 10px;
  }
}
.l-content {
  .l-card {
    margin-bottom: 20px;
  }
  .card-active {
    border-color: rgb(1, 173, 196);
  }
}
</style>
