import Events, { EventName, preloadEvent } from "../../common/util/Events";
import { RecycleNode } from "../../common/util/RecyclePool";
import { LogicType, ParamType } from "../../constant/BaseConst";
import Condition from "../data/Condition";
import ParamItem from "../parameters/ParamItem";
import Editor from "../Editor";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ConditionItem extends cc.Component implements RecycleNode {
    @property(cc.Node) Bg: cc.Node = null;
    @property(cc.Label) ParamName: cc.Label = null;
    @property(cc.Label) ComParamName: cc.Label = null;
    @property(cc.Node) LogicNode: cc.Node = null;
    @property(cc.Node) ValueNode: cc.Node = null;
    @property(cc.Node) UseParam: cc.Node = null;
    
    
    /** 组件是否初始化完成 */
    private _hasInit: boolean = false;

    public condition: Condition = null;

    public reuse() {
    }

    public unuse() {
        this._hasInit = false;
        Events.targetOff(this);
    }

    public onInit(condition: Condition) {
        this.Bg.opacity = 0;
        this.condition = condition;
        this.ParamName.string = this.condition.paramItem.paramName;

        this.updateUI();
        
        this._hasInit = true;
        Events.targetOn(this);
    }

    protected onLoad() {
        this.Bg.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDestroy() {
        Events.targetOff(this);
    }


    public getValidParamNum(){
        let count = 0;
        Editor.Inst.Parameters.ParamContent.children.forEach((e) => {
            let curItem = e.getComponent(ParamItem)
            if(curItem.type == this.condition.paramItem.type &&
                curItem.paramName !== this.condition.paramItem.paramName)
            {
                count++;
            }
        });
        return count;
    }

    public getFirstValidParam(){
        let paramName = null;
        let find = false;
        Editor.Inst.Parameters.ParamContent.children.forEach((e) => {
            let curItem = e.getComponent(ParamItem)
            if(find == false &&
                curItem.type == this.condition.paramItem.type &&
                curItem !== this.condition.paramItem)
            {
                find = true;
                paramName = curItem;
            }
        });
        return paramName
    }

    // 切换右值参数名
    public onSelectRightParamName(paramItem: ParamItem){
        if(this.condition.useParam !== 0)
        {
            this.condition._rightParamItem = paramItem;

            this.ValueNode.getChildByName('param').active = true;
            this.ValueNode.getChildByName('number').active = false;
            this.ValueNode.getChildByName('boolean').active = false;
            
            this.UseParam.getChildByName("checkmark").active = true;
            this.ComParamName.string = paramItem.paramName;
        }
    }

    /**
     * 重置参数
     * @param paramItem 
     */
    public onReset(paramItem: ParamItem) {
        this.condition.reset(paramItem);

        if(this.condition.paramItem === this.condition._rightParamItem)
        {
            this.condition._rightParamItem = null;
            this.condition.useParam = 0
        }
        this.updateUI();
    }


    /**
     * 切换logic选项
     */
    public changeLogic(logic: LogicType) {
        this.condition.logic = logic;
        let logicLab: cc.Label = this.LogicNode.getChildByName('lab').getComponent(cc.Label);
        if (logic === LogicType.EQUAL) {
            logicLab.string = '===';
        } else if (logic === LogicType.NOTEQUAL) {
            logicLab.string = '!==';
        } else if (logic === LogicType.GREATER) {
            logicLab.string = '>';
        } else if (logic === LogicType.LESS) {
            logicLab.string = '<';
        } else if (logic === LogicType.GREATER_EQUAL) {
            logicLab.string = '>=';
        } else if (logic === LogicType.LESS_EQUAL) {
            logicLab.string = '<=';
        }
    }

    /**
     * 选中
     */
    public select(value: boolean) {
        this.Bg.opacity = value ? 255 : 0;
    }

    private onTouchStart() {
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onClickParamSelect(event: cc.Event) {
        let target: cc.Node = event.target;
        Events.emit(EventName.SHOW_PARAM_SELECT, target, this);
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onClickRightParamSelect(event: cc.Event) {
        let target: cc.Node = event.target;
        Events.emit(EventName.SHOW_RIGHT_PARAM_SELECT, target, this);
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onUseParamCheckd(toggle: cc.Toggle){

        let active = this.UseParam.getChildByName("checkmark").active
        this.condition.useParam = active ? 0 : 1;
        if(this.condition.useParam == 1)
        {
            this.condition._rightParamItem = this.getFirstValidParam()
        }
        
        // this.condition.useParam = toggle.isChecked ? 1 : 0;
        // if(toggle.isChecked)
        // {
        //     this.condition._rightParamItem = this.getFirstValidParam()
        // }
        this.updateUI();
    }

    private onClickLogicSelect(event: cc.Event) {
        let target: cc.Node = event.target;
        let worldPos: cc.Vec2 = target.parent.convertToWorldSpaceAR(target.position.sub(cc.v2(0, 0)));
        Events.emit(EventName.SHOW_LOGIC, worldPos, target.height, this);
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onValueBoolCheckd(toggle: cc.Toggle) {
        this.condition.value = toggle.isChecked ? 1 : 0;
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onValueNumberEditBegan() {
        this._hasInit && Events.emit(EventName.CONDITION_SELECT, this);
    }

    private onValueNumberChanged(str: string, edit: cc.EditBox) {
        str = str.replace(/[^-.\d]/g, '');
        if (str === '') {
            return;
        }
        let num = 0;
        // int 类型
        if (this.condition.paramItem.type === ParamType.NUMBER)
            num = parseInt(str);
        else
            num = parseFloat(str);

        this.condition.value = isNaN(num) ? 0 : num;
        edit.string = `${this.condition.value}`;
    }

    @preloadEvent(EventName.PARAM_NAME_CHANGED)
    private onEventParamChanged(paramItem: ParamItem) {
        if(this.condition.useParam !== 0 && this.condition._rightParamItem == paramItem)
        {
            this.updateUI()
        }
        if (this.condition.paramItem !== paramItem) {
            return;
        }
        this.ParamName.string = this.condition.paramItem.paramName;
    }

    @preloadEvent(EventName.PARAM_DELETE)
    private onEventParamDelete(paramItem: ParamItem) {
        if(this.condition.useParam !== 0 && this.condition._rightParamItem == paramItem)
        {
            this.condition.useParam = 0;
            this.condition._rightParamItem = null
            this.updateUI()
        }
    }


    
    private updateUI()
    {
        let validNum = this.getValidParamNum()
        if(validNum <= 0)
        {
            this.condition.useParam = 0;
            this.condition._rightParamItem = null;
            this.UseParam.active = false
        }
        else{
            this.UseParam.active = true
        }

        if(this.condition.useParam === 0)
            this.condition._rightParamItem = null;
        if(this.condition._rightParamItem == null)
            this.condition.useParam = 0

        this.ParamName.string = this.condition.paramItem.paramName;
        if(this.condition.useParam !== 0){
            this.ValueNode.getChildByName('param').active = true;
            this.ValueNode.getChildByName('number').active = false;
            this.ValueNode.getChildByName('boolean').active = false;
            this.UseParam.getChildByName("checkmark").active = true;
            this.ComParamName.string = this.condition._rightParamItem.paramName;
        }
        else{
            this.UseParam.getChildByName("checkmark").active = false;
            this.ValueNode.getChildByName('param').active = false;

            if (this.condition.paramItem.type === ParamType.BOOLEAN) {
                this.LogicNode.active = false;
                this.ValueNode.active = true;
                this.ValueNode.getChildByName('number').active = false;
                this.ValueNode.getChildByName('boolean').active = true;

                let toggle = this.ValueNode.getChildByName('boolean').getComponent(cc.Toggle);
                toggle.isChecked = this.condition.value !== 0 ? true : false;
            } else if (this.condition.paramItem.type === ParamType.NUMBER || this.condition.paramItem.type === ParamType.FLOAT) {
                this.LogicNode.active = true;
                this.ValueNode.active = true;
                this.ValueNode.getChildByName('number').active = true;
                this.ValueNode.getChildByName('boolean').active = false;

                this.changeLogic(this.condition.logic);
                let edit = this.ValueNode.getChildByName('number').getComponent(cc.EditBox);
                edit.string = `${this.condition.value}`;
            } else {
                this.LogicNode.active = false;
                this.ValueNode.active = false;
            }
        }
    }
}
