import { warn } from 'vue';
import { EnumAppMode } from 'tdp-editor-types/src/enum';
import type FdComponent from '../../component';
import {
    addComponent,
    removeComponent,
    getComponentByKey,
    getAppMode,
    getComponentsMap,
} from 'tdp-editor-types/src/constant/injectKeys';

import { inject } from 'vue';
import type { ComponentPublicInstance } from 'vue';

export default function useBaseInject() {
    return {
        // 向页面注册组件
        addComponent: inject(
            addComponent,
            (key: string, componentInstance: ComponentPublicInstance) => {
                warn('inject default: addComponent ------------->', key, componentInstance);
            }
        ),
        // 从页面中删除组件

        removeComponent: inject(removeComponent, (key: string) => {
            warn('inject default: removeComponent ------------->', key);
        }),
        // 获取页面种的某个组件
        getComponentByKey: inject(getComponentByKey, (key: string) => {
            warn('inject default: getComponentByKey ------------->', key);
            return undefined as FdComponent | undefined;
        }),
        getAppMode: inject(getAppMode, () => {
            warn('inject default: getAppMode ------------->');
            return EnumAppMode.runtime;
        }),
        // 获取当前页面的组件Map对象
        getPageComponentsMap: inject(getComponentsMap, () => {
            warn('inject default: getPageComponentsMap ------------->');
            return new Map<string, ComponentPublicInstance>();
        }),
    };
}
