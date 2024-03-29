import type { VNode } from 'vue';
import type { IComponentProps, IComponentState, TCssStyleName } from '../app/components';
import type { EnumSelectorName } from '../../enum/designer';
import type { EnumEventName, EnumEventType, EnumPropsValueType } from '../../enum/components';

// 设计模式下组件的属性
export interface IDesignerComponent<P = any, C = Partial<CSSStyleDeclaration>>
    extends IComponentState<P, C> {
    sfc?: any;
    label?: string /* 页面显示名称 */;
    order?: number;
    icons?: string;
    listGroup?: 'normal' | 'business' | 'high';
    propsConfigs?: IPropsConfig<P>[];
    cssConfigs?: TCssStyleName[];
    eventConfigs?: TEventConfig[];
    showInList?: boolean;
    getDefaultProps?: () => IComponentProps<P>;
    getDefaultCss?: () => C;
}

export type TEventConfig = {
    eventName: EnumEventName;
    eventTypes: EnumEventType[];
};

export type propsValueType<P> = P[keyof P] | undefined | null;

// 属性渲染工厂定义
export interface IPropsRenderFactory {
    getPropsValue: <P, K extends keyof P>(
        state: IComponentState<P>,
        propertyName: K
    ) => P[K] | undefined;
    setPropsValue: <P, K extends keyof P>(
        state: IComponentState<P>,
        propertyName: K,
        value: P[K] | unknown | undefined,
        type?: EnumPropsValueType
    ) => void;
    pushPropsValue: <P, K extends keyof P>(
        state: IComponentState<P>,
        propertyName: K,
        value: any
    ) => void;
    removePropsValue: <P, K extends keyof P>(
        state: IComponentState<P>,
        propertyName: K,
        index: number
    ) => void;
    formatProps: <P>(
        props: IComponentProps<P>,
        getExpression: (expression: any, dsKey: string) => any,
        getFunction: (value: string) => Function,
        dsKey?: string
    ) => P;
}

// 属性选择器render函数定义
export type IPropsSelectorRender<P> = (
    state: IDesignerComponent<P>,
    propsFactory: IPropsRenderFactory
) => VNode;

// 需要给selector传递参数的对象
export type IPropsSelectorObj<O = {}> = {
    name: EnumSelectorName;
    options?: O;
};
export type propsSelectorType<P> = EnumSelectorName | IPropsSelectorRender<P> | IPropsSelectorObj;

// 属性配置定义
export type IPropsConfig<P = any> = {
    key: keyof P;
    label: string;
    enableExpression?: boolean;
    selector: propsSelectorType<P> | propsSelectorType<P>[];
};

export type registerComponentFunc<P = any> = () => IDesignerComponent<P> | IDesignerComponent<P>[];
