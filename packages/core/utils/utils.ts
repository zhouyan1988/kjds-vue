/*
 * @Author: 秦少卫
 * @Date: 2022-09-05 22:21:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-07-22 10:24:53
 * @Description: 工具文件
 */
import { v4 as uuid } from 'uuid';
import { useClipboard, useFileDialog, useBase64 } from '@vueuse/core';

/**
 * @description: 图片文件转字符串
 * @param {Blob|File} file 文件
 * @return {String}
 */
export function getImgStr(file: File | Blob): Promise<FileReader['result']> {
  return useBase64(file).promise.value;
}

/**
 * @description: 选择文件
 * @param {Object} options accept = '', capture = '', multiple = false
 * @return {Promise}
 */
export function selectFiles(options: { accept?: string; capture?: string; multiple?: boolean }): Promise<FileList | null> {
  return new Promise((resolve) => {
    const { onChange, open } = useFileDialog(options);
    onChange((files) => {
      resolve(files);
    });
    open();
  });
}

/**
 * @description: 选择文件之后
 * @return {Promise}
 */
export function selectImgSrc(): Promise<string> {
  return new Promise((resolve) => {
    selectFiles({ accept: 'image/*', multiple: false }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        getImgStr(item).then((file) => {
          if (!file) throw new Error('file is undefined');
          let imgSrc: string;
          if (typeof file === 'string') {
            imgSrc = file;
          } else if (file instanceof ArrayBuffer) {
            imgSrc = URL.createObjectURL(new Blob([file]));
          } else {
            throw new Error('Unsupported file type');
          }
          const imgEl = document.createElement('img');
          imgEl.src = imgSrc;
          // 插入页面
          document.body.appendChild(imgEl);
          imgEl.onload = async () => {
            resolve(imgEl.src);
            imgEl.remove();
          };
        });
      });
    });
  });
}

/**
 * 选择图像文件并返回它们的URL数组
 * 该函数使用文件选择对话框让用户选择一个或多个图像文件，然后将这些文件转换为Base64编码的字符串或创建它们的URL，
 * 并将这些URL添加到一个数组中返回这个数组
 *
 * @returns {Promise<string[]>} 返回一个Promise对象，该对象解析为字符串数组，每个字符串都是一个图像文件的URL
 */
export function selectImgsSrc(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    selectFiles({ accept: 'image/*', multiple: true }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        if (!fileList.length) {
          reject(new Error('No files selected'));
          return;
        }
        const promises = Array.from(fileList).map((item) => {
          return getImgStr(item).then((file) => {
            if (!file) throw new Error('file is undefined');
            let imgSrc: string;
            if (typeof file === 'string') {
              imgSrc = file;
            } else if (file instanceof ArrayBuffer) {
              imgSrc = URL.createObjectURL(new Blob([file]));
            } else {
              throw new Error('Unsupported file type');
            }

            return new Promise<string>((res) => {
              const imgEl = document.createElement('img');
              imgEl.src = imgSrc;
              // 插入页面
              document.body.appendChild(imgEl);
              imgEl.onload = () => {
                res(imgEl.src);
                imgEl.remove();
              };
            });
          });
        });

        Promise.all(promises)
          .then((imgSrcs) => resolve(imgSrcs))
          .catch((error) => reject(error));
      });
    });
  });
}

/**
 * @description: 创建图片元素
 * @param {String} str 图片地址或者base64图片
 * @return {Promise} element 图片元素
 */
export function insertImgFile(str: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const imgEl = document.createElement('img');
    imgEl.src = str;
    // 插入页面
    document.body.appendChild(imgEl);
    imgEl.onload = () => {
      resolve(imgEl);
    };
  });
}

/**
 * Copying text to the clipboard
 * @param source Copy source
 * @param options Copy options
 * @returns Promise that resolves when the text is copied successfully, or rejects when the copy fails.
 */
export const clipboardText = (source: string, options?: Parameters<typeof useClipboard>[0]) => {
  return useClipboard({ source, ...options }).copy();
};

export function downFile(fileStr: string, fileType: string) {
  const anchorEl = document.createElement('a');
  anchorEl.href = fileStr;
  anchorEl.download = `${uuid()}.${fileType}`;
  document.body.appendChild(anchorEl); // required for firefox
  anchorEl.click();
  anchorEl.remove();
}

export function drawImg(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  img: HTMLImageElement,
  wSize: number,
  hSize: number,
  angle: number | undefined
) {
  if (angle === undefined) return;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(angle);
  ctx.drawImage(img, -wSize / 2, -hSize / 2, wSize, hSize);
  ctx.restore();
}

export function shiftAngle(start: fabric.Point, end: fabric.Point) {
  const startX = start.x;
  const startY = start.y;
  const x2 = end.x - startX;
  const y2 = end.y - startY;
  const r = Math.sqrt(x2 * x2 + y2 * y2);
  let angle = (Math.atan2(y2, x2) / Math.PI) * 180;
  angle = ~~(((angle + 7.5) % 360) / 15) * 15;

  const cosx = r * Math.cos((angle * Math.PI) / 180);
  const sinx = r * Math.sin((angle * Math.PI) / 180);

  return {
    x: cosx + startX,
    y: sinx + startY
  };
}

/**
 * 类型工具
 */
export const isImage = (thing: unknown): thing is fabric.Image => {
  // @ts-ignore
  return thing instanceof fabric.Image;
};

export const isGroup = (thing: unknown): thing is fabric.Group => {
  // @ts-ignore
  return thing instanceof fabric.Group;
};

export const isIText = (thing: unknown): thing is fabric.IText => {
  // @ts-ignore
  return thing instanceof fabric.IText;
};

export const isActiveSelection = (thing: unknown): thing is fabric.ActiveSelection => {
  // @ts-ignore
  return thing instanceof fabric.ActiveSelection;
};

export function blobToBase64(blob: Blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64Data: string) {
  if (!base64Data) {
    return null;
  }
  const dataArr = base64Data.split(',');
  const imageType = dataArr[0].match(/:(.*?);/)[1];
  const textData = window.atob(dataArr[1]);
  const arrayBuffer = new ArrayBuffer(textData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < textData.length; i++) {
    uint8Array[i] = textData.charCodeAt(i);
  }
  return [new Blob([arrayBuffer], { type: imageType }), imageType.slice(6)];
}

// 简单的内存缓存 Map
const base64Cache = new Map<string, string>();

/**
 * 将图片URL转换为PNG格式的base64字符串（带缓存）
 * @param url 图片URL地址
 * @returns Promise<string> 返回base64字符串
 */
export function urlToBase64(url: string): Promise<string> {
  // 如果缓存中已有，直接返回
  if (base64Cache.has(url)) {
    return Promise.resolve(base64Cache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const { execute } = useBase64(img, { type: 'image/png' });
        execute()
          .then((base64) => {
            base64Cache.set(url, base64); // 存入缓存
            resolve(base64);
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}
/**
 * 批量将图片URL转换为PNG格式的base64字符串（带缓存）
 * @param urls 图片URL数组
 * @param succ 是否只返回成功的结果（true 时只返回成功项，false 返回全部结果）
 * @returns Promise 返回包含转换结果的数组
 */
export async function urlsToBase64(urls: string[], succ: boolean = true): Promise<{ url: string; base64?: string; error?: string }[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const base64 = await urlToBase64(url);
        return { url, base64 };
      } catch (error) {
        return {
          url,
          error: error instanceof Error ? error.message : '转换失败'
        };
      }
    })
  );

  // 先统一结构化结果
  const normalized = results.map((result) => (result.status === 'fulfilled' ? result.value : result.reason));

  // 根据 succ 参数决定是否过滤
  return succ ? normalized.filter((item) => !!item.base64) : normalized;
}

/**
 * 可选：清空缓存
 */
export function clearBase64Cache() {
  base64Cache.clear();
}

export default {
  getImgStr,
  downFile,
  selectFiles,
  selectImgSrc,
  selectImgsSrc,
  insertImgFile,
  clipboardText,
  drawImg,
  isImage,
  isGroup,
  isIText,
  isActiveSelection,
  blobToBase64,
  base64ToBlob,
  urlToBase64,
  urlsToBase64,
  clearBase64Cache
};
