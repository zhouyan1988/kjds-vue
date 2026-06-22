<template>
  <div class="l-cart-box">
    <el-row :gutter="44">
      <el-col :xl="14" :lg="14" :md="14" :sm="14" :xs="24">
        <div ref="carouselRef" v-loading="loading" class="l-cart-carousel main-image" element-loading-background="rgba(255, 255, 255, 1)">
          <div class="konvajs-content" :style="{ width: carouselWidth + 'px', height: carouselHeight + 'px' }">
            <canvas ref="canvasRef" :style="{ width: carouselWidth + 'px', height: carouselHeight + 'px' }"></canvas>
          </div>
        </div>
        <div class="slider slider--no-scrollbar">
          <ul class="slider__grid">
            <li v-for="(i, idx) in productData?.images" :key="'image' + idx" class="slider__item">
              <div class="ar-contain" :class="{ 'is-active': selImg === idx }" @click.stop="handleCarousel(idx)">
                <img :src="i.original_url" :alt="i.legend" :title="i.legend" width="1000" height="1000" sizes="65px" class="theme-img" />
              </div>
            </li>
          </ul>
        </div>
      </el-col>
      <!-- 右侧 我试试 git add gunba .的 -->
      <el-col :xl="10" :lg="10" :md="10" :sm="10" :xs="24">
        <div ref="productInfoRef" class="product-information vvvvvv滚吧12345八嘎">
          <div class="title-row">
            <h1 class="product-title">{{ productData.name }}</h1>
          </div>
          <div class="price-container">
            <div class="product-info__price product-price product-price--large">
              <div class="price price--on-sale">
                <div v-if="!productData.discount_percentage_absolute" class="price__default">
                  <span class="price__current"> {{ productData.price }} {{ iso_code }} </span>
                  <span class="price__was">{{ productData.originprice }}</span>
                </div>
                <div v-else class="price__default">
                  <span class="price__current"> {{ productData.price }} {{ iso_code }} </span>
                </div>
              </div>
            </div>
          </div>
          <el-form label-position="top" label-width="80px">
            <el-form-item :label="productMergeStyleData.templateOptionLabel">
              <el-select v-model="selCurtTempl" placeholder="Please choose" @change="changeTempl">
                <el-option v-for="(item, index) in styleDataTempls" :key="'templ_' + index" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="l-templ-box">
            <!-- target="_parent"-->
            <form ref="cartFormRef" :action="cartFormAction" method="post">
              <input id="product_shop_token" type="hidden" name="token" :value="token" />
              <input id="product_page_product_id" type="hidden" name="id_product" :value="id_product" />
              <input id="product_customization_id" type="hidden" name="id_customization" :value="id_customization" />
              <input id="product_attribute" type="hidden" name="id_product_attribute" :value="id_product_attribute" />

              <input type="hidden" name="add" value="1" />
              <input type="hidden" name="action" value="update" />

              <input id="design_option_total_price" type="hidden" name="design_option[total_price]" :value="designOptionTotalPrice" />
              <input id="file_design_option" type="file" name="file_design_option" multiple style="display: none" />

              <!--原系统属性-->
              <div id="option-detail-show" style="display: none !important">
                <div
                  v-for="(item, key) in designAttr.design_option_result"
                  :id="'design_group_' + item.id_design_option"
                  :key="key"
                  class="form-group option-detail-div"
                  :data-type="item.id_design_option_type"
                  :data-id="item.id_design_option"
                >
                  <label v-if="item.id_design_option_types !== '13' && item.id_design_option_types !== '14'" style="font-weight: bold">
                    <template v-if="item.is_hide_title === 0">{{ item.title }}</template>
                    <span v-if="item.is_required === 1" style="color: red">*</span>
                    <a
                      v-if="item.popup_box_image"
                      data-toggle="modal"
                      data-target="#show_popup_box_desc"
                      class="show_popup_box_desc"
                      :data-id="item.id_design_option"
                    >
                      <img :src="item.popup_box_image" class="img-responsive" style="max-height: 30px; max-width: 30px; margin: 0 10px" alt="" />
                    </a>
                    <template v-if="item.popup_box_title">{{ item.popup_box_title }}</template>
                    <span
                      v-if="item.tooltip"
                      class="help-box"
                      data-toggle="popover"
                      data-trigger="hover"
                      data-html="true"
                      :data-content="item.tooltip"
                      data-original-title=""
                      title=""
                    ></span>
                    <span :id="'price_total_' + item.id_design_option" style="margin-left: 20px; font-weight: normal"></span>
                    <input
                      v-if="item.title !== 'finished_image' && item.title !== 'design_image'"
                      :id="'price_' + item.id_design_option"
                      type="hidden"
                      :name="'design_option[price][' + item.id_design_option + ']'"
                      class="price_calc"
                      value="0"
                    />
                  </label>
                  <br v-if="item.help_text && (item.help_text_position === 2 || item.help_text_position === 3)" />
                  <span v-if="item.help_text && (item.help_text_position === 2 || item.help_text_position === 3)" style="color: #cccccc">{{
                    item.help_text
                  }}</span>

                  <!--不同选项类型-->
                  <div v-if="item.id_design_option_types === '1'" :id="'detail_' + item.id_design_option">
                    <input
                      type="text"
                      class="form-control input-type-1-change"
                      :class="item.div_class ? ' ' + item.div_class : ''"
                      :placeholder="item.placeholder_text || ''"
                      :minlength="item.min_characters"
                      :maxlength="item.max_characters"
                      :style="{ width: item.column_width + '%' }"
                      :value="item.default_text"
                      :name="'design_option[' + item.id_design_option + ']'"
                    />
                  </div>
                  <div v-else-if="item.id_design_option_types === '2'" :id="'detail_' + item.id_design_option">
                    <textarea
                      v-model="item.default_text"
                      class="form-control textarea-type-2-change"
                      :class="item.div_class ? ' ' + item.div_class : ''"
                      :style="{ width: item.column_width + '%' }"
                      :minlength="item.min_characters"
                      :maxlength="item.max_characters"
                      :placeholder="item.placeholder_text || ''"
                      :name="'design_option[' + item.id_design_option + ']'"
                    ></textarea>
                  </div>
                  <div v-else-if="item.id_design_option_types === '3'" :id="'detail_' + item.id_design_option">
                    <div class="image_show">
                      <div
                        class="upload-image"
                        style="width: 50px; height: 50px; border: 1px dashed #444444; cursor: pointer; display: inline-block"
                        @click="handleClick"
                      >
                        <i class="material-icons" style="font-size: 48px">add_a_photo</i>
                      </div>
                    </div>
                    <template v-if="item.title === 'finished_image'">
                      <input class="finished_image" type="hidden" name="design_option_images[]" :value="designOptionFinishedImages" />
                      <input
                        :id="'price_' + item.id_design_option"
                        type="hidden"
                        :name="'design_option[price][' + item.id_design_option + ']'"
                        class="price_calc"
                        :value="selCurtTemplPrice"
                      />
                      <input type="hidden" name="design_option_ids[images][]" :value="item.id_design_option" />
                    </template>
                    <template v-else-if="item.title === 'design_image'">
                      <input
                        :id="'price_' + item.id_design_option"
                        type="hidden"
                        :name="'design_option[price][' + item.id_design_option + ']'"
                        class="price_calc"
                        :value="0"
                      />
                    </template>
                    <template v-else>
                      <input type="hidden" name="design_option_images[]" value="" />
                      <input type="hidden" name="design_option_ids[images][]" :value="item.id_design_option" />
                    </template>
                  </div>
                  <div v-else-if="item.id_design_option_types === '4'" :id="'detail_' + item.id_design_option">
                    <input
                      type="text"
                      class="form-control datepicker"
                      :class="item.div_class ? ' ' + item.div_class : ''"
                      :style="{ width: item.column_width + '%' }"
                      :placeholder="item.placeholder_text || ''"
                      :name="'design_option[' + item.id_design_option + ']'"
                    />
                  </div>
                  <div v-else-if="item.id_design_option_types === '5'" :id="'detail_' + item.id_design_option">
                    <input
                      type="text"
                      class="form-control datepicker"
                      :class="item.div_class ? ' ' + item.div_class : ''"
                      :style="{ width: item.column_width + '%' }"
                      :placeholder="item.placeholder_text || ''"
                      :name="'design_option[' + item.id_design_option + ']'"
                    />
                  </div>
                  <div v-else-if="item.id_design_option_types === '6'" :id="'detail_' + item.id_design_option">
                    <div :id="'pick_' + item.id_design_option" style="width: 40px; height: 40px; float: left; margin-right: 5px"></div>
                    <div style="width: 80%; display: inline-block">
                      <input
                        :id="'input_' + item.id_design_option"
                        type="text"
                        class="form-control"
                        :class="item.div_class ? ' ' + item.div_class : ''"
                        :style="{ width: item.column_width + '%' }"
                        :placeholder="item.placeholder_text || ''"
                        :name="'design_option[' + item.id_design_option + ']'"
                      />
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '7'" :id="'detail_' + item.id_design_option">
                    <div style="width: 60%; display: inline-block">
                      <select
                        :id="'select2' + item.id_design_option"
                        class="form-control js-select2"
                        :class="item.div_class"
                        :multiple="item.is_allow_multiple === 1"
                        :name="'design_option[' + item.id_design_option + '][value][]'"
                      >
                        <option v-for="v in item.children" :key="v.id_design_option" :value="v.id_design_option" :selected="v.is_default === 1">
                          {{ v.title }}
                        </option>
                      </select>
                    </div>
                    <div style="width: 40%" :style="{ display: item.use_option_choices_qty === 1 ? 'inline-block' : 'none' }">
                      Qty:
                      <input
                        :id="'qty_' + item.id_design_option"
                        v-model.number="item.qty"
                        type="number"
                        class="form-control"
                        style="width: 80px; display: inline-block"
                        :disabled="item.use_option_choices_qty === 0"
                        :min="item.min_number_of_choices"
                        :max="item.max_number_of_choices"
                        :name="'design_option[' + item.id_design_option + '][qty]'"
                      />
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '8'" :id="'detail_' + item.id_design_option">
                    <div v-for="v in item.children" :key="v.id_design_option">
                      <div style="width: 60%; display: inline-block">
                        <div class="">
                          <label :for="'customRadio' + v.id_design_option" class="radio-inline">
                            <span class="custom-radio">
                              <input
                                :id="'customRadio' + v.id_design_option"
                                type="radio"
                                class="customRadio"
                                :value="v.id_design_option"
                                :checked="v.is_default === 1"
                                :name="'design_option[' + item.id_design_option + '][value]'"
                              />
                              <span></span>
                            </span>
                            {{ v.title }}
                          </label>
                        </div>
                      </div>
                      <div style="width: 40%" :style="{ display: item.use_option_choices_qty === 1 ? 'inline-block' : 'none' }">
                        Qty:
                        <input
                          :id="'qty_' + v.id_design_option"
                          v-model.number="v.qty"
                          type="number"
                          class="form-control"
                          style="width: 80px; display: inline-block"
                          :disabled="item.use_option_choices_qty === 0"
                          :min="item.min_number_of_choices"
                          :max="item.max_number_of_choices"
                          :name="'design_option[' + item.id_design_option + '][qty][' + v.id_design_option + ']'"
                        />
                      </div>
                      <br />
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '9'" :id="'detail_' + item.id_design_option">
                    <div v-for="v in item.children" :key="v.id_design_option">
                      <div style="width: 60%; display: inline-block">
                        <div>
                          <span class="custom-checkbox">
                            <label>
                              <input
                                :id="'customCheck' + v.id_design_option"
                                :name="'design_option[' + item.id_design_option + '][value][]'"
                                type="checkbox"
                                class="customCheck"
                                :value="v.id_design_option"
                                :checked="v.is_default === 1"
                              />
                              <span>
                                <i class="material-icons rtl-no-flip checkbox-checked"></i>
                              </span>
                              {{ v.title }}
                            </label>
                          </span>
                        </div>
                      </div>
                      <div style="width: 40%" :style="{ display: item.use_option_choices_qty === 1 ? 'inline-block' : 'none' }">
                        Qty:
                        <input
                          :id="'qty_' + v.id_design_option"
                          v-model.number="v.qty"
                          type="number"
                          class="form-control"
                          style="width: 80px; display: inline-block"
                          :disabled="item.use_option_choices_qty === 0"
                          :min="item.min_number_of_choices"
                          :max="item.max_number_of_choices"
                          :name="'design_option[' + item.id_design_option + '][qty][' + v.id_design_option + ']'"
                        />
                      </div>
                      <br />
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '10'" :id="'detail_' + item.id_design_option">
                    <template v-if="!item.use_option_choices_qty">
                      <div>
                        <button
                          v-for="v in item.children"
                          :id="'button_click' + v.id_design_option"
                          :key="v.id_design_option"
                          type="button"
                          style="margin: 2px"
                          :class="['btn button-click', item.div_class, v.is_default === 1 ? 'btn-dark' : 'btn-outline-dark']"
                          :data-id="v.id_design_option"
                          @click="toggleButton(v)"
                        >
                          {{ v.title }}
                        </button>
                        <input
                          v-for="v in item.children"
                          :id="'button_hide_input_' + v.id_design_option"
                          :key="v.id_design_option"
                          type="hidden"
                          :name="'design_option[' + item.id_design_option + '][value][' + v.id_design_option + ']'"
                          :value="v.is_selected ? 1 : 0"
                        />
                      </div>
                    </template>
                    <template v-else>
                      <div v-for="v in item.children" :key="v.id_design_option">
                        <div style="width: 60%; display: inline-block">
                          <button
                            :id="'button_click' + v.id_design_option"
                            type="button"
                            :class="['btn button-click', item.div_class, v.is_default === 1 ? 'btn-dark' : 'btn-outline-dark']"
                            :data-id="v.id_design_option"
                            @click="toggleButton(v)"
                          >
                            {{ v.title }}
                          </button>
                          <input
                            :id="'button_hide_input_' + v.id_design_option"
                            type="hidden"
                            :name="'design_option[' + item.id_design_option + '][value][' + v.id_design_option + ']'"
                            :value="v.is_selected ? 1 : 0"
                          />
                        </div>
                        <div style="width: 40%; display: inline-block">
                          Qty:
                          <input
                            :id="'qty_' + v.id_design_option"
                            v-model.number="v.qty"
                            type="number"
                            class="form-control"
                            style="width: 80px; display: inline-block"
                            :min="item.min_number_of_choices"
                            :max="item.max_number_of_choices"
                            :name="'design_option[' + item.id_design_option + '][qty][' + v.id_design_option + ']'"
                          />
                        </div>
                        <br />
                      </div>
                    </template>
                  </div>
                  <div v-else-if="item.id_design_option_types === '11'" :id="'detail_' + item.id_design_option">
                    <template v-if="!item.use_option_choices_qty">
                      <div
                        v-for="v in item.children"
                        :id="'swatches_click' + v.id_design_option"
                        :key="v.id_design_option"
                        :class="['swatches_click', v.is_default === 1 ? 'border_red' : '']"
                        :data-is_allow_multiple="item.is_allow_multiple"
                        :data-id="v.id_design_option"
                        style="float: left; margin: 2px"
                        @click="toggleSwatch(v)"
                      >
                        <img
                          v-if="v.swatches_image"
                          :src="v.swatches_image"
                          style="max-width: 46px; max-height: 46px; margin: 1px; cursor: pointer"
                          alt=""
                        />
                        <div
                          v-else-if="v.swatches_color"
                          :style="{
                            display: 'inline-block',
                            width: '46px',
                            height: '46px',
                            margin: '1px',
                            cursor: 'pointer',
                            backgroundColor: v.swatches_color
                          }"
                        ></div>
                        <div
                          v-else
                          style="display: inline-block; width: 46px; height: 46px; margin: 1px; cursor: pointer; border: 1px solid #cccccc"
                        ></div>
                        <input
                          :id="'button_hide_input_' + v.id_design_option"
                          type="hidden"
                          :name="'design_option[' + item.id_design_option + '][value][' + v.id_design_option + ']'"
                          :value="v.is_selected ? 1 : 0"
                        />
                      </div>
                      <div style="clear: both"></div>
                    </template>

                    <template v-else>
                      <div v-for="v in item.children" :key="v.id_design_option" style="width: 100%; height: 50px; margin-bottom: 5px">
                        <div style="width: 60%; float: left">
                          <div
                            :id="'swatches_click' + v.id_design_option"
                            :class="['swatches_click', v.is_default === 1 ? 'border_red' : '']"
                            :data-is_allow_multiple="item.is_allow_multiple"
                            :data-id="v.id_design_option"
                            @click="toggleSwatch(v)"
                          >
                            <img
                              v-if="v.swatches_image"
                              :src="v.swatches_image"
                              style="max-width: 46px; max-height: 46px; margin: 1px; cursor: pointer"
                              alt=""
                            />
                            <div
                              v-else-if="v.swatches_color"
                              :style="{
                                display: 'inline-block',
                                width: '46px',
                                height: '46px',
                                margin: '1px',
                                cursor: 'pointer',
                                backgroundColor: v.swatches_color
                              }"
                            ></div>
                            <div
                              v-else
                              style="display: inline-block; width: 46px; height: 46px; margin: 1px; cursor: pointer; border: 1px solid #cccccc"
                            ></div>
                            <input
                              :id="'button_hide_input_' + v.id_design_option"
                              type="hidden"
                              :name="'design_option[' + item.id_design_option + '][value][' + v.id_design_option + ']'"
                              :value="v.is_selected ? 1 : 0"
                            />
                          </div>
                        </div>
                        <div style="width: 40%; float: left">
                          Qty:
                          <input
                            :id="'qty_' + v.id_design_option"
                            v-model.number="v.qty"
                            type="number"
                            class="form-control"
                            style="width: 80px; display: inline-block"
                            :min="item.min_number_of_choices"
                            :max="item.max_number_of_choices"
                            :name="'design_option[' + item.id_design_option + '][qty][' + v.id_design_option + ']'"
                          />
                        </div>
                      </div>
                      <div style="clear: both"></div>
                    </template>
                  </div>
                  <div v-else-if="item.id_design_option_types === '12'" :id="'detail_' + item.id_design_option">
                    <div style="width: 60%; display: inline-block">
                      <select
                        :id="'select2_img' + item.id_design_option"
                        class="form-control js-select2_img"
                        :class="item.div_class"
                        :multiple="item.is_allow_multiple === 1"
                        :name="'design_option[' + item.id_design_option + '][value][]'"
                      >
                        <option
                          v-for="v in item.children"
                          :key="v.id_design_option"
                          :value="v.id_design_option"
                          :selected="v.is_default === 1"
                          :disabled="v.id_design_option === 158"
                        >
                          {{ v.title }}
                        </option>
                      </select>
                    </div>
                    <div style="width: 40%; display: inline-block" :style="{ display: item.use_option_choices_qty === 1 ? 'inline-block' : 'none' }">
                      Qty:
                      <input
                        :id="'qty_' + item.id_design_option"
                        v-model.number="item.qty"
                        type="number"
                        class="form-control"
                        style="width: 80px; display: inline-block"
                        :disabled="item.use_option_choices_qty === 0"
                        :min="item.min_number_of_choices"
                        :max="item.max_number_of_choices"
                        :name="'design_option[' + item.id_design_option + '][qty]'"
                      />
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '13'" :id="'detail_' + item.id_design_option">
                    <div :style="{ width: item.column_width + '%' }" :class="item.div_class ? ' ' + item.div_class : ''">
                      <div v-dompurify-html="item.popup_box_desc"></div>
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '14'" :id="'detail_' + item.id_design_option">
                    <br />
                    <a
                      data-toggle="modal"
                      data-target="#show_popup_box_desc"
                      class="show_popup_box_desc"
                      :data-id="item.id_design_option"
                      @click="showPopup"
                    >
                      <img :src="item.popup_box_image" style="max-width: 30px; max-height: 30px" alt="Popup Box Image" />
                    </a>
                  </div>
                  <div v-else-if="item.id_design_option_types === '15'" :id="'detail_' + item.id_design_option">
                    <div class="form-group">
                      <div>
                        <span class="custom-checkbox">
                          <label>
                            <input
                              :id="'customSwitch' + item.id_design_option"
                              type="checkbox"
                              :name="'design_option[' + item.id_design_option + '][value][]'"
                              class="customSwitch"
                              :value="item.id_design_option"
                              :checked="item.is_default === 1"
                              @change="handleCheckboxChange"
                            />
                            <span>
                              <i class="material-icons rtl-no-flip checkbox-checked"></i>
                            </span>
                            {{ item.title }}
                          </label>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="item.id_design_option_types === '16'" :id="'detail_' + item.id_design_option">
                    <div></div>
                  </div>
                  <span
                    v-if="
                      item.id_design_option_types !== '13' && item.id_design_option_types !== '14' && item.help_text && item.help_text_position === 1
                    "
                    style="color: #cccccc"
                  >
                    {{ item.help_text }}
                  </span>

                  <span :id="'message' + item.id_design_option" style="color: red; display: none">This is a required field.</span>
                </div>
              </div>
              <!--规格 Start-->
              <div class="product-variants">
                <template v-for="(group, key) in groupsAttr.groups">
                  <div v-if="group.attributes" :key="key" class="product-variants-item clearfix">
                    <span class="control-label"
                      >{{ group.name }}:
                      <template v-for="(groupAttribute, idAttribute) in group.attributes">
                        <span v-if="groupAttribute.selected" :key="idAttribute">
                          {{ groupAttribute.name }}
                        </span>
                      </template>
                    </span>
                    <template v-if="group.group_type === 'select'">
                      <select
                        :id="'group_' + key"
                        class="form-control form-control-select"
                        :aria-label="group.name"
                        :data-product-attribute="key"
                        :name="'group[' + key + ']'"
                        @change="onSelectChange(group.attributes, $event)"
                      >
                        <option
                          v-for="(groupAttribute, idAttribute) in group.attributes"
                          :key="idAttribute"
                          :value="idAttribute"
                          :title="groupAttribute.name"
                          :selected="groupAttribute.selected"
                        >
                          {{ groupAttribute.name }}
                        </option>
                      </select>
                    </template>
                    <template v-else-if="group.group_type === 'size'">
                      <select
                        :id="'group_' + key"
                        class="form-control form-control-select"
                        :aria-label="group.name"
                        :data-product-attribute="key"
                        :name="'group[' + key + ']'"
                        @change="onSelectChange(group.attributes, $event)"
                      >
                        <option
                          v-for="(groupAttribute, idAttribute) in group.attributes"
                          :key="idAttribute"
                          :value="idAttribute"
                          :title="groupAttribute.name"
                          :selected="groupAttribute.selected"
                        >
                          {{ groupAttribute.name }}
                        </option>
                      </select>
                    </template>
                    <template v-else-if="group.group_type === 'color'">
                      <ul :id="'group_' + key">
                        <li v-for="(groupAttribute, idAttribute) in group.attributes" :key="idAttribute" class="float-xs-left input-container">
                          <label :aria-label="groupAttribute.name">
                            <input
                              class="input-color"
                              type="radio"
                              :data-product-attribute="key"
                              :name="'group[' + key + ']'"
                              :value="idAttribute"
                              :title="groupAttribute.name"
                              :checked="groupAttribute.selected"
                              @change="onColorChange(group.attributes, idAttribute)"
                            />
                              <span
                                :class="[groupAttribute.texture ? 'color texture' : 'color', groupAttribute.name]"
                                :style="{
                                  'background-image': groupAttribute.texture ? `url(${groupAttribute.texture})` : '',
                                  'background-color': groupAttribute.html_color_code || ''
                                }"
                              >
                                <span class="attribute-name sr-only">{{ groupAttribute.name }}</span>
                              </span>
                          </label>
                        </li>
                      </ul>
                    </template>
                    <template v-else-if="group.group_type === 'radio'">
                      <ul :id="'group_' + key">
                        <li v-for="(groupAttribute, idAttribute) in group.attributes" :key="idAttribute" class="input-container float-xs-left">
                          <label>
                            <input
                              class="input-radio"
                              type="radio"
                              :data-product-attribute="key"
                              :name="'group[' + key + ']'"
                              :value="idAttribute"
                              :title="groupAttribute.name"
                              :checked="groupAttribute.selected"
                              @change="onRadioChange(group.attributes, idAttribute)"
                            />
                            <span class="radio-label">{{ groupAttribute.name }}</span>
                          </label>
                        </li>
                      </ul>
                    </template>
                  </div>
                </template>
              </div>
              <!--规格 End-->
              <div>
                <div v-for="(i, idx) in templJsonObjects" :key="idx">
                  <!--选项-->
                  <template v-if="i?.type === EditorTypeEnum.Options && i?.optDisplayMode && fabricCanvasEditor.isCanRenderTempl(i)">
                    <div class="title">
                      {{ i.lLabel || 'option' }}
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
                        <Select v-model="i.optDefVal" @on-change="onOptionChange($event, i)">
                          <Option v-for="item in i?.optArres" :key="item.value" :value="item.value">
                            <div class="l-option-price-box">
                              <span class="l-option-label">{{ item.label }}</span>
                              <span class="l-option-price">{{ item.setPrice ? getPricePrefix(id_currency as string) + item.price : '' }}</span>
                            </div>
                          </Option>
                        </Select>
                      </template>
                      <!--按钮-->
                      <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Button">
                        <RadioGroup v-model="i.optDefVal" type="button" button-style="solid" @on-change="onOptionChange($event, i)">
                          <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                            <span>{{ item.label }}</span>
                          </Radio>
                        </RadioGroup>
                      </template>
                      <!--图像切换器-->
                      <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Image">
                        <RadioGroup v-model="i.optDefVal" class="l-radio-group-img" @on-change="onOptionChange($event, i)">
                          <Radio v-for="(item, index) in i?.optArres" :key="index" :label="item.value">
                            <Image class="l-radio-group-image" :src="item.image" fit="contain" width="70px" height="70px">
                              <template #placeholder> &nbsp;&nbsp; </template>
                            </Image>
                          </Radio>
                        </RadioGroup>
                      </template>
                      <!--颜色切换器-->
                      <template v-else-if="i?.optDisplayMode === OptionsDisplayMode.Color">
                        <RadioGroup v-model="i.optDefVal" class="l-radio-group-color" @on-change="onOptionChange($event, i)">
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
                        <Switch v-model="i.optToggle.enable" @on-change="onOptionChange" />
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
                      :placeholder="i.lPlaceholder || 'Please enter custom text'"
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
                      <RadioGroup v-model="i.src" class="l-personalized-img" @on-change="changeImage(i)">
                        <Radio v-for="(item, index) in i?.personalizedImgs" :key="index" :label="item.src">
                          <div class="l-personalized-img-radio">
                            <Image class="l-personalized-image" :src="item.src" fit="contain" width="70px" height="70px">
                              <template #placeholder> &nbsp;&nbsp; </template>
                            </Image>
                            <div v-if="item.name" class="l-personalized-image-text">{{ getName(item.name) }}</div>
                            <div v-else class="l-personalized-image-text">&nbsp;&nbsp;</div>
                          </div>
                          <!--定制图片-->
                          <div v-if="typeof i === 'object' && i.src === item.src" class="postionSelect" style="display: none !important">
                            <template v-for="(di, didx) in designAttr.design_option_result">
                              <div v-if="di.title === 'design_image'" :key="`postion_select_` + didx" style="display: none !important">
                                <input class="design_image" type="hidden" name="design_option_images[]" :value="item.src" />
                                <input type="hidden" name="design_option_ids[images][]" :value="di.id_design_option" />
                              </div>
                            </template>
                          </div>
                        </Radio>
                      </RadioGroup>
                    </div>
                    <div v-else-if="i?.userupload" class="imgBox">
                      <div class="imgList">
                        Upload
                        <div class="img-upload" @click.stop="changeUploadImage(i)">
                          <div v-if="!i?.src" class="img-upload-inner">
                            <Icon type="ios-cloud-upload-outline" size="30" color="#ee3c54" />
                          </div>
                          <div v-else class="img-upload-inner">
                            <img :src="i.src" alt="" style="width: 100%; height: 100%" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div v-if="!is_catalog" class="product-add-to-cart js-product-add-to-cart">
                <span class="control-label">Quantity</span>
                <div class="product-quantity clearfix">
                  <div class="qty">
                    <el-input-number v-model="qty" name="qty" :min="1" step-strictly @change="handleQtyChange" />
                  </div>
                  <div style="position: relative; height: 50px;">
                    <el-button 
                      v-show="!buttonLoading" 
                      class="add-to-cart-btn" 
                      type="info" 
                      style="width: 100%; height: 100%;"
                      @click="handleShoppingCartAdd"
                    >
                      <Icon type="md-cart" /> ADD TO CART
                    </el-button>
                    <div 
                      v-show="buttonLoading" 
                      id="cart-btn-loading" 
                      style="position: absolute; left: 0; top: 25px; width: 100%; height: 100%; background: #333; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 4px;"
                    >
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="not-in-quickbuy" style="display:none;">
                <div class="product-description rte cf">
                  <p class="md:tw-px-4 hide-scrollbar tw-overflow-hidden mce__content product_detail__content">
                    <strong>Product Description:</strong>
                  </p>
                  <p v-dompurify-html="productData.description"></p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, watch, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { getProductMergeStyleNewest } from '@/api/kjds/productMergeStyle';
import { numericalArithmetic } from '@deary/utils';
import { EditorTypeEnum, FabricObjectVO, OptionsDisplayMode } from '@/utils/editor';
import { getProductDetail } from '@/api/shop';
import { AttribugesGroups, CategoryProductDataVO, DataImage, DesignAttribute, TheAttributesChild } from '@/api/shop/types';
import { clearSelection, getPricePrefix, handleAttribugesGroups, handlePrice } from '@/utils';
import { ProductMergeStyleVO } from '@/api/kjds/productMergeStyle/types';
import { setShopToken } from '@/utils/auth';
import { useCanvasEditor, UseCanvasEditorTypeEnum } from '@/utils/FabricCanvasEditorUse';
import axios from 'axios';
import { Icon, Image, Option, Radio, RadioGroup, Tooltip } from 'view-ui-plus';

const route = useRoute();

// 解构路由 query 参数
const { productId, id_currency, id_shop, styleId, combinationId, is_catalog, token, id_product, id_customization, iso_code, id_product_attribute } =
  route.query;

const {
  loading,
  carouselWidth,
  carouselHeight,
  styleDataTempls,
  selCurtTempl,
  selCurtTemplPrice,
  templJsonObjects,
  buttonLoading,
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
  changeTempl,
  calcCurtTemplPrice,
  changeText,
  changeImage,
  changeUploadImage,
  changeOptions,
  changeImageColorOptions,
  calcCurtTemplOptionTotalPrice,
  getCurtTextConfig
} = useCanvasEditor();

const cartFormRef = ref<HTMLFormElement>(null);
const cartFormAction = ref(import.meta.env.VITE_APP_SHOP_API + '/cart');
const cartFormRefreshUrl = ref(cartFormAction.value + '?ajax=1&action=refresh');
const psShoppingCartUrl = ref(import.meta.env.VITE_APP_SHOP_API + '/module/ps_shoppingcart/ajax');
const carouselRef = ref<HTMLElement>(null);
const canvasRef = ref<HTMLElement>(null);

// 防止重复提交
const isSubmitting = ref(false);

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

/**
 * 通用错误提示
 */
const showError = (message = 'No available templates found') => {
  ElMessage.error(message);
};

/**
 * 切换产品轮播图
 * @param index 轮播图索引
 */
const handleCarousel = (index: number) => {
  selImg.value = index;

  nextTick(() => {
    const defaultUrl = productData.value?.default_image?.original_url;
    const url = productImgs.value?.[index]?.original_url || defaultUrl;

    initCanvas({
      carouselRef: carouselRef.value,
      canvasRef: canvasRef.value,
      useType: UseCanvasEditorTypeEnum.Cart,
      styleId: productMergeStyleNewest.value.styleId as string,
      combinationId: productMergeStyleNewest.value.id as string,
      productId: productId as string,
      productImageUrl: url,
      setOptionsPrice: false
    });
  });
};

const getProductData = async () => {
  if (!productId) return;

  try {
    const mergeStyleRes = await getProductMergeStyleNewest({
      productId: productId as string
    });

    if (!mergeStyleRes.data) {
      showError();
      return;
    }

    productMergeStyleNewest.value = mergeStyleRes.data;

    const productDetailRes = await getProductDetail({
      id: productId as string,
      id_currency: (id_currency as string) || '1',
      id_shop: (id_shop as string) || '1',
      SubmitCurrency: '1'
    });

    if (!productDetailRes?.data) return;

    const data = productDetailRes.data;
    productData.value = data;
    groupsAttr.value = handleAttribugesGroups(data?.attribugesGroups);
    designAttr.value = data?.designAttribute;
    productImgs.value = data?.images;

    handleCarousel(0);
    sendProductDescToParent();
  } catch (error) {
    showError();
  }
};

const handleQtyChange = () => {};

/**
 * 加入购物车
 */
const handleShoppingCartAdd = async () => {
  // 防止重复点击
  if (isSubmitting.value) {
    return;
  }

  if (!token) {
    ElMessage({
      message: 'Please login',
      type: 'warning'
    });
    return;
  }
  if (!id_product || !id_customization) {
    ElMessage({
      message: 'Product information is incomplete',
      type: 'warning'
    });
    return;
  }
  // 最少购买数量为1
  if (qty.value < 1) {
    qty.value = 1;
  }
  if (!cartFormRef.value) return;

  // 设置提交状态和加载状态
  isSubmitting.value = true;
  buttonLoading.value = true;

  // 等待 DOM 更新
  await nextTick();

  try {
    // 计算价格
    await calcPrice();

    // 获取 canvas 图片
    const imgInfo = await fabricCanvasEditor.getCanvasImage('base64');
    designOptionFinishedImages.value = imgInfo;

    // 等待 DOM 更新
    await nextTick();

    // 构建表单数据并提交
    const formData = new FormData(cartFormRef.value);
    const response = await axios.post(cartFormAction.value, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (response) {
      // ElMessage({
      //   message: 'ADD TO CART SUCCESS',
      //   type: 'success'
      // });
      
      setTimeout(() => {
        window.top.location.reload();
      }, 500);
      buttonLoading.value = false;
      isSubmitting.value = false;
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    ElMessage({
      message: 'ADD TO CART FAILED',
      type: 'warning'
    });
  } finally {
    // 无论成功还是失败，都要重置状态
    buttonLoading.value = false;
    isSubmitting.value = false;
  }
};

function updateDesignOption(pid, optionId, price = 0) {
  // 更新 select
  const selectEl: any = document.getElementById(`select2${pid}`);
  if (selectEl) {
    selectEl.value = optionId;
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 更新 price
  const priceInput: any = document.getElementById(`price_${pid}`);
  if (priceInput) {
    priceInput.value = price;
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

const onOptionChange = (ev?: string, item?: FabricObjectVO) => {
  changeOptions();
  if (ev && item) {
    try {
      // 获取当前选中的选项
      let curtOption;
      for (let j = 0; j < item.optArres.length; j++) {
        const jitem = item.optArres[j];
        if (jitem.value === ev) {
          curtOption = jitem;
          break;
        }
      }
      console.log(curtOption);
      const pid = curtOption.pid; // 1125
      const id_design_option = curtOption.id_design_option; // 1133
      const price = curtOption.price;
      updateDesignOption(pid, id_design_option, price);
    } catch (error) {
      console.error(error);
    }
  }
};

const onSelectChange = (attrs: TheAttributesChild, event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedValue = target?.value;
  if (attrs && Object.keys(attrs).length > 0 && selectedValue in attrs) {
    clearSelection(attrs);
    attrs[selectedValue].selected = true;
    handlePrice(productData.value as CategoryProductDataVO, groupsAttr.value, id_currency as string, templJsonObjects.value);
  }
};

const onColorChange = (attrs: TheAttributesChild, idAttribute: string | number) => {
  if (attrs && Object.keys(attrs).length > 0 && idAttribute in attrs) {
    clearSelection(attrs);
    attrs[idAttribute].selected = true;
    handlePrice(productData.value as CategoryProductDataVO, groupsAttr.value, id_currency as string, templJsonObjects.value);
  }
};

const onRadioChange = (attrs: TheAttributesChild, idAttribute: string | number) => {
  if (attrs && Object.keys(attrs).length > 0 && idAttribute in attrs) {
    clearSelection(attrs);
    attrs[idAttribute].selected = true;
    handlePrice(productData.value as CategoryProductDataVO, groupsAttr.value, id_currency as string, templJsonObjects.value);
  }
};

const toggleButton = (v) => {
  console.log(v);
};

const toggleSwatch = (v) => {
  console.log(v);
};

const showPopup = () => {};
const handleCheckboxChange = () => {};
const handleClick = () => {};

const calcPrice = () => {
  // 计算当前成品图价格
  try {
    selCurtTemplPrice.value = calcCurtTemplPrice();
  } catch (e) {
    throw new Error('If the price of the template is abnormal, please contact customer service');
  }

  let totalPrice: number = 0;

  nextTick(() => {
    // 获取所有符合条件的元素
    const optionDetailDivs = document.querySelectorAll('#option-detail-show .option-detail-div');

    optionDetailDivs.forEach((element: Element) => {
      // 检查元素是否隐藏或没有价格计算字段 element.offsetParent === null ||
      if (element.querySelector('.price_calc') === null) {
        return;
      }

      // 获取价格值并累加到总价中
      const priceInput = element.querySelector('.price_calc') as HTMLInputElement;
      if (priceInput) {
        const price = parseFloat(priceInput.value);
        if (!isNaN(price)) {
          totalPrice = numericalArithmetic(totalPrice, price, '+');
        }
      }
    });
    const optionPrice = calcCurtTemplOptionTotalPrice();
    totalPrice = numericalArithmetic(totalPrice, optionPrice, '+');

    // 将 totalPrice 转换为字符串以便显示
    designOptionTotalPrice.value = parseFloat(totalPrice.toFixed(2));
  });
};

const sendProductDescToParent = () => {
  if (!productData.value?.description) return;
  iframeParent.postMessage({
    type: 'setProductDesc',
    html: productData.value.description
  }, '*');
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

const productInfoRef = ref<HTMLElement | null>(null);
const iframeParent = window.parent;
let resizeObserver: ResizeObserver | null = null;
// 发送产品信息区域高度给父iframe
const sendProductInfoHeight = () => {
  if (!productInfoRef.value) return;
  const height = productInfoRef.value.offsetHeight;
  iframeParent.postMessage({
    type: 'updateIframeHeight',
    height: height
  }, '*');
};
// 监听元素尺寸变化
const observeProductInfoHeight = () => {
  nextTick(() => {
    if (!productInfoRef.value) return;
    resizeObserver = new ResizeObserver(entries => {
      sendProductInfoHeight();
    });
    resizeObserver.observe(productInfoRef.value);
    // 初始发送一次
    sendProductInfoHeight();
  });
};

onMounted(() => {
  if (token) {
    setShopToken(token as string);
  }
  getProductData();
  observeProductInfoHeight();
});

// 销毁释放监听
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<style lang="scss" scoped>
@use './cart';

.public-pink-btn-loading .dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  animation: stretch 1s ease-in-out infinite;
}
.public-pink-btn-loading .dot:nth-child(1) {
    animation-delay: 0s;
}
.public-pink-btn-loading .dot:nth-child(2) {
    animation-delay: 0.3s;
}
.public-pink-btn-loading .dot:nth-child(3) {
    animation-delay: 0.6s;
}
.public-pink-btn-loading .dot:nth-child(4) {
    animation-delay: 0.9s;
}
@keyframes stretch {
  0%, 100% {
      transform: scaleY(1);
  }
  50% {
      transform: scaleY(2);
  }
}
</style>