<template>
  <el-dialog v-model="dialogVisible" :title="title" width="1000px" append-to-body>
    <div>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="mb-4">
        <el-form-item label="素材库名称" label-width="90px">
          <el-input v-model="queryParams.name" placeholder="请输入素材库名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 素材库列表 -->
      <div v-loading="loading" class="material-content">
        <template v-if="materialList && materialList.length">
          <el-row :gutter="20">
            <el-col v-for="material in materialList" :key="material.id" :span="6">
              <el-card class="material-card cursor-pointer" @click="handleClickCard(material)">
                <div class="material-preview">
                  <div v-if="material.imageList && material.imageList.length > 0" class="image-grid">
                    <el-image v-for="(img, index) in material.imageList.slice(0, 4)" :key="index" :src="img" fit="cover" class="preview-image" />
                  </div>
                  <div v-else class="no-image">
                    <span>暂无图片</span>
                  </div>
                </div>
                <template #footer>
                  <div class="material-info">
                    <div class="material-name">{{ material.name || '未命名素材库' }}</div>
                    <div class="material-count">图片数量: {{ material.imageCount || material.imageList?.length || 0 }}</div>
                  </div>
                </template>
              </el-card>
            </el-col>
          </el-row>

          <!-- 分页 -->
          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            :page-sizes="[12, 24, 36, 48]"
            @pagination="handleSizeChange"
          />
        </template>
        <el-empty v-else description="暂无素材库" />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 图片详情对话框 -->
  <el-dialog v-model="imageDialogVisible" :title="`${currentMaterial?.name || '素材库'} - 图片详情`" width="1200px" append-to-body>
    <div v-if="currentMaterial">
      <!-- 操作按钮区域 -->
      <div class="selection-controls">
        <el-button size="small" @click="selectAllCurrentPage">
          {{ currentMaterial.imageList && currentMaterial.imageList.every((image) => selectedImages.includes(image)) ? '取消全选' : '全选当前页' }}
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="imageLoading" v-loading="imageLoading" class="loading-container" element-loading-text="正在加载图片详情...">
        <div style="height: 200px"></div>
      </div>
      <!-- 图片列表 -->
      <div v-else class="image-list">
        <template v-if="currentMaterial.imageList && currentMaterial.imageList.length > 0">
          <el-row :gutter="16">
            <el-col v-for="(image, index) in currentMaterial.imageList" :key="index" :span="6">
              <el-card
                class="image-card cursor-pointer"
                :class="{
                  'image-active': selectedImage === image,
                  'image-selected': selectedImages.includes(image)
                }"
                @click="handleSelectImage(image)"
              >
                <div class="image-container">
                  <img :src="image" style="width: 200px; height: 200px" />
                  <!-- 选中标识 -->
                  <div v-if="selectedImages.includes(image)" class="selected-overlay">
                    <el-icon class="selected-icon"><Check /></el-icon>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 图片统计信息 -->
          <div class="image-stats">
            <el-tag type="info">共 {{ imageTotal }} 张图片</el-tag>
            <el-tag v-if="selectedImages.length > 0" type="success">已选择 {{ selectedImages.length }} 张图片</el-tag>
          </div>
          <!-- 图片分页 -->
          <pagination
            v-show="imageTotal > 0"
            v-model:page="imageQueryParams.pageNum"
            v-model:limit="imageQueryParams.pageSize"
            :total="imageTotal"
            :page-sizes="[12, 24, 36, 48]"
            @pagination="handleImagePageChange"
          />
        </template>
        <!-- 无图片状态 -->
        <el-empty v-else description="该素材库暂无图片" />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeImageDialog">返回</el-button>
        <el-button type="primary" :disabled="selectedImages.length === 0" @click="confirmImage">选择图片 ({{ selectedImages.length }})</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { listMaterial, listMaterialImage } from '@/api/material';
import { MaterialVO, MaterialQuery } from '@/api/material/types';

interface queryParamsInterface {
  pageNum: number;
  pageSize: number;
  name?: string;
}

const emits = defineEmits(['confirm']);

const props = defineProps({
  title: {
    type: String,
    default: '选择素材库'
  }
});

const dialogVisible = ref<boolean>(false);
const imageDialogVisible = ref<boolean>(false);
const loading = ref<boolean>(true);
const imageLoading = ref<boolean>(false); // 图片详情加载状态
const total = ref<number>(0);
const queryParams = ref<queryParamsInterface>({
  pageNum: 1,
  pageSize: 12,
  name: ''
});

// 图片详情分页参数
const imageQueryParams = ref<MaterialQuery>({
  pageNum: 1,
  pageSize: 12,
  materialId: undefined
});
const imageTotal = ref<number>(0);

/*查询素材库列表*/
const materialList = ref<MaterialVO[]>([]);
const currentMaterial = ref<MaterialVO | null>(null);
const selectedImage = ref<string>('');
const selectedImages = ref<string[]>([]); // 存储选中的图片（支持全选）
const materialImageList = ref<any[]>([]); // 存储从接口获取的图片详情数据

const getMaterialList = async () => {
  loading.value = true;
  try {
    const res = await listMaterial(queryParams.value);
    materialList.value = res.rows;
    total.value = res.total;
    await Promise.all(
      materialList.value.map(async (item) => {
        const imageRes = await listMaterialImage({
          materialId: item.id,
          pageNum: 1,
          pageSize: 1
        });
        item.imageCount = imageRes.total || 0;
      })
    );
  } catch (error) {
    console.error('获取素材库列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getMaterialList();
};

const handleReset = () => {
  queryParams.value.name = '';
  handleQuery();
};

const handleClickCard = async (material: MaterialVO) => {
  currentMaterial.value = material;
  selectedImage.value = '';
  selectedImages.value = [];
  imageDialogVisible.value = true;
  imageQueryParams.value = {
    pageNum: 1,
    pageSize: 12,
    materialId: material.id
  };
  await getMaterialImageList();
};

// 获取图片详情列表
const getMaterialImageList = async () => {
  if (!currentMaterial.value?.id) return;
  imageLoading.value = true;
  try {
    const res = await listMaterialImage(imageQueryParams.value);
    materialImageList.value = res.rows || [];
    imageTotal.value = res.total || 0;
    if (res.rows && res.rows.length > 0) {
      const imageUrls = res.rows
        .map((item: any) => {
          return item.img || item.file || item.imageUrl;
        })
        .filter(Boolean);
      currentMaterial.value.imageList = imageUrls;
    } else {
      currentMaterial.value.imageList = [];
    }
  } catch (error) {
    ElMessage.error('获取图片详情失败，请重试');
    materialImageList.value = [];
    currentMaterial.value.imageList = [];
    imageTotal.value = 0;
  } finally {
    imageLoading.value = false;
  }
};

const handleSelectImage = (image: string) => {
  const isSelected = selectedImages.value?.includes(image);

  if (isSelected) {
    // 如果图片已被选中，则取消选中
    const index = selectedImages.value.indexOf(image);
    if (index > -1) {
      selectedImages.value.splice(index, 1);
    }
    // 如果取消选中的是当前高亮的图片，则清除高亮
    if (selectedImage.value === image) {
      selectedImage.value = '';
    }
  } else {
    // 如果图片未被选中，则选中它
    selectedImages.value.push(image);
    selectedImage.value = image; // 设置为当前高亮图片
  }
};

// 全选当前页面的图片
const selectAllCurrentPage = () => {
  const currentPageImages = currentMaterial.value?.imageList || [];
  const allSelected = currentPageImages.every((image) => selectedImages.value.includes(image));
  if (allSelected) {
    currentPageImages.forEach((image) => {
      const index = selectedImages.value.indexOf(image);
      if (index > -1) {
        selectedImages.value.splice(index, 1);
      }
    });
    if (currentPageImages.includes(selectedImage.value)) {
      selectedImage.value = '';
    }
  } else {
    currentPageImages.forEach((image) => {
      if (!selectedImages.value.includes(image)) {
        selectedImages.value.push(image);
      }
    });
    if (!selectedImage.value && currentPageImages.length > 0) {
      selectedImage.value = currentPageImages[0];
    }
  }
};

// 素材库详情图片分页切换处理
const handleImagePageChange = () => {
  getMaterialImageList();
};

// 素材库分页切换处理
const handleSizeChange = () => {
  getMaterialList();
};

const open = () => {
  dialogVisible.value = true;
  handleQuery();
};

const close = () => {
  dialogVisible.value = false;
  queryParams.value.name = '';
};

const closeImageDialog = () => {
  imageDialogVisible.value = false;
  currentMaterial.value = null;
  selectedImage.value = '';
  selectedImages.value = [];
  materialImageList.value = [];
  imageLoading.value = false;
  imageTotal.value = 0;
  imageQueryParams.value = {
    pageNum: 1,
    pageSize: 12,
    materialId: undefined
  };
};

const confirmImage = () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请至少选择一张图片');
    return;
  }

  // 触发确认事件，传递选中的图片信息
  emits('confirm', {
    images: selectedImages.value,
    material: currentMaterial.value
  });
  closeImageDialog();
  close();
};

defineExpose({
  open,
  close
});
</script>

<style scoped lang="scss">
.material-content {
  .material-card {
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.material-preview {
  height: 120px;
  overflow: hidden;
  border-radius: 4px;

  .image-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    height: 100%;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .no-image {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 12px;

    span {
      margin-top: 8px;
    }
  }
}

.material-info {
  .material-name {
    font-weight: 500;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .material-count {
    font-size: 12px;
    color: #909399;
  }
}

.selection-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.image-list {
  .image-card {
    text-align: center;
    margin-bottom: 16px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .image-active {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .image-selected {
    border-color: #67c23a;
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  }

  .image-container {
    position: relative;
    display: inline-block;
  }

  .selected-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background-color: #67c23a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .selected-icon {
    color: white;
    font-size: 14px;
  }

  .image-stats {
    margin-top: 16px;
    text-align: center;
    .el-tag {
      margin: 0 4px;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
