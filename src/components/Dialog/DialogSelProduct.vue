<!--
 - DialogSelProduct 选择产品
 -->

<script lang="ts" setup>
import { ref } from 'vue';
import { cloneData, removeHtmlTags } from '@deary/utils';
import { getCategoryList, getCategoryProductList } from '@/api/shop';
import { CategoryListVO, CategoryProductListDataVO } from '@/api/shop/types';

interface queryParamsInterface {
  pageNum: number;
  pageSize: number;
  categories?: number;
  cate_id?: string;
}

const emits = defineEmits(['confirm']);

const props = defineProps({
  title: {
    type: String,
    default: '选择产品'
  }
});

const dialogVisible = ref<boolean>(false);
const loading = ref<boolean>(true);
const total = ref<number>(0);
const queryParams = ref<queryParamsInterface>({
  pageNum: 1,
  pageSize: 8,
  categories: 0
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
  handleQuery();
};

/*查询产品列表*/
const productCurt = ref<number>(0);
const productList = ref<CategoryProductListDataVO[]>([]);
const getProductList = async () => {
  const params = cloneData(queryParams.value);
  if (params.categories === 0) {
    params.cate_id = undefined;
  } else {
    params.cate_id = String(params.categories);
  }
  loading.value = true;
  const res = await getCategoryProductList({
    page: params.pageNum,
    limit: params.pageSize,
    cate_id: params.cate_id
  });
  const data = res?.data;
  productList.value = data?.data;
  total.value = data?.count;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  productCurt.value = 0;
  getProductList();
};

const handleClickCard = (idx: number) => {
  productCurt.value = idx;
};

const handleSizeChange = () => {
  productCurt.value = 0;
  getProductList();
};

const open = () => {
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const confirm = () => {
  const selProduct: CategoryProductListDataVO = productList.value[productCurt.value];
  if (!selProduct) {
    return;
  }

  emits('confirm', selProduct);
  close();
};

getCategoriesList();
getProductList();

defineExpose({
  open,
  close
});
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" width="1000px">
    <div>
      <el-select v-model="queryParams.categories" class="mb-20px" placeholder="请选择类别" @change="selectCategory">
        <el-option label="全部" :value="0" />
        <el-option v-for="item in categoryOptions" :key="item.id_category" :label="item.name" :value="item.id_category" />
      </el-select>
      <div v-loading="loading" class="l-content">
        <template v-if="productList && productList.length">
          <el-row :gutter="20">
            <el-col v-for="(i, idx) in productList" :key="idx" :span="6">
              <el-card class="l-card cursor-pointer" :class="{ 'card-active': productCurt === idx }" @click="handleClickCard(idx)">
                <el-image style="width: 100%; height: 177px" :src="i.image" fit="cover" />
                <template #footer>
                  <div>
                    <div class="mb-10px l-card-name">名称：{{ i.name }}</div>
                    <div class="mb-10px">品牌：{{ i.manufacturer_name || '--' }}</div>
                    <div class="l-card-desc">简述：{{ removeHtmlTags(i.description_short) || '--' }}</div>
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
        <el-empty v-else description="暂无产品" />
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
.l-content {
  .l-card {
    margin-bottom: 20px;
  }
  .card-active {
    border-color: rgb(1, 173, 196);
  }
}
.size-box {
  color: #fff;
  padding: 3px;
  border-radius: 3px;
  background: rgb(1, 173, 196);
}

.l-card-name,
.l-card-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
