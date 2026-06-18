import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MaterialVO, MaterialForm, MaterialQuery } from '@/api/material/types';

/**
 * 查询图片素材库列表
 * @param query
 * @returns {*}
 */
export const listMaterial = (query?: MaterialQuery): AxiosPromise<MaterialVO[]> => {
  return request({
    url: '/system/materialLibrary/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取图片素材库详情信息
 */
export const detailMaterial = (id: string | number): AxiosPromise<MaterialVO> => {
  return request({
    url: `/system/materialLibrary/${id}`,
    method: 'get'
  });
};

/**
 * 修改图片素材库
 * @param data
 */
export const updateMaterial = (data: MaterialForm) => {
  return request({
    url: '/system/materialLibrary',
    method: 'put',
    data: data
  });
};

/**
 * 复制素材库
 * @param id
 */
export const copyMaterial = (id: number) => {
  return request({
    url: `/system/materialLibrary/copyMaterial/${id}`,
    method: 'post'
  });
};

/**
 * 删除图片素材库
 * @param ids
 */
export const delMaterial = (ids: Array<number>) => {
  return request({
    url: '/system/materialLibrary/' + ids,
    method: 'delete'
  });
};

/**
 * 上传素材库文件夹（多文件上传）
 * @param data
 */
export const uploadMaterialImages = (data: FormData): AxiosPromise<any> => {
  return request({
    url: '/system/materialLibrary/updateMaterialImage',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 新增素材库（参数包含已经上传的图片信息）
 * @param data
 */
export const addMaterialFolder = (data): AxiosPromise<any> => {
  return request({
    url: '/system/materialLibrary/addMaterial',
    method: 'post',
    data: data
  });
};

/**
 * 查询图片详情列表
 * @param query
 * @returns {*}
 */
export const listMaterialImage = (query?: MaterialQuery): AxiosPromise<MaterialVO[]> => {
  return request({
    url: '/system/materialLibraryImage/list',
    method: 'get',
    params: query
  });
};

/**
 * 删除图片详情
 * @param ids
 */
export const delMaterialImage = (ids: Array<number>) => {
  return request({
    url: '/system/materialLibraryImage/' + ids,
    method: 'delete'
  });
};

/**
 * 新增素材图片（向素材库添加图片）
 * @param data
 */
export const addMaterialImage = (data): AxiosPromise<any> => {
  return request({
    url: '/system/materialLibraryImage/addImages',
    method: 'post',
    data: data
  });
};

/**
 * 替换素材图片
 * @param data
 */
export const replaceMaterialImage = (data, id): AxiosPromise<any> => {
  return request({
    url: `/system/materialLibraryImage/replacedImage/${id}`,
    method: 'post',
    data: data
  });
};
