import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FontsVO, FontsForm, FontsQuery } from '@/api/kjds/fonts/types';

/**
 * 查询字体列表
 * @param query
 * @returns {*}
 */

export const listFonts = (query?: FontsQuery): AxiosPromise<FontsVO[]> => {
  return request({
    url: '/kjds/fonts/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询字体详细
 * @param id
 */
export const getFonts = (id: string | number): AxiosPromise<FontsVO> => {
  return request({
    url: '/kjds/fonts/' + id,
    method: 'get'
  });
};

/**
 * 新增字体
 * @param data
 */
export const addFonts = (data: FontsForm) => {
  return request({
    url: '/kjds/fonts',
    method: 'post',
    data: data
  });
};

/**
 * 修改字体
 * @param data
 */
export const updateFonts = (data: FontsForm) => {
  return request({
    url: '/kjds/fonts',
    method: 'put',
    data: data
  });
};

/**
 * 删除字体
 * @param id
 */
export const delFonts = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/fonts/' + id,
    method: 'delete'
  });
};
