import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StyleTemplateVO, StyleTemplateForm, StyleTemplateQuery } from '@/api/kjds/styleTemplate/types';

/**
 * 查询风格对应的模板列表
 * @param query
 * @returns {*}
 */

export const listStyleTemplate = (query?: StyleTemplateQuery): AxiosPromise<StyleTemplateVO[]> => {
  return request({
    url: '/kjds/styleTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询风格对应的模板详细
 * @param id
 */
export const getStyleTemplate = (id: string | number): AxiosPromise<StyleTemplateVO> => {
  return request({
    url: '/kjds/styleTemplate/' + id,
    method: 'get'
  });
};

/**
 * 新增风格对应的模板
 * @param data
 */
export const addStyleTemplate = (data: StyleTemplateForm) => {
  return request({
    url: '/kjds/styleTemplate',
    method: 'post',
    data: data
  });
};

/**
 * 修改风格对应的模板
 * @param data
 */
export const updateStyleTemplate = (data: StyleTemplateForm) => {
  return request({
    url: '/kjds/styleTemplate',
    method: 'put',
    data: data
  });
};

/**
 * 删除风格对应的模板
 * @param id
 */
export const delStyleTemplate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/styleTemplate/' + id,
    method: 'delete'
  });
};
