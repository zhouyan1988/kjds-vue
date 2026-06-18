/**
 * PrestoShop 相关接口
 */
import { AxiosPromise } from 'axios';
import requestShop from '@/utils/requestShop';
import {
  CategoryListQuery,
  CategoryListVO,
  CategoryProductDataVO,
  CategoryProductListQuery,
  CategoryProductListVO,
  CategoryProductQuery,
  CategoryQuery,
  CategoryVO,
  ShoppingCartQuery,
  ShoppingCartQueryOld,
  TemplateListVo,
  TemplateOptionParams
} from '@/api/shop/types';
import { getAdminShopToken } from '@/utils/auth';

// 管理后台token
const token = () => {
  return getAdminShopToken() ? getAdminShopToken() : '';
};

/**
 * 获取分类名称列表
 * @param query
 */
export const getCategoryList = (query: CategoryListQuery): AxiosPromise<CategoryListVO[]> => {
  return requestShop({
    url: '/module/jcmodule/GetCategoryList',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 获取模板选项列表
 */
export const getProductTemplateId = (query: {
  // 产品ID
  id: string | number;
}): AxiosPromise<{ template_id: string | number }> => {
  return requestShop({
    url: '/module/jcmodule/GetProductTemplateId',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 获取模板选项列表
 */
export const getTemplateOptionList = (query: { id_design_template: string | number }): AxiosPromise<TemplateListVo> => {
  return requestShop({
    url: '/module/jcmodule/TemplateList',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 保存模板选项
 */
export const saveTemplateOption = (data: TemplateOptionParams): AxiosPromise<any> => {
  return requestShop({
    url: '/module/jcmodule/SaveTemplateOption',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      _token: token(),
      ...data
    }
  });
};

/**
 * 获取分类详情
 * @param query
 */
export const getCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO> => {
  return requestShop({
    url: '/admincp/modules/jcmodule/getCategory',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 获取分类商品列表
 * @param query
 */
export const getCategoryProductList = (query?: CategoryProductListQuery): AxiosPromise<CategoryProductListVO> => {
  return requestShop({
    url: '/module/jcmodule/GetCategoryProductList',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 获取分类商品
 * @param query
 */
export const getProductDetail = (query?: CategoryProductQuery): AxiosPromise<CategoryProductDataVO> => {
  return requestShop({
    url: '/module/jcmodule/GetProduct',
    method: 'get',
    params: {
      _token: token(),
      ...query
    }
  });
};

/**
 * 添加购物车，使用form直接提交
 */
export const addShoppingCart = (data: ShoppingCartQuery): AxiosPromise<any> => {
  return requestShop({
    url: '/cart',
    method: 'post',
    data: {
      _token: token(),
      ...data
    }
  });
};

/**
 * 添加购物车
 */
export const addShoppingCartOld = (data: ShoppingCartQueryOld): AxiosPromise<any> => {
  return requestShop({
    url: '/module/ps_shoppingcart/ajax',
    method: 'post',
    data: {
      _token: token(),
      ...data
    }
  });
};
