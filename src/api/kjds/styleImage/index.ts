import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StyleImageVO, StyleImageForm, StyleImageQuery } from '@/api/kjds/styleImage/types';

/**
 * 查询风格对应图片(风格下的模板可选图片)列表
 * @param query
 * @returns {*}
 */

export const listStyleImage = (query?: StyleImageQuery): AxiosPromise<StyleImageVO[]> => {
  return request({
    url: '/kjds/styleImage/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询风格对应图片(风格下的模板可选图片)详细
 * @param id
 */
export const getStyleImage = (id: string | number): AxiosPromise<StyleImageVO> => {
  return request({
    url: '/kjds/styleImage/' + id,
    method: 'get'
  });
};

/**
 * 新增风格对应图片(风格下的模板可选图片)
 * @param data
 */
export const addStyleImage = (data: StyleImageForm) => {
  return request({
    url: '/kjds/styleImage',
    method: 'post',
    data: data
  });
};

/**
 * 修改风格对应图片(风格下的模板可选图片)
 * @param data
 */
export const updateStyleImage = (data: StyleImageForm) => {
  return request({
    url: '/kjds/styleImage',
    method: 'put',
    data: data
  });
};

/**
 * 删除风格对应图片(风格下的模板可选图片)
 * @param id
 */
export const delStyleImage = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/styleImage/' + id,
    method: 'delete'
  });
};
