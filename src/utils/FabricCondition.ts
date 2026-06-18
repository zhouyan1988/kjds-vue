import {
  ConditionAction,
  ConditionActionEnum,
  ConditionMatchEnum,
  ConditionRulesLogicEnum,
  ConditionRulesVO,
  FabricObjectVO,
  OptArresVO
} from '@/utils/editor';

/**
 * 条件渲染
 */
export class FabricCondition {
  /**
   * 模板JSON对象数组
   * 存储当前编辑器中所有对象的配置信息，用于条件渲染和规则匹配
   */
  private objs: FabricObjectVO[];

  constructor(objs: FabricObjectVO[] = []) {
    this.objs = objs;
  }

  /**
   * 设置模板JSON对象数组
   * @param objs
   */
  public setObjects(objs: FabricObjectVO[] = []) {
    this.objs = objs;
  }

  /**
   * 判断模板是否渲染
   * @param templ
   */
  public isCanRenderTempl(templ: FabricObjectVO): boolean {
    // 默认渲染
    let isRender = false;

    // 检查是否启用规则渲染
    if (templ?.condition?.enable) {
      const { match, action, rules } = templ.condition || {};

      if (!rules || rules.length === 0) {
        console.warn('No rules found');
        return isRender;
      }

      try {
        let matchResult = false;
        switch (match) {
          case ConditionMatchEnum.All:
            matchResult = this.allRulesMatch(rules);
            break;
          case ConditionMatchEnum.One:
            matchResult = this.anyRuleMatches(rules);
            break;
          case ConditionMatchEnum.None:
            matchResult = this.noRulesMatch(rules);
            break;
          default:
            console.error(`Unknown match type: ${match}`);
        }

        isRender = this.determineRenderAction(action, matchResult);
      } catch (e) {
        console.error('Error in rule matching:', e);
      }
    } else {
      isRender = true;
    }

    return isRender;
  }

  /**
   * 判断模板是否需要修改文字颜色
   * @param templ 选项对象
   * @param val 选项值
   */
  public isCanRenderTemplColor(templ: FabricObjectVO, val: string): string {
    const _this = this;
    // 默认渲染
    let isRender = (templ?.fill as string) || '#000000';
    // 检查是否启用规则渲染
    if (templ?.conditionColor?.enable) {
      const option = templ.conditionColor.option || '';

      if (!option) {
        console.warn('No Option found');
        return isRender;
      }
      const optionObj = _this.getOptionObj(option);
      if (optionObj) {
        const optArres = optionObj?.optArres;
        const curtOpt = optArres.find((item: OptArresVO) => item.value === val);
        isRender = curtOpt?.color || (templ?.fill as string) || '#000000';
      }
    }
    return isRender;
  }

  /**
   * 根据规则ID获取规则对象
   * @param rule
   * @private
   */
  private getRuleObj(rule: ConditionRulesVO): FabricObjectVO {
    return this.objs.find((item: FabricObjectVO) => item.id === rule.option);
  }

  /**
   * 根据选项ID获取选项对象
   * @param option 选项ID
   * @private
   */
  private getOptionObj(option: string): FabricObjectVO {
    return this.objs.find((item: FabricObjectVO) => item.id === option);
  }
  /**
   * 判断所有规则是否都匹配
   * @param rules
   * @private
   */
  private allRulesMatch(rules: ConditionRulesVO[]): boolean {
    for (const rule of rules) {
      if (!this.ruleMatches(rule)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 判断是否有规则匹配
   * @param rules
   * @private
   */
  private anyRuleMatches(rules: ConditionRulesVO[]): boolean {
    for (const rule of rules) {
      if (this.ruleMatches(rule)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断是否所有规则都不匹配
   * @param rules
   * @private
   */
  private noRulesMatch(rules: ConditionRulesVO[]): boolean {
    for (const rule of rules) {
      if (this.ruleMatches(rule)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 判断规则是否匹配
   * @param rule
   * @private
   */
  private ruleMatches(rule: ConditionRulesVO): boolean {
    const obj = this.getRuleObj(rule);
    if (!obj) return false;

    const { logic, value } = rule;
    const optionValue = obj.optDefVal;

    switch (logic) {
      case ConditionRulesLogicEnum.EqualTo:
        return value === optionValue;
      case ConditionRulesLogicEnum.NotEqualTo:
        return value !== optionValue;
      default:
        console.error(`Unknown rule logic: ${logic}`);
        return false;
    }
  }

  /**
   * 根据规则动作判断是否渲染
   * @param action
   * @param matchResult
   * @private
   */
  private determineRenderAction(action: ConditionAction, matchResult: boolean): boolean {
    switch (action) {
      case ConditionActionEnum.Show:
        return matchResult;
      case ConditionActionEnum.Hide:
        return !matchResult;
      default:
        console.error(`Unknown action: ${action}`);
        return false; // 默认不渲染
    }
  }
}
