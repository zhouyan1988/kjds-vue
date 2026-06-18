<template>
  <div class="home">
    <Layout>
      <!-- 头部区域 -->
      <div class="design-header">
        <h3>
          {{ titleName }}
          <el-button text icon="Edit" @click="changeTitle"></el-button>
        </h3>
        <el-button type="primary" :loading="buttonLoading" @click="designSave">保存</el-button>
      </div>

      <Header v-if="state.show">
        <div class="left">
          <Divider type="vertical" />
          <el-button type="primary" size="small" @click="designBack">返回</el-button>
          <Divider type="vertical" />
          <!-- 标尺开关 -->
          <Tooltip :content="$t('grid')">
            <iSwitch v-model="state.ruler" size="small" class="switch" @on-change="rulerSwitch"></iSwitch>
          </Tooltip>
          <Divider type="vertical" />
          <history></history>
          <!-- 新增模版 -->
          <div class="tag-box">
            <div style="max-width: 527px; overflow-x: auto; display: flex">
              <el-tag
                v-for="(tag, index) in templs"
                :key="index"
                :closable="false"
                :disable-transitions="false"
                :checked="true"
                :effect="tagIndex == index ? 'dark' : 'plain'"
                style="margin-right: 10px; cursor: pointer"
                @click="changeCanvas(index)"
              >
                {{ tag.name }}

                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-icon class="el-icon--right">
                      <arrow-down />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click.stop="handleTagRename(index)">
                        <el-icon><EditPen /></el-icon>
                        {{ $t('artworksDetails.rename') }}
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleTagCopy(index)">
                        <el-icon><CopyDocument /></el-icon>
                        {{ $t('artworksDetails.duplicate') }}
                      </el-dropdown-item>
                      <el-dropdown-item v-if="index !== 0" @click.stop="handleTagMoveToFirst(index)">
                        <el-icon><DArrowLeft /></el-icon>
                        {{ $t('artworksDetails.moveToFirst') }}
                      </el-dropdown-item>
                      <el-dropdown-item v-if="index !== templs.length - 1" @click.stop="handleTagMoveToLast(index)">
                        <el-icon><DArrowRight /></el-icon>
                        {{ $t('artworksDetails.moveToLast') }}
                      </el-dropdown-item>
                      <el-dropdown-item divided :disabled="templs.length <= 1" @click.stop="handleTagDel(index)">
                        <el-icon><Delete /></el-icon>
                        {{ $t('artworksDetails.delete') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-tag>
            </div>
            <div style="margin-left: 10px">
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="small"
                placeholder="请输入模版名称"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" type="success" @click="showInput">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="right">
          <!-- 预览 -->
          <previewCurrent />
          <!-- 水印 -->
          <waterMark />
          <save></save>
          <lang></lang>
        </div>
      </Header>
      <Content style="display: flex; height: calc(100vh - 108px); position: relative">
        <!-- 左侧区域 -->
        <fabric-editor-tools v-if="state.show"></fabric-editor-tools>
        <!-- 画布区域 -->
        <div id="workspace">
          <div class="canvas-box">
            <div class="inside-shadow"></div>
            <canvas id="canvas" :class="state.ruler ? 'design-stage-grid' : ''"></canvas>
            <dragMode v-if="state.show"></dragMode>
            <zoom></zoom>
          </div>
        </div>
        <!-- 属性区域 380-->
        <fabric-editor-attr v-if="state.show"></fabric-editor-attr>
      </Content>
    </Layout>
  </div>
</template>

<script name="ArtworksDetails" setup lang="ts">
import { provide } from 'vue';
import { Content, Divider, Header, Layout, Spin, Tooltip } from 'view-ui-plus';
import type { InputInstance } from 'element-plus';
import { ElInput, ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { ArrowDown, CopyDocument, DArrowLeft, DArrowRight, Delete, EditPen, Plus } from '@element-plus/icons-vue';
// 路由
import { useRoute, useRouter } from 'vue-router';
import previewCurrent from '@/components/FabricEditor/previewCurrent.vue';
import save from '@/components/FabricEditor/save.vue';
import lang from '@/components/FabricEditor/lang.vue';
import zoom from '@/components/FabricEditor/zoom.vue';
import dragMode from '@/components/FabricEditor/dragMode.vue';
import waterMark from '@/components/FabricEditor/waterMark.vue';
import history from '@/components/FabricEditor/history.vue';
import FabricEditorTools from '@/components/FabricEditor/FabricEditorTools.vue';
import FabricEditorAttr from '@/components/FabricEditor/FabricEditorAttr.vue';

// 功能组件
import { fabric } from 'fabric';

// hooks
import useSelectListen from '@/hooks/useSelectListen';
import { useI18n } from 'vue-i18n';
import Editor, {
  AddBaseTypePlugin,
  AlignGuidLinePlugin,
  BarCodePlugin,
  CenterAlignPlugin,
  ControlsPlugin,
  CopyPlugin,
  DeleteHotKeyPlugin,
  DrawLinePlugin,
  DrawPolygonPlugin,
  DringPlugin,
  FlipPlugin,
  FontPlugin,
  FreeDrawPlugin,
  GroupAlignPlugin,
  GroupPlugin,
  GroupTextEditorPlugin,
  HistoryPlugin,
  IEditor,
  ImageStroke,
  LayerPlugin,
  LockPlugin,
  MaskPlugin,
  MaterialPlugin,
  MoveHotKeyPlugin,
  PathTextPlugin,
  PolygonModifyPlugin,
  PsdPlugin,
  QrCodePlugin,
  // ResizePlugin,
  RulerPlugin,
  SimpleClipImagePlugin,
  WaterMarkPlugin,
  WorkspacePlugin
} from '@kuaitu/core';
// 新增模版
import { nextTick, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { getCategoriesStyle, updateCategoriesStyle } from '@/api/kjds/categoriesStyle';
import { CategoriesStyleVO } from '@/api/kjds/categoriesStyle/types';
import { isInArray } from '@/utils';
import { uploadFileToInfo } from '@/utils/FabricCanvasEditor';

const router = useRouter();

const { t } = useI18n();

const APIHOST = import.meta.env.VITE_APP_APIHOST;

const route = useRoute();
const styleData = ref<CategoriesStyleVO>(); //风格画数据
const titleName = ref<string>(''); //图稿标题
const tagIndex = ref<number>(0);
const buttonLoading = ref(false);
const canvasEditor = new Editor() as IEditor; // 创建编辑器
const inputValue = ref('');
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();
const { mixinState } = useSelectListen(canvasEditor); //hooks
provide('fabric', fabric);
provide('canvasEditor', canvasEditor);
// provide('mixinState', mixinState);
let defaultJson = {
  version: '5.4.0',
  objects: [
    {
      type: 'rect',
      version: '5.4.0',
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      width: 900,
      height: 1200,
      fill: 'rgba(255,255,255,1)',
      stroke: null,
      strokeWidth: 0,
      strokeDashArray: null,
      strokeLineCap: 'butt',
      strokeDashOffset: 0,
      strokeLineJoin: 'miter',
      strokeUniform: false,
      strokeMiterLimit: 4,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      shadow: null,
      visible: true,
      backgroundColor: '',
      fillRule: 'nonzero',
      paintFirst: 'fill',
      globalCompositeOperation: 'source-over',
      skewX: 0,
      skewY: 0,
      rx: 0,
      ry: 0,
      id: 'workspace',
      selectable: false,
      hasControls: false
    }
  ],
  clipPath: {
    type: 'rect',
    version: '5.4.0',
    originX: 'left',
    originY: 'top',
    left: 0,
    top: 0,
    width: 900,
    height: 1200,
    fill: 'rgba(255,255,255,1)',
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: 'butt',
    strokeDashOffset: 0,
    strokeLineJoin: 'miter',
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: '',
    fillRule: 'nonzero',
    paintFirst: 'fill',
    globalCompositeOperation: 'source-over',
    skewX: 0,
    skewY: 0,
    rx: 0,
    ry: 0,
    selectable: true,
    hasControls: true
  }
};
interface Templs {
  name: string;
  json: any;
}

// 需要保存的模板数据
const templs = ref<Templs[]>([
  {
    name: 'Default Option',
    json: cloneDeep(defaultJson)
  }
]);
const state = reactive({
  show: false,
  ruler: true
});

const changeTitle = () => {
  //更换标题
  ElMessageBox.prompt('请输入图稿标题名称', '提示', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    inputValue: titleName.value
  })
    .then(({ value }) => {
      styleData.value.name = value;
      updateCategoriesStyle(styleData.value).then((res) => {
        if (res.code == 200) {
          ElMessage({
            type: 'success',
            message: '标题更换成功'
          });

          titleName.value = value;
        } else {
          ElMessage({
            type: 'error',
            message: res.msg
          });
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消标题更换'
      });
    });
};

const initCanvasEditor = () => {
  // 初始化fabric
  const canvas = new fabric.Canvas('canvas', {
    fireRightClick: true, // 启用右键，button的数字为3
    stopContextMenu: true, // 禁止默认右键菜单
    controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
    // imageSmoothingEnabled: false, // 解决文字导出后不清晰问题
    preserveObjectStacking: true // 当选择画布中的对象时，让对象不在顶层。
  });

  // 初始化编辑器
  canvasEditor.init(canvas);
  canvasEditor
    .use(DringPlugin)
    .use(PolygonModifyPlugin)
    .use(AlignGuidLinePlugin)
    .use(ControlsPlugin)
    // .use(ControlsRotatePlugin)
    .use(CenterAlignPlugin)
    .use(LayerPlugin)
    .use(CopyPlugin)
    .use(MoveHotKeyPlugin)
    .use(DeleteHotKeyPlugin)
    // .use(GroupPlugin)
    .use(DrawLinePlugin)
    .use(GroupTextEditorPlugin)
    .use(GroupAlignPlugin)
    .use(WorkspacePlugin)
    .use(HistoryPlugin)
    .use(FlipPlugin)
    .use(RulerPlugin)
    .use(DrawPolygonPlugin)
    .use(FreeDrawPlugin)
    .use(PathTextPlugin)
    .use(SimpleClipImagePlugin)
    .use(BarCodePlugin)
    .use(QrCodePlugin)
    .use(FontPlugin, {
      repoSrc: APIHOST
    })
    .use(MaterialPlugin, {
      repoSrc: APIHOST
    })
    .use(WaterMarkPlugin)
    .use(PsdPlugin)
    .use(ImageStroke)
    // .use(ResizePlugin)
    .use(LockPlugin)
    .use(AddBaseTypePlugin)
    .use(MaskPlugin);

  state.show = true;
  // 默认打开标尺
  if (state.ruler) {
    canvasEditor.rulerEnable();
  }
};

// 获取风格详情
const getStyleDetails = () => {
  getCategoriesStyle(route.query.styleId as string).then((res) => {
    const data: CategoriesStyleVO = res.data;
    titleName.value = data?.name;
    styleData.value = data;

    // 设置默认json
    const styleWidth = data?.width !== null ? data?.width : 900;
    const styleHeight = data?.length !== null ? data?.length : 1200;
    const styleFill = data?.type == '0' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)';
    defaultJson.objects[0].width = typeof styleWidth === 'string' ? parseInt(styleWidth) : styleWidth;
    defaultJson.objects[0].height = styleHeight;
    defaultJson.objects[0].fill = styleFill;
    defaultJson.clipPath.width = typeof styleWidth === 'string' ? parseInt(styleWidth) : styleWidth;
    defaultJson.clipPath.height = styleHeight;
    defaultJson.clipPath.fill = styleFill;

    // 回显模版信息
    let templArr: Templs[];
    if (data?.templs === null) {
      //新建的
      templArr = [
        {
          name: '默认模板',
          json: cloneDeep(defaultJson)
        }
      ];
    } else {
      try {
        if (typeof data?.templs === 'string') {
          templArr = JSON.parse(data?.templs);
        }
      } catch (e) {
        console.error('解析 JSON 错误，使用默认模板');
        templArr = [
          {
            name: '默认模板',
            json: cloneDeep(defaultJson)
          }
        ];
      }
    }

    templs.value = templArr;
    canvasFun(tagIndex.value);
  });
};

onMounted(() => {
  nextTick(() => {
    initCanvasEditor();

    if (route?.query?.styleId) {
      getStyleDetails();
    }
  });
});

onUnmounted(() => {
  canvasEditor.destroy();
});
const rulerSwitch = (val) => {
  if (val) {
    canvasEditor.rulerEnable();
  } else {
    canvasEditor.rulerDisable();
  }
  // 使标尺开关组件失焦，避免响应键盘的空格事件
  // @ts-expect-error: 获取当前聚焦元素
  document.activeElement?.blur();
};
// 返回
const designBack = () => {
  router.go(-1);
};

// 保存
const designSave = async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '保存中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  buttonLoading.value = true;
  try {
    const base64 = await canvasEditor.preview();
    console.log('保存图片', base64);
    let imgInfo = await uploadFileToInfo(base64).finally(() => (buttonLoading.value = false)); //画布转图片
    console.log('图片信息', imgInfo);
    templs.value[tagIndex.value].json = canvasEditor.getJson();
    console.log('保存JSON', templs.value[tagIndex.value].json);
    const params = {
      ...styleData.value,
      templs: JSON.stringify(templs.value),
      definitionImageUrl: imgInfo
    };
    const res = await updateCategoriesStyle(params);
    console.log('保存风格详情', res);
    if (res.code === 200) {
      ElMessage({
        message: '保存成功',
        type: 'success'
      });
    } else {
      ElMessage({
        message: res.msg,
        type: 'error'
      });
    }
  } catch (err) {
    console.error(err);
    ElMessage({
      message: '保存失败',
      type: 'error'
    });
  } finally {
    loadingInstance.close();
    buttonLoading.value = false;
  }
};
// 画布初始化
const canvasFun = (index: number) => {
  const json = templs.value[index].json;
  // 加载模板JSON
  canvasEditor.loadJSON(JSON.stringify(json), Spin.hide);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

const handleInputConfirm = () => {
  //新增模版input确认事件
  if (inputValue.value) {
    // 判断模版名称是否重复
    const newName = inputValue.value;
    if (isNameDuplicate(newName)) {
      ElMessage.warning(t('artworksDetails.theThemeNameIsDuplicated'));
      return;
    }

    templs.value.push({
      name: inputValue.value,
      json: cloneDeep(defaultJson)
    });
    let index = templs.value.length - 1;
    // tagIndex.value = index;
    // canvasFun(index);
    const nowJson = canvasEditor.getJson();
    templs.value[tagIndex.value].json = nowJson; // 切换之前保存当前画布数据
    tagIndex.value = index;
    canvasFun(index);
  }

  inputVisible.value = false;
  inputValue.value = '';
};

// 切换tag
const changeCanvas = (index: number) => {
  // 切换之前保存当前画布数据
  const nowJson = canvasEditor.getJson();
  templs.value[tagIndex.value].json = nowJson;
  setTimeout(() => {
    tagIndex.value = index;
    canvasFun(index);
  }, 10);
};
const isNameDuplicate = (name: string) => {
  return isInArray(templs.value, name, 'name');
};
// 重命名
const handleTagRename = (index: number) => {
  ElMessageBox.prompt(t('artworksDetails.title'), t('artworksDetails.templateTitle'), {
    confirmButtonText: t('ok'),
    cancelButtonText: t('cancel'),
    inputValue: templs.value[index].name,
    inputPattern: /^.+$/,
    inputErrorMessage: t('artworksDetails.pleaseEnterTemplateTitle'),
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        // 判断模版名称是否重复
        const newName = instance.inputValue;
        if (isNameDuplicate(newName)) {
          ElMessage.warning(t('artworksDetails.theThemeNameIsDuplicated'));
          return;
        }
        templs.value[index].name = newName;
        done(); // 关闭对话框
      } else if (action === 'cancel') {
        done();
      }
    }
  });
};
// 复制当前添加到列表最后
const handleTagCopy = (index: number) => {
  const copyObj = cloneDeep(templs.value[index]);
  copyObj.name = 'Copy of ' + copyObj.name;
  // 判断模版名称是否重复
  if (isNameDuplicate(copyObj.name)) {
    ElMessage.warning(t('artworksDetails.theThemeNameIsDuplicated'));
    return;
  }
  templs.value.push({
    name: copyObj.name,
    json: copyObj.json
  });
};
// 移至第一个
const handleTagMoveToFirst = (index: number) => {
  const copyObj = cloneDeep(templs.value[index]);
  templs.value.splice(index, 1);
  templs.value.unshift(copyObj);

  if (tagIndex.value === index) {
    tagIndex.value = 0;
  } else {
    tagIndex.value++;
    if (tagIndex.value > templs.value.length - 1) {
      tagIndex.value = templs.value.length - 1;
    }
  }
};
// 移至最后一个
const handleTagMoveToLast = (index: number) => {
  const copyObj = cloneDeep(templs.value[index]);
  templs.value.splice(index, 1);
  templs.value.push(copyObj);

  if (tagIndex.value === index) {
    tagIndex.value = templs.value.length - 1;
  } else {
    tagIndex.value--;
    if (tagIndex.value < 0) {
      tagIndex.value = 0;
    }
  }
};
// 删除
const handleTagDel = (index: number) => {
  // 删除当前标签
  ElMessageBox.confirm(t('artworksDetails.deleteConfirm'), t('tip'), {
    confirmButtonText: t('ok'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    templs.value.splice(index, 1);
    if (tagIndex.value === index) {
      tagIndex.value = tagIndex.value - 1;
      if (tagIndex.value < 0) {
        tagIndex.value = 0;
      }
      canvasFun(tagIndex.value);
    } else {
      tagIndex.value--;
      if (tagIndex.value < 0) {
        tagIndex.value = 0;
      }
    }
  });
};
</script>

<style lang="less" scoped>
.design-header {
  //图稿标题
  width: 100%;
  padding-top: 30px;
  box-sizing: border-box;
  // margin: 0 auto;
  background-color: #fff;
  display: flex;
}
.design-header h3 {
  //图稿标题
  // width: 100%;
  // text-align: center;
  // align-self: center;
  // justify-self: center;
  margin: 0 auto;
}
.design-header .el-button {
  //图稿标题
  // width: 100%;
  // text-align: right;
  margin-right: 20px;
}

// 属性面板样式
:deep(.attr-item) {
  position: relative;
  margin-bottom: 12px;
  height: 40px;
  padding: 0 10px;
  background: #f6f7f9;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  .ivu-tooltip {
    text-align: center;
    flex: 1;
  }
}

.ivu-menu-vertical .menu-item {
  text-align: center;
  padding: 10px 2px;
  box-sizing: border-box;
  font-size: 12px;

  & > i {
    margin: 0;
  }
}

:deep(.ivu-layout-header) {
  --height: 45px;
  padding: 0 0px;
  border-bottom: 1px solid #eef2f8;
  background: #fff;
  height: var(--height);
  line-height: var(--height);
  display: flex;
  justify-content: space-between;
}

.left,
.right {
  display: flex;
  align-items: center;
  img {
    display: block;
    margin-right: 10px;
  }
}
.home,
.ivu-layout {
  height: 100vh;
}

.icon {
  display: block;
}

.canvas-box {
  position: relative;
}
// 画布内阴影
.inside-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 9px 2px #0000001f;
  z-index: 2;
  pointer-events: none;
}

#canvas {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

#workspace {
  flex: 1;
  width: 100%;
  position: relative;
  background: #f1f1f1;
  overflow: hidden;
}

.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: none;
}
// 标尺
.switch {
  margin-right: 10px;
}
// 网格背景
.design-stage-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 16px;
  --color: #dedcdc;
  background-image: linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position:
    var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
.tag-box {
  margin-left: 130px;
  display: flex;
  align-items: center;

  :deep(.el-tag--dark) {
    .el-dropdown .el-dropdown-link {
      color: #fff !important;
    }
  }
}
</style>
