import { defineAsyncComponent } from 'vue';
import {
    EnumComponentGroup,
    EnumComponentType,
    EnumEventName,
    EnumEventType,
    EnumPropsValueType,
} from 'tdp-editor-types/enum/components';
import { EnumCssProerty, EnumSelectorName } from 'tdp-editor-types/enum/designer';
import type {
    IDesignerComponent,
    registerComponentFunc,
} from 'tdp-editor-types/interface/designer';
import type { IPageProps } from './interface';

export default defineAsyncComponent(() => {
    return import('./page.vue');
});

export const register: registerComponentFunc = function () {
    const page: IDesignerComponent<IPageProps> = {
        key: '',
        code: '',
        label: '页面',
        icons: 'manage_page',
        group: EnumComponentGroup.form,
        type: EnumComponentType.page,
        showInList: false,
        getDefaultProps: () => {
            return {
                title: {
                    type: EnumPropsValueType.string,
                    value: '可以输入页面标题',
                },
            };
        },
        cssConfigs: [EnumCssProerty.width],
        propsConfigs: [
            {
                key: 'title',
                label: '页面标题',
                selector: EnumSelectorName.input,
            },
        ],
        eventConfigs: [{ eventName: EnumEventName.click, eventTypes: [EnumEventType.script] }],
    };
    return page;
};