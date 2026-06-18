interface ShopTokenQuery {
  _token?: string;
  token?: string;
}

interface ShopPageQuery {
  page: number;
  limit: number;
}

export interface CategoryListVO {
  /**
   * 分类id
   */
  id_category: number;
  /**
   * 分类名
   */
  name: string;
}

export interface CategoryListQuery extends ShopTokenQuery {
  pid: string;
}

export interface CategoryVO {
  /**
   * 分类id
   */
  id_category: string;
  /**
   * 分类名
   */
  name: string;
}

export interface CategoryQuery extends ShopPageQuery, ShopTokenQuery {
  pid?: string;
}

export interface CategoryProductListDataVO {
  /**
   * 商品说明
   */
  description?: string;
  /**
   * 商品说明简述
   */
  description_short?: string;
  /**
   * 分类id
   */
  id_category?: number;
  /**
   * 图片id
   */
  id_image?: number;
  /**
   * 品牌id
   */
  id_manufacturer?: number;
  /**
   * 商品id
   */
  id_product?: number;
  /**
   * 商品封面
   */
  image?: string;
  /**
   * 品牌名称
   */
  manufacturer_name?: string | null;
  /**
   * 商品名称
   */
  name?: string;
}

export interface CategoryProductDataVO {
  active: number;
  add_to_cart_url: string;
  additional_delivery_times: number;
  additional_shipping_cost: string;
  advanced_stock_management: number;
  allow_oosp: number;
  attachments: string[];
  /**
   * 规格属性组
   */
  attribugesGroups: AttribugesGroups;
  attribute_price: number;
  attributes: DataAttributes;
  availability: string;
  availability_date: null;
  availability_message: string;
  availability_submessage: null;
  available_date: null;
  available_for_order: number;
  available_later: string;
  available_now: string;
  base_price: string;
  cache_default_attribute: number;
  cache_has_attachments: number;
  cache_is_pack: number;
  canonical_url: string;
  category: string;
  category_name: string;
  combination_specific_data: CombinationSpecificData;
  condition: boolean;
  cover: DataCover;
  cover_image_id: number;
  customizable: number;
  customization_required: boolean;
  date_add: string;
  date_upd: string;
  default_image: DefaultImage;
  delivery_in_stock: string;
  delivery_information: null;
  delivery_out_stock: string;
  depth: string;
  description: string;
  description_short: string;
  /**
   * 设计属性
   */
  designAttribute: DesignAttribute;
  discount_amount: null;
  discount_amount_to_display: null;
  discount_percentage: null;
  discount_percentage_absolute: null;
  discount_to_display: null;
  discount_type: null;
  discountoff: string;
  ean13: string;
  ecotax: Ecotax;
  ecotax_rate: number;
  embedded_attributes: EmbeddedAttributes;
  features: string[];
  file_size_formatted: null;
  flags: string[];
  grouped_features: null;
  has_discount: boolean;
  height: string;
  id: number;
  id_category_default: number;
  id_image: string;
  id_lang: number;
  id_manufacturer: number;
  id_product: number;
  id_product_attribute: number;
  id_shop: number;
  id_shop_default: number;
  id_supplier: number;
  id_tax_rules_group: number;
  id_type_redirected: number;
  images: DataImage[];
  indexed: number;
  is_virtual: number;
  isbn: string;
  labels: Labels;
  link: string;
  link_rewrite: string;
  location: string;
  low_stock_alert: number;
  low_stock_threshold: number;
  main_variants: MainVariant[];
  manufacturer_name: null;
  meta_description: string;
  meta_keywords: string;
  meta_title: string;
  minimal_quantity: number;
  mpn: string;
  name: string;
  new: number;
  nopackprice: number;
  on_sale: number;
  online_only: number;
  originamount: number;
  originprice: string;
  out_of_stock: number;
  pack: number;
  pack_stock_type: number;
  packItems: string[];
  price: string;
  price_amount: number;
  price_tax_exc: number;
  price_without_reduction: number;
  price_without_reduction_without_tax: number;
  product_type: string;
  quantity: number;
  quantity_all_versions: number;
  quantity_discount: number;
  quantity_discounts: string[];
  rate: number;
  redirect_type: string;
  reduction: number;
  reduction_without_tax: number;
  reference: string;
  reference_to_display: null;
  regular_price: string;
  regular_price_amount: number;
  seo_availability: string;
  show_availability: boolean;
  show_condition: number;
  show_price: boolean;
  specialpriceamount: number;
  specific_prices: boolean;
  specific_references: null;
  state: number;
  supplier_reference: string;
  tax_name: string;
  text_fields: number;
  unit_price: string;
  unit_price_full: string;
  unit_price_ratio: number;
  unit_price_tax_excluded: number;
  unit_price_tax_included: number;
  unity: string;
  upc: string;
  uploadable_files: number;
  url: string;
  virtual: number;
  visibility: string;
  weight: string;
  weight_unit: string;
  wholesale_price: string;
  width: string;
  [property: string]: any;
}

export interface AttribugesGroups {
  colors: Colors;
  combinationImages: boolean;
  combinations: Combinations;
  groups: Groups;
  [property: string]: any;
}

export interface Colors {
  [property: string]: ColorsChild;
}

export interface ColorsChild {
  attributes_quantity: number;
  name: string;
  value: string;
  [property: string]: any;
}

export interface Combinations {
  [property: string]: TheChild;
}

export interface TheChild {
  attributes: number[];
  attributes_values: TheChildAttributesValues;
  available_date: string;
  available_later: string;
  available_now: string;
  date_formatted: string;
  ean13: string;
  ecotax: number;
  id_image: number;
  isbn: string;
  list: string;
  minimal_quantity: number;
  mpn: string;
  price: number;
  quantity: number;
  reference: string;
  specific_price: boolean;
  unit_impact: string;
  upc: string;
  weight: number;
  [property: string]: any;
}

export interface TheChildAttributesValues {
  [property: string]: any;
}

export interface Groups {
  [property: string]: GroupsChild;
}

export interface GroupsChild {
  attributes: TheAttributesChild;
  attributes_quantity: TheAttributesQuantityChild;
  default: number;
  group_name: string;
  group_type: string;
  name: string;
  [property: string]: any;
}

export interface TheAttributesChild {
  [property: string]: any;
}

export interface TheAttributesQuantityChild {
  [property: string]: any;
}

export interface DataAttributes {
  [property: string]: PurpleChild;
}

export interface PurpleChild {
  available_later: string;
  available_now: string;
  ean13: string;
  group: string;
  id_attribute: number;
  id_attribute_group: number;
  isbn: string;
  mpn: string;
  name: string;
  reference: string;
  upc: string;
  [property: string]: any;
}

export interface CombinationSpecificData {
  available_later: string;
  available_now: string;
  ean13: string;
  group: string;
  id_attribute: number;
  id_attribute_group: number;
  isbn: string;
  mpn: string;
  name: string;
  reference: string;
  upc: string;
  [property: string]: any;
}

export interface DataCover {
  associatedVariants: string[];
  bySize: PurpleBySize;
  cover: number;
  id_image: number;
  large: PurpleLarge;
  legend: string;
  medium: PurpleMedium;
  original_url: string;
  position: number;
  small: PurpleSmall;
  [property: string]: any;
}

export interface PurpleBySize {
  cart_default: PurpleCartDefault;
  home_default: PurpleHomeDefault;
  large_default: PurpleLargeDefault;
  medium_default: PurpleMediumDefault;
  small_default: PurpleSmallDefault;
  [property: string]: any;
}

export interface PurpleCartDefault {
  height: number;
  sources: PurpleSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface PurpleSources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleHomeDefault {
  height: number;
  sources: FluffySources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface FluffySources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleLargeDefault {
  height: number;
  sources: TentacledSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface TentacledSources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleMediumDefault {
  height: number;
  sources: StickySources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface StickySources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleSmallDefault {
  height: number;
  sources: IndigoSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface IndigoSources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleLarge {
  height: number;
  sources: IndecentSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface IndecentSources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleMedium {
  height: number;
  sources: HilariousSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface HilariousSources {
  jpg: string;
  [property: string]: any;
}

export interface PurpleSmall {
  height: number;
  sources: AmbitiousSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface AmbitiousSources {
  jpg: string;
  [property: string]: any;
}

export interface DefaultImage {
  associatedVariants: string[];
  bySize: DefaultImageBySize;
  cover: number;
  id_image: number;
  large: DefaultImageLarge;
  legend: string;
  medium: DefaultImageMedium;
  original_url: string;
  position: number;
  small: DefaultImageSmall;
  [property: string]: any;
}

export interface DefaultImageBySize {
  cart_default: FluffyCartDefault;
  home_default: FluffyHomeDefault;
  large_default: FluffyLargeDefault;
  medium_default: FluffyMediumDefault;
  small_default: FluffySmallDefault;
  [property: string]: any;
}

export interface FluffyCartDefault {
  height: number;
  sources: CunningSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface CunningSources {
  jpg: string;
  [property: string]: any;
}

export interface FluffyHomeDefault {
  height: number;
  sources: MagentaSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface MagentaSources {
  jpg: string;
  [property: string]: any;
}

export interface FluffyLargeDefault {
  height: number;
  sources: FriskySources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface FriskySources {
  jpg: string;
  [property: string]: any;
}

export interface FluffyMediumDefault {
  height: number;
  sources: MischievousSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface MischievousSources {
  jpg: string;
  [property: string]: any;
}

export interface FluffySmallDefault {
  height: number;
  sources: BraggadociousSources;
  url: string;
  width: number;
  [property: string]: any;
}

export interface BraggadociousSources {
  jpg: string;
  [property: string]: any;
}

export interface DefaultImageLarge {
  height: number;
  sources: Sources1;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources1 {
  jpg: string;
  [property: string]: any;
}

export interface DefaultImageMedium {
  height: number;
  sources: Sources2;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources2 {
  jpg: string;
  [property: string]: any;
}

export interface DefaultImageSmall {
  height: number;
  sources: Sources3;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources3 {
  jpg: string;
  [property: string]: any;
}

export interface DesignAttribute {
  design_option_result: DesignOptionResult;
  design_options: DesignOptions;
  rule_details: string[];
  rules: string[];
  [property: string]: any;
}

export interface DesignOptionResult {
  [property: string]: TheDesignChild;
}

export interface TheDesignChild {
  bring_into_the_cart: number;
  children: TheDesignChildrenChild;
  column_width: number;
  cropped_type: number;
  date_format: null;
  default_text: null;
  div_class: string;
  file_type: number;
  has_stock: null;
  help_text: string;
  help_text_position: number;
  id_design_option: number;
  id_design_option_type: string;
  id_design_template: number;
  id_product: null;
  is_allow_multiple: number;
  is_default: null;
  is_hide_title: number;
  is_onetime_fee: number;
  is_required: number;
  limit_by_date: null;
  limit_specific_dates: null;
  max_characters: null;
  max_date: null;
  max_file_num: number;
  max_number_of_choices: number;
  min_characters: null;
  min_date: null;
  min_file_num: number;
  min_number_of_choices: number;
  pid: number;
  placeholder_text: null;
  popup_box_desc: null;
  popup_box_image: null;
  popup_box_title: null;
  popup_box_width: number;
  price: null;
  sku: null;
  sort: number;
  swatches_color: null;
  swatches_image: null;
  title: string;
  tooltip: string;
  use_option_choices_qty: number;
  weekly_limit: null;
  weight: null;
  [property: string]: any;
}

export interface TheDesignChildrenChild {
  [property: string]: TheDesignPurpleChild;
}

export interface TheDesignPurpleChild {
  bring_into_the_cart: number;
  column_width: number;
  cropped_type: number;
  date_format: null;
  default_text: null;
  div_class: null;
  file_type: number;
  has_stock: number;
  help_text: null;
  help_text_position: number;
  id_design_option: number;
  id_design_option_type: number;
  id_design_template: number;
  id_product: number;
  is_allow_multiple: number;
  is_default: number;
  is_hide_title: number;
  is_onetime_fee: number;
  is_required: number;
  limit_by_date: null;
  limit_specific_dates: null;
  max_characters: null;
  max_date: null;
  max_file_num: number;
  max_number_of_choices: number;
  min_characters: null;
  min_date: null;
  min_file_num: number;
  min_number_of_choices: number;
  pid: number;
  placeholder_text: null;
  popup_box_desc: null;
  popup_box_image: null;
  popup_box_title: null;
  popup_box_width: number;
  price: string;
  sku: string;
  sort: number;
  swatches_color: null;
  swatches_image: null;
  title: string;
  tooltip: null;
  use_option_choices_qty: number;
  weekly_limit: null;
  weight: number;
  [property: string]: any;
}

export interface DesignOptions {
  [property: string]: TheDesignObjectChild;
}

export interface TheDesignObjectChild {
  bring_into_the_cart: number;
  children: TheDesignChildrenObjectChild;
  column_width: number;
  cropped_type: number;
  date_format: null;
  default_text: null;
  div_class: string;
  file_type: number;
  has_stock: null;
  help_text: string;
  help_text_position: number;
  id_design_option: number;
  id_design_option_type: number;
  id_design_template: number;
  id_product: null;
  is_allow_multiple: number;
  is_default: null;
  is_hide_title: number;
  is_onetime_fee: number;
  is_required: number;
  limit_by_date: null;
  limit_specific_dates: null;
  max_characters: null;
  max_date: null;
  max_file_num: number;
  max_number_of_choices: number;
  min_characters: null;
  min_date: null;
  min_file_num: number;
  min_number_of_choices: number;
  pid: number;
  placeholder_text: null;
  popup_box_desc: null;
  popup_box_image: null;
  popup_box_title: null;
  popup_box_width: number;
  price: null;
  sku: null;
  sort: number;
  swatches_color: null;
  swatches_image: null;
  title: string;
  tooltip: string;
  use_option_choices_qty: number;
  weekly_limit: null;
  weight: null;
  [property: string]: any;
}

export interface TheDesignChildrenObjectChild {
  [property: string]: TheDesignFluffyChild;
}

export interface TheDesignFluffyChild {
  bring_into_the_cart: number;
  column_width: number;
  cropped_type: number;
  date_format: null;
  default_text: null;
  div_class: null;
  file_type: number;
  has_stock: number;
  help_text: null;
  help_text_position: number;
  id_design_option: number;
  id_design_option_type: number;
  id_design_template: number;
  id_product: number;
  is_allow_multiple: number;
  is_default: number;
  is_hide_title: number;
  is_onetime_fee: number;
  is_required: number;
  limit_by_date: null;
  limit_specific_dates: null;
  max_characters: null;
  max_date: null;
  max_file_num: number;
  max_number_of_choices: number;
  min_characters: null;
  min_date: null;
  min_file_num: number;
  min_number_of_choices: number;
  pid: number;
  placeholder_text: null;
  popup_box_desc: null;
  popup_box_image: null;
  popup_box_title: null;
  popup_box_width: number;
  price: string;
  sku: string;
  sort: number;
  swatches_color: null;
  swatches_image: null;
  title: string;
  tooltip: null;
  use_option_choices_qty: number;
  weekly_limit: null;
  weight: number;
  [property: string]: any;
}

export interface Ecotax {
  amount: string;
  rate: number;
  value: string;
  [property: string]: any;
}

export interface EmbeddedAttributes {
  active: number;
  additional_shipping_cost: string;
  advanced_stock_management: number;
  allow_oosp: number;
  attachments: string[];
  attribute_price: number;
  attributes: EmbeddedAttributesAttributes;
  availability: string;
  availability_date: null;
  availability_message: string;
  available_date: null;
  available_for_order: number;
  available_later: string;
  available_now: string;
  cache_default_attribute: number;
  category: string;
  category_name: string;
  condition: string;
  cover: EmbeddedAttributesCover;
  customizable: number;
  customization_required: boolean;
  date_add: string;
  date_upd: string;
  delivery_in_stock: string;
  delivery_out_stock: string;
  description: string;
  description_short: string;
  discount_amount: null;
  discount_amount_to_display: null;
  discount_percentage: null;
  discount_percentage_absolute: null;
  discount_type: null;
  ecotax: string;
  ecotax_rate: number;
  features: string[];
  has_discount: boolean;
  id_category_default: number;
  id_image: string;
  id_manufacturer: number;
  id_product: number;
  id_product_attribute: number;
  id_shop_default: number;
  id_supplier: number;
  id_type_redirected: number;
  images: EmbeddedAttributesImage[];
  indexed: number;
  is_virtual: number;
  link: string;
  link_rewrite: string;
  low_stock_alert: number;
  low_stock_threshold: number;
  manufacturer_name: null;
  meta_description: string;
  meta_keywords: string;
  meta_title: string;
  minimal_quantity: number;
  name: string;
  new: number;
  nopackprice: number;
  on_sale: number;
  online_only: number;
  out_of_stock: number;
  pack: number;
  pack_stock_type: number;
  packItems: string[];
  price: string;
  price_amount: number;
  price_tax_exc: number;
  price_without_reduction: number;
  quantity: number;
  quantity_all_versions: number;
  rate: number;
  redirect_type: string;
  reduction: number;
  reference: string;
  show_availability: boolean;
  show_condition: number;
  show_price: number;
  specific_prices: boolean;
  tax_name: string;
  text_fields: number;
  unit_price: string;
  unit_price_full: string;
  unit_price_ratio: number;
  unity: string;
  uploadable_files: number;
  virtual: number;
  visibility: string;
  [property: string]: any;
}

export interface EmbeddedAttributesAttributes {
  [property: string]: EmbeddedFluffyChild;
}

export interface EmbeddedFluffyChild {
  available_later: string;
  available_now: string;
  ean13: string;
  group: string;
  id_attribute: number;
  id_attribute_group: number;
  isbn: string;
  mpn: string;
  name: string;
  reference: string;
  upc: string;
  [property: string]: any;
}

export interface EmbeddedAttributesCover {
  associatedVariants: string[];
  bySize: FluffyBySize;
  cover: number;
  id_image: number;
  large: FluffyLarge;
  legend: string;
  medium: FluffyMedium;
  original_url: string;
  position: number;
  small: FluffySmall;
  [property: string]: any;
}

export interface FluffyBySize {
  cart_default: TentacledCartDefault;
  home_default: TentacledHomeDefault;
  large_default: TentacledLargeDefault;
  medium_default: TentacledMediumDefault;
  small_default: TentacledSmallDefault;
  [property: string]: any;
}

export interface TentacledCartDefault {
  height: number;
  sources: Sources4;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources4 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledHomeDefault {
  height: number;
  sources: Sources5;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources5 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledLargeDefault {
  height: number;
  sources: Sources6;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources6 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledMediumDefault {
  height: number;
  sources: Sources7;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources7 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledSmallDefault {
  height: number;
  sources: Sources8;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources8 {
  jpg: string;
  [property: string]: any;
}

export interface FluffyLarge {
  height: number;
  sources: Sources9;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources9 {
  jpg: string;
  [property: string]: any;
}

export interface FluffyMedium {
  height: number;
  sources: Sources10;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources10 {
  jpg: string;
  [property: string]: any;
}

export interface FluffySmall {
  height: number;
  sources: Sources11;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources11 {
  jpg: string;
  [property: string]: any;
}

export interface EmbeddedAttributesImage {
  associatedVariants: string[];
  bySize: TentacledBySize;
  cover: number | null;
  id_image: number;
  large: TentacledLarge;
  legend: string;
  medium: TentacledMedium;
  original_url: string;
  position: number;
  small: TentacledSmall;
  [property: string]: any;
}

export interface TentacledBySize {
  cart_default: StickyCartDefault;
  home_default: StickyHomeDefault;
  large_default: StickyLargeDefault;
  medium_default: StickyMediumDefault;
  small_default: StickySmallDefault;
  [property: string]: any;
}

export interface StickyCartDefault {
  height: number;
  sources: Sources12;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources12 {
  jpg: string;
  [property: string]: any;
}

export interface StickyHomeDefault {
  height: number;
  sources: Sources13;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources13 {
  jpg: string;
  [property: string]: any;
}

export interface StickyLargeDefault {
  height: number;
  sources: Sources14;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources14 {
  jpg: string;
  [property: string]: any;
}

export interface StickyMediumDefault {
  height: number;
  sources: Sources15;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources15 {
  jpg: string;
  [property: string]: any;
}

export interface StickySmallDefault {
  height: number;
  sources: Sources16;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources16 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledLarge {
  height: number;
  sources: Sources17;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources17 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledMedium {
  height: number;
  sources: Sources18;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources18 {
  jpg: string;
  [property: string]: any;
}

export interface TentacledSmall {
  height: number;
  sources: Sources19;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources19 {
  jpg: string;
  [property: string]: any;
}

export interface DataImage {
  associatedVariants: string[];
  bySize: StickyBySize;
  cover: number | null;
  id_image: number;
  large: StickyLarge;
  legend: string;
  medium: StickyMedium;
  original_url: string;
  position: number;
  small: StickySmall;
  [property: string]: any;
}

export interface StickyBySize {
  cart_default: IndigoCartDefault;
  home_default: IndigoHomeDefault;
  large_default: IndigoLargeDefault;
  medium_default: IndigoMediumDefault;
  small_default: IndigoSmallDefault;
  [property: string]: any;
}

export interface IndigoCartDefault {
  height: number;
  sources: Sources20;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources20 {
  jpg: string;
  [property: string]: any;
}

export interface IndigoHomeDefault {
  height: number;
  sources: Sources21;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources21 {
  jpg: string;
  [property: string]: any;
}

export interface IndigoLargeDefault {
  height: number;
  sources: Sources22;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources22 {
  jpg: string;
  [property: string]: any;
}

export interface IndigoMediumDefault {
  height: number;
  sources: Sources23;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources23 {
  jpg: string;
  [property: string]: any;
}

export interface IndigoSmallDefault {
  height: number;
  sources: Sources24;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources24 {
  jpg: string;
  [property: string]: any;
}

export interface StickyLarge {
  height: number;
  sources: Sources25;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources25 {
  jpg: string;
  [property: string]: any;
}

export interface StickyMedium {
  height: number;
  sources: Sources26;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources26 {
  jpg: string;
  [property: string]: any;
}

export interface StickySmall {
  height: number;
  sources: Sources27;
  url: string;
  width: number;
  [property: string]: any;
}

export interface Sources27 {
  jpg: string;
  [property: string]: any;
}

export interface Labels {
  tax_long: string;
  tax_short: string;
  [property: string]: any;
}

export interface MainVariant {
  add_to_cart_url: string;
  html_color_code: string;
  id_attribute: number;
  id_product: number;
  id_product_attribute: number;
  name: string;
  texture: string;
  type: string;
  url: string;
  [property: string]: any;
}

export interface CategoryProductListVO {
  /**
   * 总数
   */
  count: number;
  data: CategoryProductListDataVO[];
  /**
   * 查询数量
   */
  limit: number;
  /**
   * 起始数，offset+limit<count 表明还有数据
   */
  offset: number;
}

export interface CategoryProductListQuery extends ShopPageQuery, ShopTokenQuery {
  cate_id?: string;
  hasChild?: string;
}

export interface CategoryProductQuery extends ShopTokenQuery {
  id: string;
  id_currency: string;
  SubmitCurrency: string;
  id_shop?: string;
}

/**
 * 添加购物车
 */
export interface ShoppingCartQuery {
  /**
   * 购物车token
   */
  token: string;
  /**
   * 商品id
   */
  id_product: string;
  /**
   * 商品自定义id
   */
  id_customization: string;

  'design_option[total_price]': string | number;

  /**
   * 加入购物车数量
   */
  qty: string | number;

  add: string | number;
  /**
   * 固定值不用改
   */
  action: 'update';
  /**
   * 商品属性id
   */
  id_product_attribute?: string;
  /**
   * 成品图
   */
  finished_image?: string;
}

/**
 * 添加购物车
 */
export interface ShoppingCartQueryOld {
  /**
   * 购物车token
   */
  token: string;
  /**
   * 固定值不用改
   */
  action: 'add-to-cart';
  /**
   * 商品自定义id
   */
  id_customization: string;
  /**
   * 商品id
   */
  id_product: string;
  /**
   * 商品属性id
   */
  id_product_attribute?: string;
  /**
   * 加入购物车数量
   */
  qty: string | number;
  /**
   * 成品图
   */
  finished_image?: string;
}

export interface DesignOption {
  id_design_option: string;
  pid: string;
  id_design_template: string;
  id_design_option_type: string;
  title: string;
  is_required: string;
  column_width: string;
  is_allow_multiple: string;
  id_product: string;
  price: string;
  sku: string;
  weight: string;
  swatches_image: any;
  swatches_color: any;
  has_stock: any;
  is_default: any;
  min_characters: any;
  max_characters: any;
  default_text: any;
  placeholder_text: any;
  file_type: string;
  cropped_type: string;
  min_file_num: string;
  max_file_num: string;
  date_format: any;
  min_date: any;
  max_date: any;
  weekly_limit: any;
  limit_by_date: any;
  limit_specific_dates: any;
  help_text: any;
  tooltip: any;
  help_text_position: string;
  div_class: any;
  is_hide_title: string;
  is_onetime_fee: string;
  bring_into_the_cart: string;
  popup_box_image: any;
  popup_box_title: any;
  popup_box_width: string;
  popup_box_desc: any;
  use_option_choices_qty: string;
  min_number_of_choices: string;
  max_number_of_choices: string;
  sort: string;
  children: any[];
}

export interface TemplateListVo {
  [key: string]: DesignOption;
}

export interface TemplateOptionChild {
  // 模板选项标题
  title: string; // 对应 item.label
  // 捆绑商品时使用
  id_product?: string | number;
  // 模板选项价格
  price: string | number; // 固定为0
}

export interface TemplateOptionParams {
  // 类型  固定
  type: 'edit_option';
  // 模板id
  id_design_template: string | number;
  // 模板选项类型 1文本 2长文本 3文件上传 4日期 5日期区间 6拾色器 7下拉框 8单选框 9复选框 10按钮
  id_design_option_type: '7';
  // 模板选项id  新建传0
  id_design_option: number;
  // 模板选项标题
  title: string;
  // 选项
  children?: TemplateOptionChild[];
}
