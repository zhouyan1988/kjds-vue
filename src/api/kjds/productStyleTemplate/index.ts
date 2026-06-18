import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductStyleTemplateVO, ProductStyleTemplateForm, ProductStyleTemplateQuery } from '@/api/kjds/productStyleTemplate/types';

/**
 * 查询产品组合模板价格列表
 * @param query
 * @returns {*}
 */

export const listProductStyleTemplate = (query?: ProductStyleTemplateQuery): AxiosPromise<ProductStyleTemplateVO[]> => {
  return request({
    url: '/kjds/productStyleTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品组合模板价格详细
 * @param id
 */
export const getProductStyleTemplate = (id: string | number): AxiosPromise<ProductStyleTemplateVO> => {
  return request({
    url: '/kjds/productStyleTemplate/' + id,
    method: 'get'
  });
};

/**
 * 新增产品组合模板价格
 * @param data
 */
export const addProductStyleTemplate = (data: ProductStyleTemplateForm) => {
  return request({
    url: '/kjds/productStyleTemplate',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品组合模板价格
 * @param data
 */
export const updateProductStyleTemplate = (data: ProductStyleTemplateForm) => {
  return request({
    url: '/kjds/productStyleTemplate',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品组合模板价格
 * @param id
 */
export const delProductStyleTemplate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/productStyleTemplate/' + id,
    method: 'delete'
  });
};
