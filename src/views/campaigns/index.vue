<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd"> 新增 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="productMergeStyleList">
        <el-table-column label="图像" align="center" prop="imageUrl">
          <template #default="scope">
            <ImagePreview :width="50" :height="50" :src="scope.row.imageUrl" :preview-src-list="[scope.row.imageUrl]" />
          </template>
        </el-table-column>
        <el-table-column label="名称" align="center" prop="name" />
        <!--<el-table-column label="设计人" align="center" prop="createByName" />-->
        <el-table-column label="设计时间" align="center" prop="createTime" />
        <el-table-column label="是否启用" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button type="primary" @click="handleUpdate(scope.row)"> 编辑 </el-button>
            <el-button type="danger" @click="handleDelete(scope.row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <dialog-sel-product ref="dialogSelProductRef" @confirm="handleSelProduct"></dialog-sel-product>
  </div>
</template>

<script setup name="ProductMergeStyle" lang="ts">
import { listProductMergeStyle, delProductMergeStyle, updateProductMergeStyleStatus } from '@/api/kjds/productMergeStyle';
import { ProductMergeStyleVO, ProductMergeStyleQuery, ProductMergeStyleForm } from '@/api/kjds/productMergeStyle/types';
import ImagePreview from '@/components/ImagesPreview/index.vue';
import { CategoryProductListDataVO } from '@/api/shop/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const router = useRouter();
const productMergeStyleList = ref<ProductMergeStyleVO[]>([]);

const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const dialogSelProductRef = ref<ElFormInstance>();

const initFormData: ProductMergeStyleForm = {
  id: undefined,
  imageUrl: undefined,
  name: undefined,
  productId: undefined,
  styleId: undefined,
  status: undefined
};
const data = reactive<PageData<ProductMergeStyleForm, ProductMergeStyleQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    imageUrl: undefined,
    name: undefined,
    productId: undefined,
    styleId: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    imageUrl: [{ required: true, message: '图像地址不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    productId: [{ required: true, message: '产品id不能为空', trigger: 'blur' }],
    styleId: [{ required: true, message: '风格id不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品组合风格图列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProductMergeStyle(queryParams.value);
  productMergeStyleList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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

/** 新增按钮操作 */
const handleAdd = () => {
  dialogSelProductRef.value?.open();
};

/** 修改按钮操作 */
const handleUpdate = (row?: ProductMergeStyleVO) => {
  router.push('/campaigns/add' + '?productId=' + row.productId + '&combinationId=' + row.id + '&styleId=' + row.styleId);
};

const handleSelProduct = (ev: CategoryProductListDataVO) => {
  // 跳页面，新增订单
  router.push('/campaigns/add?productId=' + ev.id_product);
};

/** 删除按钮操作 */
const handleDelete = async (row?: ProductMergeStyleVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除产品组合的数据项？').finally(() => (loading.value = false));
  await delProductMergeStyle(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 状态修改  */
const handleStatusChange = async (row: ProductMergeStyleVO) => {
  let text = row.status === '0' ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.id + '"吗?');
    await updateProductMergeStyleStatus({
      id: row.id,
      productId: row.productId,
      status: row.status
    });
    await getList();
    proxy?.$modal.msgSuccess(text + '成功');
  } catch {
    return;
  } finally {
    row.status = row.status === '0' ? '1' : '0';
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped></style>
