// 自定义国际化配置
import { createI18n } from 'vue-i18n';
import zh from 'view-ui-plus/dist/locale/zh-CN';
import en from 'view-ui-plus/dist/locale/en-US'; //新版本把'iview'改成'view-design'
import US from './en.json';
import CN from './zh.json';

import { LanguageEnum } from '@/enums/LanguageEnum';

const messages = {
  en: Object.assign(US, en), //将自己的英文包和iview提供的结合
  zh: Object.assign(CN, zh) //将自己的中文包和iview提供的结合
};

/**
 * 获取当前语言
 * @returns zh-cn|en ...
 */
export const getLanguage = (): LanguageEnum => {
  const language = useStorage<LanguageEnum>('language', LanguageEnum.zh);
  if (language.value) {
    return language.value;
  }
  return LanguageEnum.zh;
};

const i18n = createI18n({
  globalInjection: true,
  allowComposition: true,
  legacy: false,
  locale: getLanguage(),
  messages
});

export default i18n;
