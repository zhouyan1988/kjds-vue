import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TemplateImageCoordinateVO, TemplateImageCoordinateForm, TemplateImageCoordinateQuery } from '@/api/kjds/templateImageCoordinate/types';

/**
 * 查询模板图片坐标列表
 * @param query
 * @returns {*}
 */

export const listTemplateImageCoordinate = (query?: TemplateImageCoordinateQuery): AxiosPromise<TemplateImageCoordinateVO[]> => {
  return request({
    url: '/kjds/templateImageCoordinate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询模板图片坐标详细
 * @param id
 */
export const getTemplateImageCoordinate = (id: string | number): AxiosPromise<TemplateImageCoordinateVO> => {
  return request({
    url: '/kjds/templateImageCoordinate/' + id,
    method: 'get'
  });
};

/**
 * 新增模板图片坐标
 * @param data
 */
export const addTemplateImageCoordinate = (data: TemplateImageCoordinateForm) => {
  return request({
    url: '/kjds/templateImageCoordinate',
    method: 'post',
    data: data
  });
};

/**
 * 修改模板图片坐标
 * @param data
 */
export const updateTemplateImageCoordinate = (data: TemplateImageCoordinateForm) => {
  return request({
    url: '/kjds/templateImageCoordinate',
    method: 'put',
    data: data
  });
};

/**
 * 删除模板图片坐标
 * @param id
 */
export const delTemplateImageCoordinate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/kjds/templateImageCoordinate/' + id,
    method: 'delete'
  });
};
