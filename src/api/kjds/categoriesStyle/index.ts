import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoriesStyleVO, CategoriesStyleForm, CategoriesStyleQuery } from '@/api/kjds/categoriesStyle/types';

/**
 * 查询风格列表
 * @param query
 * @returns {*}
 */

export const listCategoriesStyle = (query?: CategoriesStyleQuery): AxiosPromise<CategoriesStyleVO[]> => {
  return request({
    url: '/kjds/categoriesStyle/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询风格详细
 * @param id
 */
export const getCategoriesStyle = (id: string | number): AxiosPromise<CategoriesStyleVO> => {
  return request({
    url: '/kjds/categoriesStyle/' + id,
    method: 'get'
  });
};

/**
 * 新增风格
 * @param data
 */
export const addCategoriesStyle = (data: CategoriesStyleForm) => {
  return request({
    url: '/kjds/categoriesStyle',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
};

/**
 * 复制风格
 * @param data
 */
export const copyCategoriesStyle = (data: { id: number }) => {
  return request({
    url: '/kjds/categoriesStyle/copy',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
};

/**
 * 修改风格
 * @param data
 */
export const updateCategoriesStyle = (data: CategoriesStyleForm) => {
  return request({
    url: '/kjds/categoriesStyle',
    method: 'put',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
};

/**
 * 删除风格
 * @param id
 */
export const delCategoriesStyle = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/categoriesStyle/' + id,
    method: 'delete'
  });
};
