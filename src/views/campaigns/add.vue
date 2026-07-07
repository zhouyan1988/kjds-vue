<template>
  <div class="campaigns-add-box">
    <div class="l-top-box">
      <el-button type="primary" @click="back"> 返回</el-button>
      <el-button v-if="showBuffer" type="primary" :loading="buttonLoading" @click="saveCombination"> 保存</el-button>
    </div>
    <div class="l-content-box">
      <el-row :gutter="10">
        <!-- 左侧 -->
        <el-col :lg="5" :xs="24">
          <el-card shadow="hover">
            <template #header>
              <span style="color: #327ff1">属性</span>
            </template>
            <template v-if="!showBuffer">
              <el-button type="primary" style="width: 100%; margin-bottom: 20px" @click="addBtn"> 添加模版</el-button>
            </template>
            <template v-else>
              <div class="imgeInfo">
                <img :src="styleData?.definitionImageUrl" style="width: 80px; height: 80px; margin-right: 10px" alt="" />
                <div>{{ styleData?.name }}</div>
                <div class="editBOX">
                  <Icon class="mr-5px cursor-pointer" type="md-create" :size="20" @click="editTempl" />
                  <Icon class="cursor-pointer" type="md-close" :size="20" @click="deleteTempl" />
                </div>
              </div>
              <!-- 价格 -->
              <div class="price">设置价格</div>
              <el-table :data="templateOptions" style="width: 100%" border height="400">
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="price" label="销售价格">
                  <template #default="scope">
                    <el-input
                      v-model="scope.row.price"
                      :disabled="priceDisabledBuffer"
                      placeholder="价格"
                      style="width: 100%"
                      type="number"
                      min="0"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <div class="confirmBox">
                <el-button type="primary" @click="confirmCombinationPrice">确定</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
        <!-- 中 -->
        <el-col :lg="14" :xs="24">
          <el-card v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)" shadow="hover">
            <div ref="carouselRef" class="l-content-carousel">
              <div class="konvajs-content" :style="{ width: carouselWidth + 'px', height: carouselHeight + 'px' }">
                <canvas ref="canvasRef" :style="{ width: carouselWidth + 'px', height: carouselHeight + 'px' }"></canvas>
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- 右侧 -->
        <el-col v-if="showBuffer" :lg="5" :xs="24">
          <el-card shadow="hover">
            <el-form label-position="top" label-width="80px">
              <el-form-item>
                <template #label>
                  {{ productMergeStyleData?.templateOptionLabel }}
                  <Icon type="ios-create-outline" class="cursor-pointer" @click.stop="editTemplateOptionLabel" />
                </template>
                <el-select v-model="selCurtTempl" placeholder="请选择定制模版" @change="changeTempl">
                  <el-option v-for="(item, index) in styleDataTempls" :key="index" :label="item.name" :value="item.name" />
                </el-select>
              </el-form-item>
            </el-form>
            <div class="templatImage">
              <div v-for="(i, idx) in templJsonObjects" :key="idx">
                <!--选项-->
                <template v-if="i?.type === EditorTypeEnum.Options && i?.optDisplayMode && fabricCanvasEditor.isCanRenderTempl(i)">
                  <div class="title">
                    {{ i.lLabel || '选项' }}
                    <Tooltip placement="top" transfer>
                      <Icon type="ios-create-outline" class="cursor-pointer" @click.stop="editOptionsPrice(i)" />
                      <template #content>
                        <span style="white-space: normal">设置额外的附加价格</span>
                      </template>
                    </Tooltip>

                    <Tooltip v-if="i.lHelpText" placement="top" transfer>
                      <Icon type="ios-alert-outline" />
                      <template #content>
                        <span style="white-space: normal">{{ i.lHelpText }}</span>
                      </template>
                    </Tooltip>
                  </div>
                  <div>
                    <!--下拉框-->
                    <template v-if="i?.optDisplayMode === OptionsDisplayMode.Dropdown">
                      <Select v-model="i.optDefVal" @on-change="changeOptions">
                        <Option v-for="item in i?.optArres" :key="item.value" :value="item.value">{{ item.label }}</Option>
                      </Select>
                    </template>
                    <!--按钮-->
                    <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Button">
                      <RadioGroup v-model="i.optDefVal" type="button" button-style="solid" @on-change="changeOptions">
                        <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                          <span>{{ item.label }}</span>
                        </Radio>
                      </RadioGroup>
                    </template>
                    <!--图像切换器-->
                    <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Image">
                      <RadioGroup v-model="i.optDefVal" class="l-radio-group-img" @on-change="changeOptions">
                        <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                          <Image class="l-radio-group-image" :src="item.image" fit="contain" width="70px" height="70px">
                            <template #placeholder> &nbsp;&nbsp; </template>
                          </Image>
                        </Radio>
                      </RadioGroup>
                    </template>
                    <!--颜色切换器-->
                    <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Color">
                      <RadioGroup v-model="i.optDefVal" class="l-radio-group-color" @on-change="changeOptions">
                        <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                          <div class="l-radio-group-color-item" :style="{ backgroundColor: item.color }"></div>
                        </Radio>
                      </RadioGroup>
                    </template>
                    <!--图像颜色切换器-->
                    <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.ImageColor">
                      <RadioGroup v-model="i.optDefVal" class="l-radio-group-img" @on-change="changeImageColorOptions">
                        <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                          <Image class="l-radio-group-image" :src="item.image" fit="contain" width="70px" height="70px">
                            <template #placeholder> &nbsp;&nbsp; </template>
                          </Image>
                        </Radio>
                      </RadioGroup>
                    </template>
                    <!--切换-->
                    <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Toggle">
                      <span class="mr-10px">{{ i?.optToggle?.label }}</span>
                      <Switch v-model="i.optToggle.enable" @on-change="changeOptions" />
                    </template>
                  </div>
                </template>
                <!--文字-->
                <template
                  v-if="
                    (i?.type === EditorTypeEnum.IText || i?.type === EditorTypeEnum.TextBox) &&
                    i?.personalized &&
                    fabricCanvasEditor.isCanRenderTempl(i)
                  "
                >
                  <div class="title">
                    {{ i.lLabel || 'Text customization' }}
                    <Tooltip placement="top" transfer>
                      <Icon type="ios-create-outline" class="cursor-pointer" @click.stop="editTextConfig(i)" />
                      <template #content>
                        <span style="white-space: normal">设置文字配置</span>
                      </template>
                    </Tooltip>
                    <Tooltip v-if="i.lHelpText" placement="top" transfer>
                      <Icon type="ios-alert-outline" />
                      <template #content>
                        <span style="white-space: normal">{{ i.lHelpText }}</span>
                      </template>
                    </Tooltip>
                  </div>
                  <el-input
                    v-model="templJsonObjects[idx].text"
                    :minlength="inputMinLength(i)"
                    :maxlength="inputMaxLength(i)"
                    :placeholder="i.lPlaceholder || '请输入定制文字'"
                    @input="changeText(i, { line: inputLineLength(i) })"
                  ></el-input>
                </template>
                <!--图片-->
                <template v-if="i?.type === EditorTypeEnum.Image && (i?.personalized || i?.userupload) && fabricCanvasEditor.isCanRenderTempl(i)">
                  <div class="title">
                    {{ i.lLabel || 'Image customization' }}
                    <Tooltip v-if="i.lHelpText" placement="top" transfer>
                      <Icon type="ios-alert-outline" />
                      <template #content>
                        <span style="white-space: normal">{{ i.lHelpText }}</span>
                      </template>
                    </Tooltip>
                  </div>
                  <div v-if="i?.personalized" class="imgBox">
                    <RadioGroup v-model="i.src" class="l-personalized-img" @on-change="changeImage(i, $event)">
                      <Radio v-for="(item, index) in i?.personalizedImgs" :key="index" :label="item.src">
                        <div class="l-personalized-img-radio">
                          <Image class="l-personalized-image" :src="item.src" fit="contain" width="70px" height="70px">
                            <template #placeholder> &nbsp;&nbsp; </template>
                          </Image>
                          <div v-if="item.name" class="l-personalized-image-text">{{ getName(item.name) }}</div>
                          <div v-else class="l-personalized-image-text">&nbsp;&nbsp;</div>
                        </div>
                      </Radio>
                    </RadioGroup>
                    <div v-if="i.src" class="postionSelect" style="display: none !important">
                      <template v-for="(di, didx) in designAttr.design_option_result">
                        <div v-if="di.title === 'design_image'" :key="`postion_personalized_${i.id || idx}_` + didx" style="display: none !important">
                          <input class="design_image" type="hidden" name="design_option_images[]" :value="i.src" />
                          <input type="hidden" name="design_option_ids[images][]" :value="di.id_design_option" />
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-else-if="i?.userupload" class="imgBox">
                    <div class="imgList">
                      {{ $t('upload') }}
                      <div class="img-upload" @click.stop="changeUploadImage(i)">
                        <div v-if="!i?.src" class="img-upload-inner">
                          <Icon type="ios-cloud-upload-outline" size="30" color="#ee3c54" />
                        </div>
                          <div v-else class="img-upload-inner">
                            <img :src="i.src" alt="" style="width: 100%; height: 100%" />
                          </div>
                        </div>
                        <div v-if="i.src" class="postionSelect" style="display: none !important">
                          <template v-for="(di, didx) in designAttr.design_option_result">
                            <div v-if="di.title === 'design_image'" :key="`postion_upload_${i.id || idx}_` + didx" style="display: none !important">
                              <input class="design_image" type="hidden" name="design_option_images[]" :value="i.src" />
                              <input type="hidden" name="design_option_ids[images][]" :value="di.id_design_option" />
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                </template>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <dialog-sel-tpl ref="dialogSelTplRef" @confirm="selectTempl"></dialog-sel-tpl>
      <dialog-edit-tpl ref="dialogEditTplRef" @confirm="confirmEditTemplateOptionLabel"></dialog-edit-tpl>
      <dialog-edit-options-price ref="dialogEditOptionsPriceRef" @confirm="confirmEditOptionsPrice"></dialog-edit-options-price>
      <dialog-edit-text-config ref="dialogEditTextConfigRef" @confirm="confirmTextConfig"></dialog-edit-text-config>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { EditorTypeEnum, FabricObjectVO, OptionsDisplayMode } from '@/utils/editor';
import { getProductDetail, getProductTemplateId } from '@/api/shop';
import { useCanvasEditor, UseCanvasEditorTypeEnum } from '@/utils/FabricCanvasEditorUse';
import { Icon, Image, Option, Radio, RadioGroup, Tooltip } from 'view-ui-plus';
import { textConfigItemVo } from '@/api/kjds/productMergeStyle/types';

const route = useRoute();

// 解构路由 query 参数
const { productId, id_currency, id_shop, styleId, combinationId } = route.query;

const {
  id_design_template,
  ps_design_templates,
  getTemplateOptions,
  loading,
  carouselWidth,
  carouselHeight,
  styleData,
  styleDataTempls,
  selCurtTempl,
  templJsonObjects,
  showBuffer,
  priceDisabledBuffer,
  buttonLoading,
  templateOptions,
  fabricCanvasEditor,
  productMergeStyleData,
  initCanvas,
  selectTempl,
  editTempl,
  deleteTempl,
  changeTempl,
  changeText,
  changeImage,
  changeUploadImage,
  changeOptions,
  changeImageColorOptions,
  confirmCombinationPrice,
  saveCombination,
  back,
  getCurtTextConfig
} = useCanvasEditor();

const carouselRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const dialogSelTplRef = ref<HTMLElement | null>(null);
const dialogEditTplRef = ref<HTMLElement | null>(null);
const dialogEditOptionsPriceRef = ref<HTMLElement | null>(null);
const dialogEditTextConfigRef = ref<HTMLElement | null>(null);

const inputMinLength = computed(() => (i: FabricObjectVO) => {
  const { min } = getCurtTextConfig(i);
  return min ?? undefined;
});

const inputMaxLength = computed(() => (i: FabricObjectVO) => {
  const { max } = getCurtTextConfig(i);
  return max ?? undefined;
});

const inputLineLength = computed(() => (i: FabricObjectVO) => {
  const { line } = getCurtTextConfig(i);
  return line ?? 1;
});

/** 添加图稿 */
const addBtn = () => {
  // @ts-expect-error: open 组件方法
  dialogSelTplRef.value?.open();
};

/** 获取产品详情并初始化画布 */
const getProductData = async () => {
  if (!productId) return;
  try {
    const productTemplate = await getProductTemplateId({ id: productId as string });
    if (productTemplate && productTemplate.data && productTemplate.data.template_id) {
      id_design_template.value = productTemplate.data.template_id;
      getTemplateOptions(id_design_template.value);
    } else {
      ElMessage.error('请先绑定 PrestaShop 模板');
      return;
    }

    const res = await getProductDetail({
      id: productId as string,
      id_currency: (id_currency as string) || '1',
      id_shop: (id_shop as string) || '1',
      SubmitCurrency: '1'
    });
    if (!res?.data) {
      ElMessage.error('获取产品详情失败');
      return;
    }
    await nextTick(() => {
      initCanvas({
        carouselRef: carouselRef.value,
        canvasRef: canvasRef.value,
        useType: UseCanvasEditorTypeEnum.Add,
        styleId: styleId as string,
        combinationId: combinationId as string,
        productId: productId as string,
        productImageUrl: res.data?.default_image?.original_url,
        setOptionsPrice: true
      });
    });
  } catch (error) {
    console.error('获取产品详情失败：', error);
    ElMessage({
      message: '获取产品详情失败',
      type: 'error'
    });
  }
};

/** 编辑模板标签 */
const editTemplateOptionLabel = () => {
  // @ts-expect-error: open 组件方法
  dialogEditTplRef.value?.open(productMergeStyleData.value);
};

const confirmEditTemplateOptionLabel = (ev: { id: string | number; templateOptionLabel: string }) => {
  productMergeStyleData.value.templateOptionLabel = ev.templateOptionLabel;
};

/** 编辑模板标签 */
const editOptionsPrice = (i: FabricObjectVO) => {
  // @ts-expect-error: open 组件方法
  dialogEditOptionsPriceRef.value?.open(i, ps_design_templates.value);
};

const confirmEditOptionsPrice = (ev: any) => {
  console.log(ev);
};

/** 编辑模板标签 */
const editTextConfig = (i: FabricObjectVO) => {
  // @ts-expect-error: open 组件方法
  dialogEditTextConfigRef.value?.open(i, productMergeStyleData.value);
};

const confirmTextConfig = (i: FabricObjectVO, ev: { textConfig: textConfigItemVo }) => {
  const config = productMergeStyleData.value.templateConfig[i.id];
  if (typeof config === 'object' && config !== null) {
    config.textConfig = ev.textConfig;
  } else {
    productMergeStyleData.value.templateConfig[i.id] = {
      textConfig: ev.textConfig
    };
  }
};

/**
 * 截取name，超出追加...
 */
const getName = (name: string): string => {
  if (name) {
    return name.length > 5 ? name.substring(0, 5) + '...' : name;
  }
  return '';
};

onMounted(() => {
  getProductData();
});
</script>

<style lang="scss" scoped>
@use './add';
</style>
