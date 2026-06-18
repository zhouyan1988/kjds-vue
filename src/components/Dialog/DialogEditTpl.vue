<!--
 - DialogEditTpl 修改模板标签
 -->

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ProductMergeStyleVO } from '@/api/kjds/productMergeStyle/types';

interface RuleForm {
  templateOptionLabel: string;
}

const emits = defineEmits(['confirm']);

defineProps({
  title: {
    type: String,
    default: '修改标签'
  }
});

const dialogVisible = ref<boolean>(false);
const open = (ev: ProductMergeStyleVO) => {
  ruleForm.templateOptionLabel = ev.templateOptionLabel ?? 'Custom Template';
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  templateOptionLabel: 'Custom Template'
});

const rules = reactive<FormRules<RuleForm>>({
  templateOptionLabel: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      dialogVisible.value = false;
      emits('confirm', ruleForm);
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
        <el-form-item label="标签名称" prop="templateOptionLabel">
          <el-input v-model="ruleForm.templateOptionLabel" :maxlength="100" placeholder="请输入标签名称" clearable />
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
