<!--
 - DialogSelTpl 选择模板
 -->

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { cloneData } from '@deary/utils';
import { listCategoriesStyle } from '@/api/kjds/categoriesStyle';
import { CategoriesStyleVO } from '@/api/kjds/categoriesStyle/types';
import { getCategoryList } from '@/api/shop';
import { CategoryListVO } from '@/api/shop/types';
const router = useRouter();

interface queryParamsInterface {
  pageNum: number;
  pageSize: number;
  categoriesId?: number;
}

const emits = defineEmits(['confirm']);

const props = defineProps({
  title: {
    type: String,
    default: '选择模板'
  }
});

const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(true);
const total = ref<number>(0);
const queryParams = ref<queryParamsInterface>({
  pageNum: 1,
  pageSize: 8,
  categoriesId: 0
});

/*查询分类列表*/
const categoryOptions = ref<CategoryListVO[]>([]);
const getCategoriesList = () => {
  getCategoryList({
    pid: '1'
  }).then((res) => {
    categoryOptions.value = res?.data;
  });
};
const selectCategory = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/*查询产品列表*/
const productCurt = ref<number>(0);
const lists = ref<CategoriesStyleVO[]>([]);
const getList = async () => {
  const params = cloneData(queryParams.value);
  if (params.categoriesId === 0) {
    params.categoriesId = undefined;
  }
  loading.value = true;
  const res = await listCategoriesStyle(params);
  lists.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleClickCard = (idx: number) => {
  productCurt.value = idx;
};

const handleSizeChange = () => {
  productCurt.value = 0;
  getList();
};

const open = () => {
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const confirm = () => {
  const selProduct: CategoriesStyleVO = lists.value[productCurt.value];
  if (!selProduct) {
    return;
  }

  emits('confirm', selProduct);
  close();
};

getCategoriesList();
getList();

const handleAdd = () => {
  close();

  router.push('/artworks/index');
};

defineExpose({
  open,
  close
});
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" width="1000px">
    <div>
      <div class="l-top">
        <el-button type="primary" class="l-top-add" @click="handleAdd">新建模版</el-button>
        <el-select v-model="queryParams.categoriesId" class="mb-20px" placeholder="请选择类别" @change="selectCategory">
          <el-option label="全部" :value="0" />
          <el-option v-for="item in categoryOptions" :key="item.id_category" :label="item.name" :value="item.id_category" />
        </el-select>
      </div>
      <div v-loading="loading" class="l-content">
        <template v-if="lists && lists.length">
          <el-row :gutter="20">
            <el-col v-for="(i, idx) in lists" :key="idx" :span="6">
              <el-card class="l-card cursor-pointer" :class="{ 'card-active': productCurt === idx }" @click="handleClickCard(idx)">
                <el-image style="width: 100%; height: 177px" :src="i.definitionImageUrl" fit="cover" />
                <template #footer>
                  <div>
                    <div class="mb-10px">名称：{{ i.name }}</div>
                    <div>
                      <div>设计时间：</div>
                      <span class="size-box">{{ i.createTime }}</span>
                    </div>
                  </div>
                </template>
              </el-card>
            </el-col>
          </el-row>
          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            :page-sizes="[8, 12, 16, 24]"
            @pagination="handleSizeChange"
          />
        </template>
        <el-empty v-else description="暂无模板" />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close"> 取消 </el-button>
        <el-button type="primary" @click="confirm"> 确定 </el-button>
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
