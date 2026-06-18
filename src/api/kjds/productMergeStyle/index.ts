import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductMergeStyleVO, ProductMergeStyleForm, ProductMergeStyleQuery } from '@/api/kjds/productMergeStyle/types';

/**
 * 查询产品组合风格图列表
 * @param query
 * @returns {*}
 */

export const listProductMergeStyle = (query?: ProductMergeStyleQuery): AxiosPromise<ProductMergeStyleVO[]> => {
  return request({
    url: '/kjds/productMergeStyle/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询最新产品组合风格图
 * @param query
 */
export const getProductMergeStyleNewest = (query: { productId: string }): AxiosPromise<ProductMergeStyleVO> => {
  return request({
    url: '/kjds/productMergeStyle/getNewest',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品组合风格图详细
 * @param id
 */
export const getProductMergeStyle = (id: string | number): AxiosPromise<ProductMergeStyleVO> => {
  return request({
    url: '/kjds/productMergeStyle/' + id,
    method: 'get'
  });
};

/**
 * 新增产品组合风格图
 * @param data
 */
export const addProductMergeStyle = (data: ProductMergeStyleForm) => {
  return request({
    url: '/kjds/productMergeStyle',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品组合风格图
 * @param data
 */
export const updateProductMergeStyle = (data: ProductMergeStyleForm) => {
  return request({
    url: '/kjds/productMergeStyle',
    method: 'put',
    data: data
  });
};

/**
 * 状态修改
 * @param data
 */
export const updateProductMergeStyleStatus = (data: ProductMergeStyleForm) => {
  return request({
    url: '/kjds/productMergeStyle/changeStatus',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品组合风格图
 * @param id
 */
export const delProductMergeStyle = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/productMergeStyle/' + id,
    method: 'delete'
  });
};
