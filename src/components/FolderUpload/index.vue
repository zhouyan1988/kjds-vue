<template>
  <div class="folder-upload">
    <!-- 上传区域 -->
    <div
      ref="dropZoneRef"
      class="drop-zone"
      :class="{ 'drop-zone--active': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileSelect"
    >
      <div class="drop-zone-content">
        <el-icon class="upload-icon">
          <FolderOpened v-if="props.uploadMode === 'folder'" />
          <UploadFilled v-else />
        </el-icon>
        <div v-if="props.uploadMode === 'folder'" class="upload-text">
          <p><em>点击选择文件夹</em></p>
          <p class="upload-tip">支持选择整个文件夹进行上传</p>
        </div>
        <div v-else class="upload-text">
          <p>拖拽图片到此处，或<em>点击选择图片</em></p>
          <p class="upload-tip">支持选择多个图片文件进行上传</p>
        </div>
      </div>

      <!-- 隐藏的文件输入框 -->
      <input
        ref="folderInputRef"
        type="file"
        v-bind="props.uploadMode === 'folder' ? { webkitdirectory: true } : {}"
        multiple
        :accept="props.uploadMode === 'file' ? 'image/*' : undefined"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- 文件列表预览 -->
    <div v-if="fileList.length > 0" class="file-preview">
      <div class="preview-header">
        <p>已选择的文件 ({{ fileList.length }} 个)</p>
        <el-button type="primary" size="small" :disabled="isUploading" @click="startUpload">
          {{ isUploading ? '上传中...' : '开始上传' }}
        </el-button>
      </div>

      <div class="file-list">
        <div v-for="(file, index) in fileList" :key="index" class="file-item">
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-path">{{ file.folderName }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <el-button type="danger" size="small" @click="removeFile(index)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploadProgress.length > 0" class="upload-progress">
      <div class="progress-header">
        <p>上传进度</p>
      </div>

      <div class="progress-list">
        <div v-for="(item, index) in uploadProgress" :key="index" class="progress-item">
          <div class="file-info">
            <span class="file-name">{{ item.name }}</span>
            <span class="file-path">{{ item.folderName }}</span>
          </div>
          <div class="progress-bar">
            <el-progress :percentage="item.progress" :status="item.status === 'error' ? 'exception' : undefined" :stroke-width="6" />
          </div>
          <div class="file-status">
            <span v-if="item.status === 'pending'" class="status-pending">等待中</span>
            <span v-else-if="item.status === 'uploading'" class="status-uploading">上传中</span>
            <span v-else-if="item.status === 'success'" class="status-success">成功</span>
            <span v-else-if="item.status === 'error'" class="status-error">失败</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传提示 -->
    <div v-if="showTip" class="el-upload__tip">
      <template v-if="fileSize">
        单个文件大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        支持的文件格式：<b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';

interface FileItem {
  name: string;
  folderName: string;
  file: File;
  size: number;
}

interface UploadProgressItem {
  name: string;
  folderName: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  response?: any;
}

const props = defineProps({
  // 上传地址
  action: {
    type: String,
    required: true
  },
  // 上传模式：'folder' 文件夹上传，'file' 文件上传
  uploadMode: {
    type: String,
    default: 'folder',
    validator: (value: string) => ['folder', 'file'].includes(value)
  },
  // 文件大小限制(MB)
  fileSize: propTypes.number.def(50),
  // 文件类型限制 'gif', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'
  fileType: propTypes.array.def(['png', 'jpg', 'jpeg']),
  // 是否显示提示
  showTip: propTypes.bool.def(true),
  // 请求头
  headers: {
    type: Object,
    default: () => globalHeaders()
  },
  // 额外参数
  data: {
    type: Object,
    default: () => ({})
  },
  // 是否使用自定义上传
  customUpload: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['upload-success', 'upload-error', 'upload-complete']);

// 上传区域
const dropZoneRef = ref<HTMLElement>();
// 隐藏文件输入框
const folderInputRef = ref<HTMLInputElement>();
// 是否拖拽
const isDragOver = ref(false);
// 上传加载状态
const isUploading = ref(false);
// 文件列表
const fileList = ref<FileItem[]>([]);
// 上传进度
const uploadProgress = ref<UploadProgressItem[]>([]);

// 触发文件选择
const triggerFileSelect = () => {
  folderInputRef.value?.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    processFiles(Array.from(target.files));
  }
};

// 处理拖拽进入
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

// 处理拖拽离开
const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

// 处理拖拽放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }
};

// 处理文件列表
const processFiles = (files: File[]) => {
  fileList.value = [];
  uploadProgress.value = []; // 清空上传进度
  let validFiles = files;
  validFiles = files.filter((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      ElMessage.error(`文件 ${file.name} 不是图片格式`);
      return false;
    }
    return true;
  });

  fileList.value = validFiles.map((file) => {
    let folderName = '';
    if (props.uploadMode === 'folder') {
      folderName = (file as any).webkitRelativePath ? (file as any).webkitRelativePath.split('/')[0] : file.name;
    } else {
      folderName = file.name;
    }

    return {
      name: file.name,
      folderName,
      file,
      size: file.size
    };
  });

  if (validFiles.length === 0) {
    ElMessage.error('没有有效的文件可以上传');
  }
};

// 移除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 开始上传
const startUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.error('请选择要上传的文件');
    return;
  }

  isUploading.value = true;

  // 创建上传进度项
  uploadProgress.value = fileList.value.map((item) => ({
    name: item.name,
    folderName: item.folderName,
    file: item.file,
    progress: 0,
    status: 'pending' as const
  }));
  try {
    for (let i = 0; i < uploadProgress.value.length; i++) {
      const item = uploadProgress.value[i];
      item.status = 'uploading';

      try {
        // 使用 fetch API 进行上传，避免 Content-Type 问题
        const res = await uploadFileWithFetch(item, i);

        if (res && res.code === 200) {
          item.status = 'success';
          item.progress = 100;
          item.response = res.data;
          emit('upload-success', item, res);
        } else {
          throw new Error(res?.msg || '上传失败');
        }
      } catch (error) {
        item.status = 'error';
        item.progress = 0;
        emit('upload-error', item, error);
      }
    }

    emit('upload-complete', uploadProgress.value);

    fileList.value = [];
  } finally {
    isUploading.value = false;
  }
};

// 使用 fetch API 上传文件
const uploadFileWithFetch = async (item: UploadProgressItem, index: number) => {
  const formData = new FormData();

  if (props.uploadMode === 'folder') {
    // 文件夹上传模式：使用file和folderName
    formData.append('file', item.file);
    formData.append('folderName', item.folderName);
  } else {
    // 文件上传模式：使用files和fileNames
    formData.append('files', item.file);
    formData.append('fileNames', item.name);
  }

  // 添加额外参数
  Object.keys(props.data).forEach((key) => {
    formData.append(key, props.data[key]);
  });

  try {
    let result;
    if (props.customUpload) {
      // 自定义上传：直接返回文件信息，让父组件处理
      result = {
        code: 200,
        data: {
          fileName: item.name,
          filePath: item.folderName,
          file: item.file
        }
      };
    } else {
      // 默认上传：使用fetch API
      const res = await fetch(props.action, {
        method: 'POST',
        headers: {
          ...props.headers
          // 不设置 Content-Type，让浏览器自动设置
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      result = await res.json();
    }
    return result;
  } catch (error) {
    throw error;
  }
};

// 清空上传列表
const clearUploadList = () => {
  fileList.value = [];
  uploadProgress.value = [];
};

defineExpose({
  clearUploadList,
  startUpload
});
</script>

<style scoped lang="scss">
.folder-upload {
  flex: 1;
  .drop-zone {
    border: 2px dashed #d9d9d9;
    border-radius: 6px;
    background-color: #fafafa;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 40px 20px;

    &:hover {
      border-color: #409eff;
      background-color: #f0f9ff;
    }

    &--active {
      border-color: #409eff;
      background-color: #e6f7ff;
    }

    .drop-zone-content {
      .upload-icon {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }

      .upload-text {
        color: #606266;

        em {
          color: #409eff;
          font-style: normal;
          cursor: pointer;
        }

        .upload-tip {
          font-size: 12px;
          color: #909399;
          margin-top: 8px;
        }
      }
    }
  }

  .file-preview {
    margin-top: 20px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      p {
        margin: 0;
        color: #303133;
      }
    }

    .file-list {
      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        margin-bottom: 8px;
        background-color: #fafafa;

        .file-info {
          flex: 1;
          min-width: 0;

          .file-name {
            display: block;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .file-path {
            display: block;
            font-size: 12px;
            color: #909399;
            margin-bottom: 2px;
          }

          .file-size {
            display: block;
            font-size: 12px;
            color: #606266;
          }
        }

        .file-actions {
          flex-shrink: 0;
        }
      }
    }
  }

  .upload-progress {
    margin-top: 20px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      p {
        margin: 0;
        color: #303133;
      }
    }

    .progress-list {
      .progress-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        margin-bottom: 8px;
        background-color: #fafafa;

        .file-info {
          flex: 1;
          min-width: 0;

          .file-name {
            display: block;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .file-path {
            display: block;
            font-size: 12px;
            color: #909399;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .progress-bar {
          flex: 2;
          margin: 0 16px;
        }

        .file-status {
          flex-shrink: 0;
          width: 80px;
          text-align: center;

          .status-pending {
            color: #909399;
          }

          .status-uploading {
            color: #409eff;
          }

          .status-success {
            color: #67c23a;
          }

          .status-error {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .el-upload__tip {
    margin-top: 16px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
