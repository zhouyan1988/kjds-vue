<!--
 - DialogEditOptionsPrice 修改选项价格
 -->

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import type { FormInstance } from 'element-plus';
import { FabricObjectVO } from '@/utils/editor';
import { DesignOption, TemplateListVo, TemplateOptionParams } from '@/api/shop/types';
import { saveTemplateOption } from '@/api/shop';

const emits = defineEmits(['confirm']);

defineProps({
  title: {
    type: String,
    default: '选项附加价格'
  }
});

const ruleFormRef = ref<FormInstance>();
const rules = reactive({});

const dialogVisible = ref<boolean>(false);
const currentObjectId = ref<string>('');
const currentObject = ref<DesignOption>();

const open = (i: FabricObjectVO, ev: TemplateListVo) => {
  currentObjectId.value = i.id;
  for (let evElement in ev) {
    const item = ev[evElement];
    if (currentObjectId.value === item.title) {
      currentObject.value = item;
    }
  }
  console.log(currentObjectId.value, currentObject.value);
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  try {
    await saveTemplateOption(currentObject.value as TemplateOptionParams);
    dialogVisible.value = false;
    emits('confirm', currentObject);
  } catch {
    ElMessage.error('保存失败');
  }
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
  <el-dialog v-model="dialogVisible" :title="title" width="600px">
    <div>
      <el-form ref="ruleFormRef" :model="currentObject" :rules="rules" label-width="auto">
        <div class="options-container">
          <div class="options-header">
            <span class="header-label">选项名称</span>
            <span class="header-price">附加价格</span>
          </div>

          <div v-for="(option, index) in currentObject.children || []" :key="index" class="option-item">
            <div class="option-name">
              <span class="option-text">{{ option.title || `选项 ${index + 1}` }}</span>
            </div>

            <div class="option-price">
              <el-input-number v-model="option.price" :min="0" :precision="2" placeholder="0.00" class="price-input"></el-input-number>
            </div>
          </div>

          <div v-if="!currentObject.children || currentObject.children.length === 0" class="empty-state">
            <el-empty description="暂无选项数据" :image-size="100" />
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetForm(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.options-container {
  min-height: 200px;

  .options-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
    font-weight: 600;
    color: #606266;

    .header-label {
      flex: 1;
      min-width: 120px;
    }

    .header-controls {
      width: 120px;
      text-align: center;
    }

    .header-price {
      width: 180px;
      text-align: center;
    }
  }

  .option-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }

    .option-name {
      flex: 1;
      min-width: 120px;

      .option-text {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }

    .option-switch {
      width: 120px;
      display: flex;
      justify-content: center;

      :deep(.el-switch__label) {
        font-size: 12px;
      }
    }

    .option-price {
      width: 180px;
      display: flex;
      justify-content: center;

      .price-input {
        width: 140px;

        :deep(.el-input-number) {
          width: 100%;
        }

        :deep(.el-input__wrapper) {
          transition: all 0.3s ease;
        }

        &:not(.is-disabled) {
          :deep(.el-input__wrapper:hover) {
            border-color: #409eff;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: #909399;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .options-container {
    .options-header,
    .option-item {
      flex-direction: column;
      align-items: stretch;

      .header-label,
      .header-controls,
      .header-price,
      .option-name,
      .option-switch,
      .option-price {
        width: 100%;
        text-align: left;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .option-switch,
      .option-price {
        justify-content: flex-start;
      }
    }
  }
}
</style>
