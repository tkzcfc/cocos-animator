import Events, { EventName } from "../../common/util/Events";
import ConditionItem from "../inspector/ConditionItem";
import ParamItem from "../parameters/ParamItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ParamSelectItem extends cc.Component {
    @property(cc.Label) ParamName: cc.Label = null;

    private _paramItem: ParamItem = null;
    private _conditionItem: ConditionItem = null;
    private _isRightParam: boolean = false;

    public onInit(paramItem: ParamItem, conditionItem: ConditionItem, isRightParam: boolean) {
        this._paramItem = paramItem;
        this._conditionItem = conditionItem;
        this._isRightParam = isRightParam

        this.ParamName.string = this._paramItem.paramName;
    }

    private onClick() {
        if(this._isRightParam)
            this._conditionItem.onSelectRightParamName(this._paramItem);
        else
            this._conditionItem.onReset(this._paramItem);
        Events.emit(EventName.CLOSE_MENU);
    }
}
