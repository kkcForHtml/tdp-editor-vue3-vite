/**
 * editorStore editor全局状态
 * 只处理editor state的相关方法，如果需要处理其他store中的数据，则要将方法放到对应的EditorController中
 */
import { defineStore } from 'pinia';
import { EnumComponentType } from 'tdp-editor-types/src/enum/components';

import type { IEditorStore } from 'tdp-editor-types/src/interface/store';
import type { IDesignerComponent } from 'tdp-editor-types/src/interface/designer';

import { utils } from '..';
import { apps, forms } from '../service';
import { $log } from '../utils';
import type { IComponentState, IPageState } from 'tdp-editor-types/src/interface/app/components';
// import { useAppStore } from './appStore';

export const useEditorStore = defineStore('editorStore', {
    state: (): IEditorStore => {
        return {
            selectedComponent: undefined,
            componentList: [],
            dragComponent: undefined, // 正在拖动的组件
            pageEditMode: 'content',
            pageStatus: {},
            headerStatus: {},
            footerStatus: {},
            leftStatus: {},
            rightStatus: {},
        };
    },
    actions: {
        // 初始化editor的组件列表
        initComponentList(payload: { list: IDesignerComponent[] }) {
            this.componentList = payload.list;
        },
        // 追加一批组件
        addComponents(payload: { list: IDesignerComponent[] }) {
            payload.list.forEach(l => {
                if (!this.componentList.some(c => c.type === l.type)) {
                    this.componentList.push(l);
                }
            });
        },
        // 在editor中创建一个空的页面
        createNewEmptyPage(pages: IPageState[]) {
            return getDefaultPageModule(pages, this.componentList);
        },
        // 设计面板拖入组件
        dragAddComponent(payload: { parent: IDesignerComponent; component: IDesignerComponent }) {
            if (payload.parent) {
                this.selectedComponent = payload.component;
            }
        },
        // 双击添加组件
        doubleAddComponent<C extends IDesignerComponent>(payload: { parent: C; component: C }) {
            if (payload.parent && payload.component) {
                // 父组件是页面，并且要添加的组件是容器组件时，才可以正常添加
                if (payload.parent.type === EnumComponentType.page && payload.component.box) {
                    payload.parent.list?.push(payload.component);
                }
                // 不是页面时，需要父组件是容器组件才能添加
                else if (payload.parent.type !== EnumComponentType.page && payload.parent.box) {
                    payload.parent.list?.push(payload.component);
                    // state.selectedComponent = payload.component;
                }
            }
        },
        createNewCompJson(type: EnumComponentType) {
            return newComponentJson(this.componentList.find(c => c.type === type)!);
        },
        // 设置选中的拖动组件
        setDragComponent(payload: { component: IDesignerComponent }) {
            this.dragComponent = payload.component;
        },
        // 设置当前选中的组件
        setSelectedComponent(payload: { component: IDesignerComponent | undefined }) {
            this.selectedComponent = payload.component;
        },
        // 保存页面json数据
        async savePage(payload: { appId: string; projectId: string; app: any }) {
            return apps.appService.updateApp(payload.appId, payload.projectId, payload.app);
        },
        // 保存form数据结构
        async saveForm(payload: { form: any }) {
            return forms.formService.addForm(payload.form);
        },
        async save(payload: { appId: string; projectId: string; app: any; form: any }) {
            return new Promise((ok, fail) => {
                Promise.all([
                    this.savePage({
                        appId: payload.appId,
                        projectId: payload.projectId,
                        app: payload.app,
                    }),
                    this.saveForm({ form: payload.form }),
                ])
                    .then(resAll => {
                        if (resAll.length === 2 && resAll[0].success && resAll[1].success) {
                            ok('');
                        } else {
                            fail('save fail');
                        }
                    })
                    .catch(() => {
                        fail('save fail');
                    });
            });
        },
    },
});

// 创建一个新的空组件
export const newComponentJson = (originData: IDesignerComponent): IComponentState => {
    const newId = utils.$getUUID(originData.type);
    // eslint-disable-next-line
    const { icons, label, order, showInList, listGroup, sfc, eventConfigs, propsConfigs, cssConfigs, getDefaultCss, getDefaultProps, ...newProps } = originData;
    const newComponent = {
        ...newProps,
        key: newId,
        name: newId,
    } as IComponentState;
    if (originData.type === EnumComponentType.page) {
        (newComponent as IPageState).label = '页面';
        newComponent.list = [];
    }
    // 容器组件，添加list
    if (originData.box) {
        newComponent.list = [];
    }
    // 如果添加的组件是form组件，追加formInfo属性
    if (originData.isForm) {
        newComponent.formInfo = {
            formFieldName: newId,
            rules: [],
        };
    }
    // 设置默认属性
    if (getDefaultProps && typeof getDefaultProps === 'function') {
        newComponent.props = getDefaultProps();
    }
    // 设置默认样式
    if (getDefaultCss && typeof getDefaultCss === 'function') {
        newComponent.css = getDefaultCss();
    }
    return newComponent;
};

// 生成一个默认的page配置
const getDefaultPageModule = (
    pages: IPageState[],
    componentList: IDesignerComponent[]
): IPageState => {
    $log('%c %s', 'color:red', 'editor componentList', componentList);
    const _newPage = newComponentJson(componentList.find(c => c.type === EnumComponentType.page)!);
    const newPage = Object.assign({}, _newPage);
    return newPage as IPageState;
};
