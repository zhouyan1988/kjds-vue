<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="字体名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入字体名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!--<el-form-item label="状态" prop="status">-->
            <!--  <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>-->
            <!--    <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />-->
            <!--  </el-select>-->
            <!--</el-form-item>-->
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
            <el-button v-hasPermi="['kjds:fonts:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['kjds:fonts:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['kjds:fonts:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <!--<el-col :span="1.5">-->
          <!--  <el-button v-hasPermi="['kjds:fonts:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>-->
          <!--</el-col>-->
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="fontsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" align="center" prop="id" />
        <el-table-column label="字体名称" align="center" prop="name" />
        <!--<el-table-column label="字体文件" align="center" prop="file" />-->
        <el-table-column label="字体预览图" align="center" prop="imgUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.imgUrl" :width="50" :height="50" />
          </template>
        </el-table-column>
        <!--<el-table-column label="状态" align="center" prop="status">-->
        <!--  <template #default="scope">-->
        <!--    <dict-tag :options="sys_common_status" :value="scope.row.status" />-->
        <!--  </template>-->
        <!--</el-table-column>-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['kjds:fonts:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['kjds:fonts:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- 添加或修改字体对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="fontsFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字体名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字体名称" />
        </el-form-item>
        <el-form-item label="字体文件" prop="file">
          <file-upload v-model="form.file" :limit="1" :file-size="20" :file-type="['woff2', 'woff', 'ttf']" accept=".woff2,.woff,.ttf" />
        </el-form-item>
        <el-form-item label="字体预览图" prop="img">
          <image-upload v-model="form.img" :limit="1" :file-size="5" />
        </el-form-item>
        <!--<el-form-item label="状态" prop="status">-->
        <!--  <el-radio-group v-model="form.status">-->
        <!--    <el-radio v-for="dict in sys_common_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>-->
        <!--  </el-radio-group>-->
        <!--</el-form-item>-->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Fonts" lang="ts">
import { ref } from 'vue';
import { listFonts, getFonts, delFonts, addFonts, updateFonts } from '@/api/kjds/fonts';
import { FontsVO, FontsQuery, FontsForm } from '@/api/kjds/fonts/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// const { sys_common_status } = toRefs<any>(proxy?.useDict('sys_common_status'));

const fontsList = ref<FontsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const fontsFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FontsForm = {
  id: undefined,
  name: undefined,
  file: undefined,
  img: undefined,
  status: undefined
};
const data = reactive<PageData<FontsForm, FontsQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '字体名称不能为空', trigger: 'blur' }],
    file: [{ required: true, message: '字体文件不能为空', trigger: 'blur' }],
    img: [{ required: true, message: '字体预览图不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询字体列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFonts(queryParams.value);
  fontsList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  fontsFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: FontsVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加字体';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FontsVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getFonts(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改字体';
};

/** 提交按钮 */
const submitForm = () => {
  fontsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFonts(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFonts(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FontsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除字体编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delFonts(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'kjds/fonts/export',
    {
      ...queryParams.value
    },
    `fonts_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
