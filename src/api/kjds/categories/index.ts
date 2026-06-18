import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoriesVO, CategoriesForm, CategoriesQuery } from '@/api/kjds/categories/types';

/**
 * 查询类别列表
 * @param query
 * @returns {*}
 */

export const listCategories = (query?: CategoriesQuery): AxiosPromise<CategoriesVO[]> => {
  return request({
    url: '/kjds/categories/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询类别详细
 * @param id
 */
export const getCategories = (id: string | number): AxiosPromise<CategoriesVO> => {
  return request({
    url: '/kjds/categories/' + id,
    method: 'get'
  });
};

/**
 * 新增类别
 * @param data
 */
export const addCategories = (data: CategoriesForm) => {
  return request({
    url: '/kjds/categories',
    method: 'post',
    data: data
  });
};

/**
 * 修改类别
 * @param data
 */
export const updateCategories = (data: CategoriesForm) => {
  return request({
    url: '/kjds/categories',
    method: 'put',
    data: data
  });
};

/**
 * 删除类别
 * @param id
 */
export const delCategories = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/categories/' + id,
    method: 'delete'
  });
};
