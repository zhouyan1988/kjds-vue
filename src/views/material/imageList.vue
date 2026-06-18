<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10" class="mb8 leading-8">
              <el-col :span="1.5">
                <el-button type="primary" plain @click="goBack">返回</el-button>
              </el-col>
              <el-col :span="1.5">
                <span class="title">素材库：{{ materialName }}</span>
              </el-col>
            </el-row>
          </template>
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="图片名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入图片名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['material:add']" type="primary" plain icon="Plus" @click="handleUpload('add')">新增素材图片</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['material:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getMaterialImageList"></right-toolbar>
        </el-row>
      </template>
      <el-table v-loading="loading" :data="imageList" row-key="id" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" align="center" prop="id" width="80" />
        <el-table-column label="图片名称" align="center" prop="name">
          <template #default="scope">
            {{ scope.row.name.includes('/') ? scope.row.name.split('/')[1] : scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="图片预览" align="center" prop="imageUrl" width="120">
          <template #default="scope">
            <image-preview :src="scope.row.imageUrl" :width="80" :height="80" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-tooltip content="替换" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleUpload('replace', scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getMaterialImageList"
      />
    </el-card>

    <!-- 添加或修改素材图片对话框 -->
    <el-dialog v-if="upload.open" v-model="upload.open" :title="upload.title" width="800px" append-to-body>
      <div v-if="currentOperation === 'replace' && selectedImage" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p class="text-sm text-blue-700"><strong>当前图片：</strong>{{ selectedImage.name }}</p>
        <p class="text-xs text-blue-600 mt-1">请选择一个新的图片来替换当前图片</p>
      </div>
      <folder-upload
        ref="folderUploadRef"
        :action="upload.url"
        :headers="upload.headers"
        :custom-upload="true"
        upload-mode="file"
        :limit="currentOperation === 'replace' ? 1 : 20"
        @upload-success="handleImageUploadSuccess"
        @upload-error="handleImageUploadError"
        @upload-complete="handleImageUploadComplete"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :disabled="uploadedData.length === 0" @click="submitFileForm">
            {{ currentOperation === 'replace' ? '替换素材图片' : '添加素材图片' }}
          </el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaterialImageList" lang="ts">
import { listMaterialImage, delMaterialImage, uploadMaterialImages, addMaterialImage, replaceMaterialImage } from '@/api/material';
import { MaterialVO, MaterialQuery, MaterialForm } from '@/api/material/types';
import { globalHeaders } from '@/utils/request';
import { useRoute, useRouter } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const materialName = ref('');
const materialId = ref<string | number>('');

const showSearch = ref(true);
const folderUploadRef = ref<any>();

const initFormData: MaterialForm = {
  id: undefined,
  name: undefined,
  imageList: [],
  materialId: undefined
};

const data = reactive<PageData<MaterialForm, MaterialQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    materialId: undefined
  },
  rules: {}
});
const { queryParams, form } = toRefs(data);

const imageList = ref<MaterialVO[]>([]);
const loading = ref(false);
const total = ref(0);
/** 查询图片列表 */
const getMaterialImageList = async () => {
  loading.value = true;
  const res = await listMaterialImage(queryParams.value);
  imageList.value = res.rows || [];
  form.value.materialId = materialId.value;
  total.value = res.total || 0;
  loading.value = false;
};

const queryFormRef = ref<ElFormInstance>();

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getMaterialImageList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
/** 多选框选中数据 */
const handleSelectionChange = (selection: MaterialVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

/** 删除按钮操作 */
const handleDelete = async (row?: MaterialVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除编号为"' + _ids + '"的图片？').finally(() => (loading.value = false));
  // 确保传入的是数组类型，并转换为number类型
  const idsToDelete = Array.isArray(_ids) ? _ids.map((id) => Number(id)) : [Number(_ids)];
  await delMaterialImage(idsToDelete);
  proxy?.$modal.msgSuccess('删除成功');
  await getMaterialImageList();
};

const MaterialFormRef = ref<ElFormInstance>();
/** 弹框表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  form.value.materialId = materialId.value;
  MaterialFormRef.value?.resetFields();
};

const upload = reactive<ImportOption>({
  // 是否显示弹出层（上传素材）
  open: false,
  // 弹出层标题（上传素材）
  title: '',
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/materialLibrary/updateMaterialImage'
});

// 保存上传成功返回的数据
const uploadedData = ref<any[]>([]);
// 当前操作类型和
const currentOperation = ref<'add' | 'replace'>('add');
// 选中的图片
const selectedImage = ref<any>(null);

/** 上传文件按钮操作 */
const handleUpload = async (type: string, row?: any) => {
  reset();
  uploadedData.value = [];
  currentOperation.value = type as 'add' | 'replace';
  selectedImage.value = row || null;
  upload.open = true;
  upload.title = type === 'add' ? '添加素材图片' : '替换素材图片';
};

/** 图片上传成功 */
const handleImageUploadSuccess = (item: any, response: any) => {
  console.log('图片上传成功', item, response);
};

/** 图片上传错误 */
const handleImageUploadError = (item: any, error: any) => {
  console.log('图片上传错误', item, error);
};

/** 图片上传完成 */
const handleImageUploadComplete = async (uploadList: any[]) => {
  // 检查是否有上传成功的文件
  const successFiles = uploadList.filter((item) => item.status === 'success');
  if (successFiles.length === 0) {
    proxy?.$modal.msgError('没有文件上传成功');
    return;
  }

  if (currentOperation.value === 'replace') {
    // 替换操作
    uploadedData.value = successFiles.map((item) => ({
      file: item.file,
      name: item.name,
      imageUrl: item.response?.data?.imageUrl || '',
      imageThumbnail: item.response?.data?.imageThumbnail || item.response?.data?.imageUrl || ''
    }));
  } else {
    // 添加操作
    const formData = new FormData();
    uploadList.forEach((item, index) => {
      if (item.status === 'success' && item.response) {
        formData.append('files', item.file);
        formData.append('fileNames', item.name);
      }
    });

    const res = await uploadMaterialImages(formData);
    if (res.code === 200) {
      proxy?.$modal.msgSuccess('文件上传成功');
      uploadedData.value = res.data || [];
    } else {
      proxy?.$modal.msgError(res.msg || '上传失败');
    }
  }
};

/** 关闭上传对话框 */
const closeUploadDialog = () => {
  upload.open = false;
  uploadedData.value = [];
  currentOperation.value = 'add';
  selectedImage.value = null;
  if (folderUploadRef.value) {
    folderUploadRef.value.clearUploadList();
  }
};

/** 提交文件表单 */
const submitFileForm = async () => {
  if (uploadedData.value.length === 0) {
    proxy?.$modal.msgError('请先上传文件');
    return;
  }
  try {
    if (currentOperation.value === 'add') {
      // 添加操作：批量添加图片
      const dsMaterialLibraryImageList = Object.values(uploadedData.value).map((item: any) => ({
        imageUrl: item.imageUrl || '',
        imageThumbnail: item.imageThumbnail || item.imageUrl || '',
        name: item.name || '未命名素材'
      }));
      const requestData = {
        dsMaterialLibraryImageList,
        materialId: materialId.value
      };
      const res = await addMaterialImage(requestData);
      if (res.code === 200) {
        proxy?.$modal.msgSuccess('图片添加成功');
        upload.open = false;
        await getMaterialImageList();
        uploadedData.value = [];
      } else {
        proxy?.$modal.msgError(`添加图片失败: ${res.msg}`);
      }
    } else if (currentOperation.value === 'replace' && selectedImage.value) {
      // 替换操作：使用新的API替换单个图片
      const newImageData = uploadedData.value[0];
      if (!newImageData || !newImageData.file) {
        proxy?.$modal.msgError('请选择要替换的图片');
        return;
      }

      // 构建FormData，包含新图片文件
      const formData = new FormData();
      formData.append('file', newImageData.file);

      const res = await replaceMaterialImage(formData, selectedImage.value.id);
      if (res.code === 200) {
        proxy?.$modal.msgSuccess('图片替换成功');
        upload.open = false;
        await getMaterialImageList();
        uploadedData.value = [];
        selectedImage.value = null;
      } else {
        proxy?.$modal.msgError(`替换图片失败: ${res.msg}`);
      }
    }
  } catch (error) {
    proxy?.$modal.msgError('提交失败');
  }
};

const goBack = () => {
  router.go(-1);
};

/** 监听路由变化，重新获取数据 */
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.id) {
      materialId.value = newQuery.id as string | number;
      materialName.value = (newQuery.name as string) || '未知图片';
      queryParams.value.materialId = materialId.value;
      getMaterialImageList();
    }
  },
  { immediate: true }
);

onMounted(() => {
  const { id, name } = route.query;
  materialId.value = id as string | number;
  materialName.value = (name as string) || '未知图片';
  queryParams.value.id = materialId.value;
  getMaterialImageList();
});
</script>
