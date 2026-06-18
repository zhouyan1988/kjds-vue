<template>
  <div class="Box">
    <el-row :gutter="10">
      <el-col :lg="24" :xs="24" style="">
        <div class="comBox">
          <span>选择类别</span>
          <el-tabs v-model="categoriesId" v-loading="loading" tab-position="left" class="demo-tabs" @tab-change="changeTab">
            <el-tab-pane v-for="item in categoryOptions" :key="item.id_category" :name="item.id_category">
              <template #label>
                <span class="custom-tabs-label">
                  <span>{{ item.name }}</span>
                </span>
              </template>
              <div class="searchBox">
                <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                  <el-form-item prop="name">
                    <el-input v-model="queryParams.name" placeholder="搜索关键词" clearable @keyup.enter="handleQuery" />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
              <el-card shadow="never">
                <template #header>
                  <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5"></el-col>
                    <el-col :span="1.5">
                      <el-button type="primary" plain @click="handleAdd()">新增</el-button>
                    </el-col>
                  </el-row>
                </template>
                <el-table v-loading="loading" :data="designList">
                  <el-table-column prop="definitionImageUrl" label="图像">
                    <template #default="scope">
                      <ImagePreview :src="scope.row.definitionImageUrl" :width="50" :height="50" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="标题" width="180" />
                  <el-table-column prop="categoriesName" label="类别" />
                  <el-table-column prop="templateLength" label="图稿尺寸">
                    <template #default="scope"> {{ scope.row.length }} * {{ scope.row.width }} </template>
                  </el-table-column>
                  <el-table-column prop="type" label="图稿格式">
                    <template #default="scope">
                      {{ scope.row.type == 0 ? 'PNG' : 'JPG' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" />
                  <!--<el-table-column prop="createByName" label="设计人" />-->
                  <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="257" fixed="right">
                    <template #default="scope">
                      <el-button type="warning" plain @click="handleCopy(scope.row)"> 复制 </el-button>
                      <el-button type="primary" plain @click="handleUpdate(scope.row)"> 编辑 </el-button>
                      <el-button type="danger" plain @click="handleDelete(scope.row)"> 删除 </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <pagination
                  v-show="total > 0"
                  v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize"
                  :total="total"
                  @pagination="getList"
                />
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
    <!-- 添加或修改设计对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="categoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <!--类别-->
        <el-form-item label="类别" prop="categoriesId">
          <el-select v-model="form.categoriesId" placeholder="请选择类别">
            <el-option v-for="item in categoryFormOptions" :key="item.id_category" :label="item.name" :value="item.id_category" />
          </el-select>
        </el-form-item>
        <el-form-item label="宽度" prop="width">
          <el-input v-model="form.width" placeholder="请输入宽度" type="number" min="0" />
        </el-form-item>

        <el-form-item label="高度" prop="length">
          <el-input v-model="form.length" placeholder="请输入高度" type="number" min="0" />
        </el-form-item>
        <el-form-item label="格式" prop="type">
          <el-select v-model="form.type" placeholder="请选择格式">
            <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
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

<script setup name="Artworks" lang="ts">
import Pagination from '@/components/Pagination/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { addCategoriesStyle, copyCategoriesStyle, delCategoriesStyle, listCategoriesStyle } from '@/api/kjds/categoriesStyle';
import ImagePreview from '@/components/ImagesPreview/index.vue';
import { getCategoryList } from '@/api/shop';
import { CategoryListVO } from '@/api/shop/types';
import { cloneData } from '@deary/utils';
import { CategoriesStyleVO } from '@/api/kjds/categoriesStyle/types';

const router = useRouter();

const buttonLoading = ref<boolean>(false);
const loading = ref<boolean>(true);
const queryFormRef = ref<any>();
const categoryFormRef = ref<any>();
const total = ref<number>(0);
const categoriesId = ref<number>(0);
const categoryOptions = ref<CategoryListVO[]>([]);
const categoryFormOptions = ref<CategoryListVO[]>([]);
const dialog = reactive<any>({
  visible: false,
  title: ''
});
const typeOptions = ref<any>([
  { id: 0, name: 'PNG' },
  { id: 1, name: 'JPG' }
]);
const designList = ref<CategoriesStyleVO[]>([]);
const initFormData: any = {
  id: undefined,
  name: undefined,
  length: undefined,
  width: undefined,
  type: undefined
};

const data: any = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined
  },
  rules: {
    id: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '格式不能为空', trigger: 'change' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    categoriesId: [{ required: true, message: '类别不能为空', trigger: 'change' }],
    length: [{ required: true, message: '高度不能为空', trigger: 'blur' }],
    width: [{ required: true, message: '宽度不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const changeTab = () => {
  handleQuery();
};

const getCotegory = async () => {
  getCategoryList({
    pid: '1'
  }).then((res) => {
    const data = cloneData(res?.data);
    // 首位添加全部
    data?.unshift({
      id_category: 0,
      name: '全部'
    });
    categoryOptions.value = data;
    categoryFormOptions.value = cloneData(res?.data);
    getList();
  });
};

const getList = async () => {
  loading.value = true;
  const params = cloneData(queryParams.value);
  if (categoriesId.value === 0) {
    params.categoriesId = undefined;
  } else {
    params.categoriesId = String(categoriesId.value);
  }
  await listCategoriesStyle(params).then((res) => {
    res.rows.forEach((i) => {
      // 根据分类id，获取分类名称
      const category = categoryOptions.value.find((i2) => i2.id_category === i.categoriesId);
      i.categoriesName = category?.name;
    });
    designList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

const submitForm = () => {
  // 跳页面，新增订单
  categoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await addCategoriesStyle(form.value).then((res) => {
        if (res.code == 200) {
          dialog.visible = false;
          if (res.data) {
            router.push('/artworks/details?styleId=' + res.data);
          } else {
            console.error('categoriesStyle 新建返回ID为空');
            getList();
          }
        } else {
          ElMessage({
            message: res.msg,
            type: 'error'
          });
          dialog.visible = false;
        }
      });
    }
  });
};
const cancel = () => {
  dialog.visible = false;
};
/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  categoryFormRef.value?.resetFields();
};
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增模版';
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const resetQuery = () => {
  queryParams.value.name = undefined;
  handleQuery();
};
/**
 * 复制模版
 * @param row
 */
const handleCopy = (row: any) => {
  let id = row.id;
  ElMessageBox.confirm('确定复制该模版吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    copyCategoriesStyle({ id: id }).then((res) => {
      if (res.code == 200) {
        ElMessage({
          message: '复制成功',
          type: 'success'
        });
        getList();
      } else {
        ElMessage({
          message: res.msg,
          type: 'error'
        });
      }
    });
  });
};
const handleUpdate = (row: any) => {
  //编辑
  router.push('/artworks/details?styleId=' + row.id);
};
const handleDelete = (row: any) => {
  let id = row.id;
  ElMessageBox.confirm('是否确认删除', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delCategoriesStyle(id).then((res) => {
      if (res.code == 200) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        });
        getList();
      } else {
        ElMessage({
          message: res.msg,
          type: 'error'
        });
      }
    });
  });
};

onMounted(() => {
  getCotegory();
});
</script>
<style scoped>
.typeBox {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  height: 500px;
}
.typeItem {
  width: 200px;
  border: 1px solid red;
  /* height: 200px; */
  /* margin: 10px; */
}
.sizeBox {
  color: #fff;
  padding: 3px;
  border-radius: 3px;
  background: rgb(1, 173, 196);
}
.comBox {
  padding: 10px 0 0 10px;
  box-sizing: border-box;
  background: #fff;

  :deep(.el-card) {
    display: flex;
    flex-direction: column;
  }
  :deep(.el-card-header) {
    height: 50px;
    line-height: 50px;
  }
  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  :deep(.el-tabs) {
    height: 100%;

    width: 100%;
    flex: 1;
    display: flex;
    /* flex-direction: column; */
  }
  :deep(.el-tabs__header) {
    padding: 0;
    /* height: calc(100vh - 260px); */
  }

  :deep(.el-tabs__content) {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    .el-table {
      flex: 1;
    }
  }
}
.el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.paginationBox {
  /* 页码 */
  width: 100%;
  /* margin-top: 10px; */
  height: 50px;
  line-height: 50px;
  display: flex;
  justify-content: flex-end;
}
.Box {
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
}
.custom-tabs-label {
  width: 200px;
  /* padding: 0 20px; */
  display: flex;
  justify-content: space-between;
}
.searchBox {
  padding-top: 10px;
  padding-left: 10px;
  box-sizing: border-box;
}
</style>
