import { ConditionData, LogicType } from "../../constant/BaseConst";
import Events, { EventName, preloadEvent } from "../../common/util/Events";
import ParamItem from "../parameters/ParamItem";

/**
 * 管理运行时单个条件数据
 */
export default class Condition {
    private _paramItem: ParamItem = null;
    public get paramItem() { return this._paramItem; }

    public _rightParamItem: ParamItem = null;
    public value: number = 0;
    public logic: LogicType = LogicType.EQUAL;
    public useParam: number = 0;

    constructor(paramItem: ParamItem) {
        this.reset(paramItem);
    }

    /**
     * 销毁
     */
    public destroy() {

    }

    public reset(paramItem: ParamItem) {
        this._paramItem = paramItem;
        this.value = 0;
        this.logic = LogicType.EQUAL;
    }

    public getConditionData() {
        let data: ConditionData = {
            param: this._paramItem.paramName,
            value: this.value,
            logic: this.logic,
            rparam: (this._rightParamItem == null) ? "" : this._rightParamItem.paramName,
            useparam: this.useParam,
        };
        return data;
    }
}