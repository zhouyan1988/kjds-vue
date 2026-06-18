<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="素材库名称" prop="name" label-width="90px">
              <el-input v-model="queryParams.name" placeholder="请输入素材库名称" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['material:add']" type="primary" plain icon="Plus" @click="handleUpload('add')">新增素材库</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['material:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              批量删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain @click="handleUpload('folder')">
              <el-icon><UploadFilled /></el-icon>&nbsp;上传文件
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getMaterialList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="materialList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" align="center" prop="id" />
        <el-table-column label="素材名称" align="center" prop="name" />
        <el-table-column label="素材图片" align="center" prop="imageList" width="100">
          <template #default="scope">
            <div class="image-group">
              <image-preview v-for="(img, index) in scope.row.imageList" :key="index" :src="img" :width="50" :height="50" style="margin-right: 5px" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="图片列表" placement="top">
              <el-button link type="primary" plain @click.stop="handleRowClick(scope.row)">
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button v-hasPermi="['material:copy']" link type="primary" plain @click.stop="handleCopy(scope.row)">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['material:edit']" link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['material:remove']" link type="primary" icon="Delete" @click.stop="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getMaterialList"
      />
    </el-card>
    <!-- 添加/上传素材库对话框 -->
    <el-dialog v-if="upload.open" v-model="upload.open" :title="upload.title" width="800px" append-to-body>
      <el-form v-if="upload.type !== 'folder'" ref="MaterialFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="素材名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="素材封面" prop="name">
          <folder-upload
            ref="folderUploadRef"
            :action="upload.url"
            :headers="upload.headers"
            :custom-upload="true"
            upload-mode="file"
            @upload-success="handleFolderUploadSuccess"
            @upload-error="handleFolderUploadError"
            @upload-complete="handleFolderUploadComplete"
          />
        </el-form-item>
      </el-form>
      <folder-upload
        v-if="upload.type === 'folder'"
        ref="folderUploadRef"
        :action="upload.url"
        :headers="upload.headers"
        :custom-upload="true"
        upload-mode="folder"
        @upload-success="handleFolderUploadSuccess"
        @upload-error="handleFolderUploadError"
        @upload-complete="handleFolderUploadComplete"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :disabled="uploadedData.length === 0" @click="submitFileForm">确 定</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 修改素材库名称对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="MaterialFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="素材库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入素材库名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="closeUploadDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Material" lang="ts">
import { ref, reactive } from 'vue';
import { listMaterial, detailMaterial, updateMaterial, copyMaterial, delMaterial, uploadMaterialImages, addMaterialFolder } from '@/api/material';
import { MaterialVO, MaterialQuery, MaterialForm } from '@/api/material/types';
import { globalHeaders } from '@/utils/request';
import { useRouter } from 'vue-router';
import FolderUpload from '@/components/FolderUpload/index.vue';
import { DocumentCopy, Picture, UploadFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const showSearch = ref(true);
const folderUploadRef = ref();

const initFormData: MaterialForm = {
  id: undefined,
  name: undefined
};
const data = reactive<PageData<MaterialForm, MaterialQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '素材名称不能为空', trigger: 'blur' }]
  }
});
const { queryParams, form, rules } = toRefs(data);

const materialList = ref<MaterialVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const total = ref(0);
/** 查询素材列表 */
const getMaterialList = async () => {
  loading.value = true;
  const res = await listMaterial(queryParams.value);
  materialList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 点击行跳转到图片列表 */
const handleRowClick = (row: MaterialVO) => {
  router.push({
    name: 'MaterialImageList',
    query: {
      id: row.id,
      name: row.name
    }
  });
};

const queryFormRef = ref<ElFormInstance>();

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getMaterialList();
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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const MaterialFormRef = ref<ElFormInstance>();
/** 弹框表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  MaterialFormRef.value?.resetFields();
};
/** 修改按钮操作 */
const handleUpdate = async (row?: MaterialVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  // 这里需要实现获取素材详情的逻辑
  const res = await detailMaterial(_id);
  Object.assign(form.value, res.data);
  form.value.id = _id;
  dialog.visible = true;
  dialog.title = '修改素材库';
};
const submitForm = () => {
  MaterialFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await updateMaterial(form.value).finally(() => (buttonLoading.value = false));
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getMaterialList();
    }
  });
};

/** 复制按钮操作 */
const handleCopy = (row: any) => {
  ElMessageBox.confirm('确定复制该素材库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    copyMaterial(row.id).then((res) => {
      if (res.code == 200) {
        ElMessage({
          message: '复制成功',
          type: 'success'
        });
        getMaterialList();
      } else {
        ElMessage({
          message: res.msg,
          type: 'error'
        });
      }
    });
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: MaterialVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除编号为"' + _ids + '"的素材？').finally(() => (loading.value = false));
  // 确保传入的是数组类型，并转换为number类型
  const idsToDelete = Array.isArray(_ids) ? _ids.map((id) => Number(id)) : [Number(_ids)];
  await delMaterial(idsToDelete);
  proxy?.$modal.msgSuccess('删除成功');
  await getMaterialList();
};

const upload = reactive<ImportOption>({
  // 是否显示弹出层（上传素材）
  open: false,
  // 弹出层标题（上传素材）
  title: '',
  // 上传类型：folder-上传文件夹，add-新增素材库
  type: 'folder',
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/materialLibrary/updateMaterialImage'
});

// 保存上传成功返回的数据
const uploadedData = ref<any[]>([]);

/** 上传文件按钮操作 */
const handleUpload = async (type: string) => {
  reset();
  uploadedData.value = [];
  upload.open = true;
  upload.type = type;
  upload.title = type === 'folder' ? '上传素材库' : '新增素材库';
};

/** 文件夹上传成功 */
const handleFolderUploadSuccess = (item: any, response: any) => {
  console.log('文件夹上传成功', item, response);
};

/** 文件夹上传错误 */
const handleFolderUploadError = (item: any, error: any) => {
  console.log('文件夹上传错误', item, error);
};

/** 文件夹上传完成 */
const handleFolderUploadComplete = async (uploadList: any[]) => {
  const formData = new FormData();
  uploadList.forEach((item, index) => {
    if (item.status === 'success' && item.response) {
      // 根据接口要求添加文件数据
      formData.append('files', item.file);
      formData.append('fileNames', item.name);
      formData.append('folderNames', item.folderName);
    }
  });
  // 检查是否有上传成功的文件
  const successFiles = uploadList.filter((item) => item.status === 'success');
  if (successFiles.length === 0) {
    proxy?.$modal.msgError('没有文件上传成功');
    return;
  }
  const res = await uploadMaterialImages(formData);
  if (res.code === 200) {
    proxy?.$modal.msgSuccess('文件上传成功');
    uploadedData.value = res.data || [];
  } else {
    proxy?.$modal.msgError(res.msg || '上传失败');
  }
};

/** 关闭上传对话框 */
const closeUploadDialog = () => {
  dialog.visible = false;
  upload.open = false;
  uploadedData.value = [];
  // 清空上传进度
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

  if (upload.type === 'add') {
    const valid = await MaterialFormRef.value?.validate().catch(() => false);
    if (!valid) {
      proxy?.$modal.msgError('请填写完整的表单信息');
      return;
    }
  }

  try {
    const dsMaterialLibraryImageList = Object.values(uploadedData.value).map((item: any) => ({
      imageUrl: item.imageUrl || '',
      imageThumbnail: item.imageThumbnail || item.imageUrl || '',
      name: item.name || '未命名素材'
    }));

    // 根据操作类型决定使用哪个名称
    let folderName;
    if (upload.type === 'add' && form.value.name) {
      // 新增素材库：使用表单中的素材名称
      folderName = form.value.name;
    } else {
      // 上传文件夹：使用文件夹名称
      const firstItem = Object.values(uploadedData.value)[0];
      folderName = firstItem?.folderName || firstItem?.name?.split('/')[0] || '默认文件夹';
    }

    const requestData = {
      dsMaterialLibraryImageList,
      folderName
    };
    const res = await addMaterialFolder(requestData);
    if (res.code === 200) {
      proxy?.$modal.msgSuccess('素材库记录创建完成');
      upload.open = false;
      await getMaterialList();
      uploadedData.value = [];
    } else {
      proxy?.$modal.msgError(`创建素材库记录失败: ${res.msg}`);
    }
  } catch (error) {
    proxy?.$modal.msgError('提交失败');
  }
};

onMounted(() => {
  getMaterialList();
});
</script>
