import { markRaw, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fabric } from 'fabric';
import { Utils } from '@kuaitu/core';
import { jsonParse } from '@deary/utils';
import { getCategoriesStyle } from '@/api/kjds/categoriesStyle';
import { CategoriesStyleVO } from '@/api/kjds/categoriesStyle/types';
import { TemplateOptionsVO } from '@/api/kjds/styleTemplate/types';
import { listProductStyleTemplate } from '@/api/kjds/productStyleTemplate';
import { addProductMergeStyle, getProductMergeStyle, updateProductMergeStyle } from '@/api/kjds/productMergeStyle';
import { FabricCanvasEditor, getImageInfo, getTemplImgs, handleImgUrl, handleTemplScale } from '@/utils/FabricCanvasEditor';
import { ChangeTextConfigVo, EditorTemplVo, EditorTypeEnum, FabricObjectUseVO, FabricObjectVO, OptArresVO } from '@/utils/editor';
import { ProductMergeStyleVO, textConfigItemVo } from '@/api/kjds/productMergeStyle/types';
import { useRouter } from 'vue-router';
import { getTemplateOptionList, saveTemplateOption } from '@/api/shop';
import { AttribugesGroups, CategoryProductDataVO, DataImage, DesignAttribute, TemplateListVo } from '@/api/shop/types';

const { selectImgSrc } = Utils;

const fabricCanvasEditor = new FabricCanvasEditor();

export enum UseCanvasEditorTypeEnum {
  Add = 'add',
  Cart = 'cart'
}

export function useCanvasEditor() {
  const router = useRouter();
  const useType = ref<UseCanvasEditorTypeEnum>(UseCanvasEditorTypeEnum.Add);
  const loading = ref<boolean>(true);
  // 当前宽度和高度
  const carouselWidth = ref<number>(0);
  const carouselHeight = ref<number>(0);
  // 当前宽度和高度与产品尺寸比例
  const carouselRatio = ref<number>(0);
  const canvasScaleW = ref<number>(1);
  const canvasScaleH = ref<number>(1);
  // 风格数据
  const styleId = ref<string | number>();
  const styleData = ref<CategoriesStyleVO>();
  const styleDataTempls = ref<EditorTemplVo[]>([]);
  const selCurtTempl = ref<string>('');
  const templJsonObjects = ref<FabricObjectUseVO[]>([]);

  const showBuffer = ref(false);
  const priceDisabledBuffer = ref(false);
  const buttonLoading = ref(false);
  const templateOptions = ref<TemplateOptionsVO[]>([]);
  const selCurtTemplPrice = ref<number>(0);
  const curtTempl = ref<EditorTemplVo>(<EditorTemplVo>{ name: '', json: {} });

  // 组合id存在，就表示已经设置价格
  const combinationId = ref<string | number>();
  const productMergeStyleData = ref<ProductMergeStyleVO>({
    id: '',
    imageUrl: '',
    name: '',
    templateOptionLabel: '',
    templateConfig: {},
    productId: '',
    styleId: '',
    status: ''
  });

  // 产品id
  const productId = ref<string | number>();
  // PrestaShop 模板id
  const isSetOptionsPrice = ref<boolean>(false);
  const id_design_template = ref<string | number>();
  const ps_design_templates = ref<TemplateListVo>({});

  // 最新的组合模板信息
  const productMergeStyleNewest = ref<ProductMergeStyleVO>({
    id: undefined,
    imageUrl: '',
    name: '',
    productId: undefined,
    status: '',
    styleId: undefined,
    templateConfig: undefined,
    templateOptionLabel: ''
  });
  // 产品信息
  const productData = ref<CategoryProductDataVO>({
    active: 0,
    add_to_cart_url: '',
    additional_delivery_times: 0,
    additional_shipping_cost: '',
    advanced_stock_management: 0,
    allow_oosp: 0,
    attachments: [],
    attribugesGroups: undefined,
    attribute_price: 0,
    attributes: undefined,
    availability: '',
    availability_date: null,
    availability_message: '',
    availability_submessage: null,
    available_date: null,
    available_for_order: 0,
    available_later: '',
    available_now: '',
    base_price: '',
    cache_default_attribute: 0,
    cache_has_attachments: 0,
    cache_is_pack: 0,
    canonical_url: '',
    category: '',
    category_name: '',
    combination_specific_data: undefined,
    condition: false,
    cover: undefined,
    cover_image_id: 0,
    customizable: 0,
    customization_required: false,
    date_add: '',
    date_upd: '',
    default_image: undefined,
    delivery_in_stock: '',
    delivery_information: null,
    delivery_out_stock: '',
    depth: '',
    description: '',
    description_short: '',
    designAttribute: undefined,
    discount_amount: null,
    discount_amount_to_display: null,
    discount_percentage: null,
    discount_percentage_absolute: null,
    discount_to_display: null,
    discount_type: null,
    discountoff: '',
    ean13: '',
    ecotax: undefined,
    ecotax_rate: 0,
    embedded_attributes: undefined,
    features: [],
    file_size_formatted: null,
    flags: [],
    grouped_features: null,
    has_discount: false,
    height: '',
    id: 0,
    id_category_default: 0,
    id_image: '',
    id_lang: 0,
    id_manufacturer: 0,
    id_product: 0,
    id_product_attribute: 0,
    id_shop: 0,
    id_shop_default: 0,
    id_supplier: 0,
    id_tax_rules_group: 0,
    id_type_redirected: 0,
    images: [],
    indexed: 0,
    is_virtual: 0,
    isbn: '',
    labels: undefined,
    link: '',
    link_rewrite: '',
    location: '',
    low_stock_alert: 0,
    low_stock_threshold: 0,
    main_variants: [],
    manufacturer_name: null,
    meta_description: '',
    meta_keywords: '',
    meta_title: '',
    minimal_quantity: 0,
    mpn: '',
    name: '',
    new: 0,
    nopackprice: 0,
    on_sale: 0,
    online_only: 0,
    originamount: 0,
    originprice: '',
    out_of_stock: 0,
    pack: 0,
    packItems: [],
    pack_stock_type: 0,
    price: '',
    price_amount: 0,
    price_tax_exc: 0,
    price_without_reduction: 0,
    price_without_reduction_without_tax: 0,
    product_type: '',
    quantity: 0,
    quantity_all_versions: 0,
    quantity_discount: 0,
    quantity_discounts: [],
    rate: 0,
    redirect_type: '',
    reduction: 0,
    reduction_without_tax: 0,
    reference: '',
    reference_to_display: null,
    regular_price: '',
    regular_price_amount: 0,
    seo_availability: '',
    show_availability: false,
    show_condition: 0,
    show_price: false,
    specialpriceamount: 0,
    specific_prices: false,
    specific_references: null,
    state: 0,
    supplier_reference: '',
    tax_name: '',
    text_fields: 0,
    unit_price: '',
    unit_price_full: '',
    unit_price_ratio: 0,
    unit_price_tax_excluded: 0,
    unit_price_tax_included: 0,
    unity: '',
    upc: '',
    uploadable_files: 0,
    url: '',
    virtual: 0,
    visibility: '',
    weight: '',
    weight_unit: '',
    wholesale_price: '',
    width: ''
  });
  // 原系统产品规格
  const groupsAttr = ref<AttribugesGroups>({
    colors: undefined,
    combinationImages: false,
    combinations: undefined,
    groups: undefined
  });
  // 原系统产品设计属性
  const designAttr = ref<DesignAttribute>({
    design_option_result: undefined,
    design_options: undefined,
    rule_details: [],
    rules: []
  });
  // 属性价格汇总
  const designOptionTotalPrice = ref<number>(0);
  // 属性成品图
  const designOptionFinishedImages = ref<string>('');
  // 当前选择的图片
  const selImg = ref<number>(0);
  // 产品的图片列表
  const productImgs = ref<DataImage[]>([]);
  const qty = ref<number>(1);

  /**
   * 初始化画布
   * @param opt
   */
  const initCanvas = async (opt: {
    // DOM 元素
    carouselRef: HTMLElement | null;
    canvasRef: HTMLElement | null;
    // 画布类型
    useType: UseCanvasEditorTypeEnum;
    // 风格id
    styleId: string | number;
    // 组合id
    combinationId: string | number;
    // 产品id
    productId: string | number;
    // 产品图片地址
    productImageUrl: string;
    // 是否需要处理选项价格
    setOptionsPrice?: boolean;
  }) => {
    if (!opt.carouselRef) return;
    // 默认false
    if (opt?.setOptionsPrice === undefined) {
      opt.setOptionsPrice = false;
    }
    isSetOptionsPrice.value = opt.setOptionsPrice;
    styleId.value = opt.styleId;
    combinationId.value = opt.combinationId;
    await getProductMergeStyleData();
    productId.value = opt.productId;
    useType.value = opt.useType;

    const url = handleImgUrl(opt.productImageUrl);
    const res = await getImageInfo(url);
    const boxWidth = opt.carouselRef.offsetWidth;
    const productWidth = res.width;
    const productHeight = res.height;
    carouselRatio.value = boxWidth / Number(productWidth);
    carouselWidth.value = boxWidth;
    carouselHeight.value = productHeight * carouselRatio.value;

    await addBgCavas(opt.canvasRef, url);
  };

  // 设置画布背景
  const addBgCavas = async (canvasRef: HTMLElement | null, url: string) => {
    if (!url || !canvasRef) return;

    // @ts-ignore
    const canvasInstance = markRaw(new fabric.Canvas(canvasRef, { selection: false }));
    canvasInstance.setBackgroundImage(url, canvasInstance.renderAll.bind(canvasInstance), {
      originX: 'left',
      originY: 'top',
      top: 0,
      left: 0,
      scaleX: carouselRatio.value,
      scaleY: carouselRatio.value,
      crossOrigin: 'anonymous'
    });
    canvasInstance.setWidth(carouselWidth.value);
    canvasInstance.setHeight(carouselHeight.value);

    fabricCanvasEditor.init(canvasInstance);

    await getCategoriesDetail(styleId.value);
  };

  const handleJsonObjects = (arr: FabricObjectVO[]): FabricObjectUseVO[] => {
    if (!arr) {
      return [];
    }
    // 处理规则中的数据
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      // 是否开启个性化
      if ((item.type === EditorTypeEnum.IText || item.type === EditorTypeEnum.TextBox) && item.personalized) {
        const { max } = getCurtTextConfig(item);
        // 是否设置最大数字限制
        if (max) {
          item.text = item.text.substring(0, max);
        }
      }
      // 处理选项中的价格
      if (item.type === EditorTypeEnum.Options) {
        try {
          item.optArres = item?.optArres?.map((optArresItem) => {
            let children: any;
            for (const designOptionResultKey in designAttr.value.design_option_result) {
              const designOptionResult = designAttr.value.design_option_result[designOptionResultKey];
              if (designOptionResult.title === item.id) {
                for (const childrenKey in designOptionResult.children) {
                  const childrenItem = designOptionResult.children[childrenKey];
                  if (childrenItem.title === optArresItem.label) {
                    children = childrenItem;
                  }
                }
              }
            }
            return {
              ...optArresItem,
              ...children,
              setPrice: !!children?.price
            };
          });
        } catch (e) {
          console.error('处理选项中的价格失败', e);
        }
      }
    }
    if (designAttr.value.design_option_result && typeof designAttr.value.design_option_result === 'object') {
      designAttr.value.design_option_result = Object.fromEntries(
        Object.entries(designAttr.value.design_option_result).filter(([key, item]: [string, any]) => {
          // 过滤条件
          return arr.some((arrItem) => arrItem.id === item.title || item.title === 'design_image' || item.title === 'finished_image');
        })
      );
    }
    return arr as FabricObjectUseVO[];
  };

  /**
   * 获取风格详情
   * @param id 风格id
   */
  const getCategoriesDetail = async (id: string | number) => {
    if (!id) {
      loading.value = false;
      return;
    }
    const showErr = () => {
      if (useType.value === UseCanvasEditorTypeEnum.Add) {
        ElMessage({ message: '未获取到有效模板', type: 'warning' });
      } else {
        ElMessage({ message: 'No valid template was obtained', type: 'warning' });
      }

      loading.value = false;
    };
    try {
      const res = await getCategoriesStyle(id);
      if (res.data?.dsStyleTemplateVoList) {
        templateOptions.value = res.data.dsStyleTemplateVoList || [];
        await getTemplatePrice(combinationId.value);
      }

      if (res.data.templs) {
        res.data.templs = jsonParse(res.data.templs as never, []) as EditorTemplVo[];
      }

      styleData.value = res.data;
      if (!res.data.templs) {
        showErr();
        return;
      }
      if (typeof res.data.templs !== 'string') {
        const templ = getTemplImgs(res.data.templs);
        const firstTempl = templ[0];

        if (!firstTempl) {
          showErr();
          return;
        }

        selCurtTempl.value = firstTempl?.name;
        templJsonObjects.value = handleJsonObjects(firstTempl.json?.objects) || [];
        // 是否需要处理选项价格
        if (isSetOptionsPrice.value) {
          await handleTemplateOptionsPrice();
        }

        const clipPath = firstTempl?.json?.clipPath;

        const computeScale = (carouselDim: number, clipDim?: number): number => {
          if (clipDim && clipDim > 0) {
            return carouselDim / clipDim;
          }
          if (useType.value === UseCanvasEditorTypeEnum.Add) {
            ElMessage({ message: '模板宽高比计算失败', type: 'warning' });
          } else {
            ElMessage({ message: 'Template aspect ratio calculation failed', type: 'warning' });
          }
          return 1;
        };
        canvasScaleW.value = computeScale(carouselWidth.value, clipPath?.width);
        canvasScaleH.value = computeScale(carouselHeight.value, clipPath?.height);

        handleTemplScale(templ, canvasScaleW.value, canvasScaleH.value);

        curtTempl.value = firstTempl;
        await setCanvasByTempl();
        styleDataTempls.value = templ;

        showBuffer.value = true;
      }
    } catch (e) {
      console.error(e);
      throw new Error('Error getting style details');
    }
  };

  /**
   * 模版列表，组合模版价格
   */
  const getTemplatePrice = async (combinationId: string | number) => {
    if (!combinationId) return;
    const ress = await listProductStyleTemplate({
      pageNum: 1,
      pageSize: 100,
      productMergeStyleId: combinationId as string
    });

    templateOptions.value.forEach((item: TemplateOptionsVO, index: number) => {
      item.price = ress.rows[index]?.price;
    });

    if (useType.value === UseCanvasEditorTypeEnum.Cart) {
      selCurtTemplPrice.value = calcCurtTemplPrice();
    }
  };

  /**
   * 模版列表价格
   */
  const getTemplateOptions = async (id: string | number) => {
    const data = await getTemplateOptionList({ id_design_template: id });
    ps_design_templates.value = data?.data || {};
  };

  /**
   * 计算当前选择的模板价格
   */
  const calcCurtTemplPrice = () => {
    let price = 0;
    if (selCurtTempl.value) {
      const templ = templateOptions.value.find((item: TemplateOptionsVO) => item.name === selCurtTempl.value);
      if (templ) {
        price = templ.price;
      }
    }
    try {
      price = parseFloat(price.toString());
      return price;
    } catch (e) {
      throw new Error('If the price of the template is abnormal, please contact customer service');
    }
  };

  /**
   * 计算选项价格
   */
  const calcCurtTemplOptionTotalPrice = () => {
    let price = 0;
    // 计算模板选项价格
    if (templJsonObjects.value) {
      for (let i = 0; i < templJsonObjects.value.length; i++) {
        const curtTempl = templJsonObjects.value[i];
        if (curtTempl.type === EditorTypeEnum.Options) {
          const curtOptDefVal = curtTempl.optDefVal;
          const curtOptArres = curtTempl.optArres;
          const curtOption = curtOptArres.find((item: OptArresVO) => item.value === curtOptDefVal);
          if (curtOption && curtOption.setPrice && curtOption.price) {
            price += curtOption.price;
          }
        }
      }
    }
    return price;
  };

  // 通过模板渲染画布
  const setCanvasByTempl = async () => {
    loading.value = true;
    const item = curtTempl.value;
    await fabricCanvasEditor.setCanvasByObjects(item?.json?.objects || []);
    loading.value = false;
  };

  /**
   * 选择图稿
   */
  const selectTempl = async (item: CategoriesStyleVO) => {
    if (item?.id) {
      await getCategoriesDetail(item.id);
    }
  };

  /**
   * 编辑图稿
   */
  const editTempl = () => {
    if (styleData.value?.id) {
      router.push(`/artworks/details?styleId=${styleData.value.id}`);
    }
  };

  /**
   * 删除图稿
   */
  const deleteTempl = () => {
    fabricCanvasEditor.clearCanvasInstance();
    showBuffer.value = false;
  };

  /**
   * 修改模板
   */
  const changeTempl = async (templName: string) => {
    // 清空画布
    fabricCanvasEditor.clearCanvasInstance();
    // 根据名称查找模版数据
    const templ = styleDataTempls.value.find((item) => item.name === templName);
    if (templ) {
      templJsonObjects.value = handleJsonObjects(templ.json?.objects) || [];
      curtTempl.value = templ;
      await setCanvasByTempl();
    }
  };

  /**
   * 修改文本对象
   * @param item 画布对象
   * @param config 配置
   */
  const changeText = (item: FabricObjectVO, config: ChangeTextConfigVo) => {
    if (item.type === EditorTypeEnum.IText) {
      fabricCanvasEditor.textUtils.changeText(item, config);
    } else if (item.type === EditorTypeEnum.TextBox) {
      fabricCanvasEditor.textUtils.changeTextbox(item, config);
    }
  };

  /**
   * 修改图片对象
   * @param item 画布对象
   */
  const changeImage = (item: FabricObjectVO, src?: string) => {
    if (src) {
      item.src = src;
    }
    fabricCanvasEditor.imageUtils.changeImage(item, item.src);
  };

  /**
   * 上传修改图片对象
   * @param item 画布对象
   */
  const changeUploadImage = async (item: FabricObjectVO) => {
    try {
      const src = await selectImgSrc();
      item.src = src;
      fabricCanvasEditor.imageUtils.changeImage(item, src);
    } catch (error) {
      console.error('图片上传失败：', error);
    }
  };

  /**
   * 修改选项
   * @param val 当前选项值
   */
  const changeOptions = async (val?: string) => {
    const currentTemplate: EditorTemplVo = curtTempl.value;
    if (currentTemplate?.json?.objects) {
      await fabricCanvasEditor.changeOptions(currentTemplate.json.objects);
    }
  };

  /**
   * 修改图片颜色选项
   * @param val 当前选项值
   */
  const changeImageColorOptions = async (val: string) => {
    const currentTemplate: EditorTemplVo = curtTempl.value;
    if (currentTemplate?.json?.objects) {
      await fabricCanvasEditor.changeImageColorOptions(currentTemplate.json.objects, val);
    }
  };

  /**
   * 确定组合模板价格
   */
  const confirmCombinationPrice = async () => {
    let valid = true;
    templateOptions.value.forEach((option: TemplateOptionsVO) => {
      if (!option.price) {
        if (useType.value === UseCanvasEditorTypeEnum.Add) {
          ElMessage.error(`请输入${option.name}的价格`);
        } else {
          ElMessage.error(`Please enter a price of ${option.name}`);
        }
        valid = false;
      } else {
        option.disabled = true;
      }
    });
    if (valid) {
      priceDisabledBuffer.value = true;
    }
  };

  /**
   * 保存组合模板
   */
  const saveCombination = async () => {
    // 检查是否所有模版价格都已确认
    const allPricesConfirmed = templateOptions.value.every((option: TemplateOptionsVO) => option.disabled === true);
    if (!allPricesConfirmed) {
      return ElMessage({
        message: '请先确认模版价格',
        type: 'warning'
      });
    }

    buttonLoading.value = true;
    try {
      const imgInfo = await fabricCanvasEditor.getCanvasImage('url');
      const form = {
        id: combinationId.value ? (combinationId.value as string) : undefined,
        productId: Number(productId.value),
        name: styleData.value?.name,
        styleId: styleData.value?.id,
        dsProductStyleTemplateList: templateOptions.value.map((option: TemplateOptionsVO) => ({
          styleTemplateId: option.id,
          price: option.price
        })),
        imageUrl: imgInfo || '',
        templateOptionLabel: productMergeStyleData.value?.templateOptionLabel || 'Custom Template',
        templateConfig: productMergeStyleData.value?.templateConfig ? JSON.stringify(productMergeStyleData.value?.templateConfig) : ''
      };

      if (combinationId.value) {
        // 编辑
        await updateProductMergeStyle(form);
      } else {
        // 新增
        await addProductMergeStyle(form);
      }
      ElMessage({
        message: '操作成功',
        type: 'success'
      });
      await router.push('/campaigns/index');
    } catch (error) {
      console.error('保存失败：', error);
    } finally {
      buttonLoading.value = false;
    }
  };

  /**
   * 返回上一级
   */
  const back = () => {
    router.back();
  };

  /**
   * 查询产品组合风格图详细
   */
  const getProductMergeStyleData = async () => {
    if (!combinationId.value) {
      // 默认值
      productMergeStyleData.value.templateOptionLabel = 'Custom Template';
    } else {
      try {
        const { data } = await getProductMergeStyle(combinationId.value as string);
        if (!data?.templateOptionLabel) {
          data.templateOptionLabel = 'Custom Template';
        }
        if (data.templateConfig && typeof data.templateConfig === 'string') {
          data.templateConfig = jsonParse(data.templateConfig, {});
        } else {
          data.templateConfig = {};
        }
        productMergeStyleData.value = data;
      } catch (error) {
        console.error('查询产品组合风格图详细失败：', error);
      }
    }
  };

  /**
   * 处理选项价格：新增时默认 price=0，已有时保留原有价格
   */
  const handleTemplateOptionsPrice = async () => {
    // 构建 title -> item 映射，快速查找
    const templateMap = new Map<string, any>(Object.values(ps_design_templates.value).map((tpl: any) => [tpl.title, tpl]));

    const optionsToSave: any[] = [];

    templJsonObjects.value?.forEach((obj: FabricObjectVO) => {
      if (obj.type !== EditorTypeEnum.Options) return;

      const existsItem = templateMap.get(obj.id);

      if (!existsItem) {
        // ✅ 新增整个选项
        optionsToSave.push({
          type: 'edit_option',
          id_design_template: id_design_template.value,
          id_design_option_type: '7',
          id_design_option: 0,
          title: obj.id,
          children: obj.optArres?.map((item: OptArresVO) => ({
            title: item.label,
            default_text: item.value,
            id_product: productId.value,
            price: 0 // 新增时默认 0
          }))
        });
      } else {
        // ✅ 已存在：比对子项
        const childMap = new Map(existsItem.children?.map((c: any) => [c.title, c]) || []);

        let needUpdate = false;
        const newChildren = obj.optArres?.map((item: OptArresVO) => {
          const matched: any = childMap.get(item.label);
          if (!matched) {
            // 新增子项 → 默认价格 0
            needUpdate = true;
            return {
              title: item.label,
              default_text: item.value,
              id_product: productId.value,
              price: 0
            };
          }

          // 保留已设置的价格，更新 default_text
          if (matched.default_text !== item.value) {
            needUpdate = true;
            return {
              ...matched,
              default_text: item.value,
              // 价格保留原有值
              price: matched.price
            };
          }

          return matched; // 无变化
        });

        // 如果 children 数量变了，也要更新
        if (newChildren?.length !== existsItem.children?.length) {
          needUpdate = true;
        }

        if (needUpdate) {
          optionsToSave.push({
            ...existsItem,
            children: newChildren
          });
        }
      }
    });

    // ✅ 批量保存
    if (optionsToSave.length > 0) {
      await Promise.all(optionsToSave.map((params) => saveTemplateOption(params)));
      await getTemplateOptions(id_design_template.value);
    }
  };

  const getCurtTextConfig = (i: FabricObjectVO): textConfigItemVo => {
    try {
      return (
        productMergeStyleData.value?.templateConfig[i.id].textConfig ?? {
          min: undefined,
          max: undefined,
          line: undefined
        }
      );
    } catch {
      return {
        min: undefined,
        max: undefined,
        line: undefined
      };
    }
  };

  /**
   * 通过Shop选项价格，更新模板中选项的价格
   */
  const updateTemplateOptionsPrice = async (tjo, da: DesignAttribute) => {
    console.log('通过Shop选项价格，更新模板中选项的价格', tjo, da);
  };

  return {
    id_design_template,
    ps_design_templates,
    getTemplateOptions,
    loading,
    carouselWidth,
    carouselHeight,
    carouselRatio,
    canvasScaleW,
    canvasScaleH,
    styleData,
    styleDataTempls,
    selCurtTempl,
    selCurtTemplPrice,
    templJsonObjects,
    showBuffer,
    priceDisabledBuffer,
    buttonLoading,
    templateOptions,
    curtTempl,
    fabricCanvasEditor,
    productMergeStyleData,
    productMergeStyleNewest,
    productData,
    groupsAttr,
    designAttr,
    designOptionTotalPrice,
    designOptionFinishedImages,
    selImg,
    productImgs,
    qty,
    initCanvas,
    addBgCavas,
    getCategoriesDetail,
    setCanvasByTempl,
    selectTempl,
    editTempl,
    deleteTempl,
    changeTempl,
    calcCurtTemplPrice,
    changeText,
    changeImage,
    changeUploadImage,
    changeOptions,
    changeImageColorOptions,
    confirmCombinationPrice,
    calcCurtTemplOptionTotalPrice,
    saveCombination,
    back,
    getProductMergeStyleData,
    getCurtTextConfig,
    updateTemplateOptionsPrice
  };
}
