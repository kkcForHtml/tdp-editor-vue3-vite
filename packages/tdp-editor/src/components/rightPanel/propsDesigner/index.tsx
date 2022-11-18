import { defineComponent, inject } from 'vue';
import type { VNode, PropType } from 'vue';
import { mapState } from 'pinia';
import { useEditorStore } from '../../../stores/editorStore';
import './index.less';
import DesignerCssPanel from './cssDesigner';
import DesignerFormPanel from './formDesigner';
import type {
    IDesignerComponent,
    IPropsConfig,
    IPropsSelectorObj,
} from 'tdp-editor-types/interface/designer';
import selector from '../../../selectors/index';
import { propsFactory } from 'tdp-editor-utils';
import pm from '../paramsModal.vue';
import { EnumPropsValueType } from 'tdp-editor-types/enum/components';
import type { EnumSelectorName } from 'tdp-editor-types/enum/designer';
import { DownOutlined } from '@ant-design/icons-vue';

export default defineComponent({
    name: 'designer-props-panel',
    components: {
        DesignerCssPanel,
        pm,
        DownOutlined,
    },
    props: {
        element: {
            required: false,
            type: Object as PropType<IDesignerComponent>,
        },
    },
    setup() {
        const unselectComponent = inject('unselectComponent');
        return {
            unselectComponent,
        };
    },
    computed: {
        ...mapState(useEditorStore, {
            componentList: 'componentList',
        }),
        // 组件ID
        componentId(): string {
            return this.element && this.element.key ? this.element.key : '';
        },
        // 组件类型
        componentType(): string {
            if (this.element) {
                return `${this.element.type}(${this.element.label})`;
            } else return '';
        },
    },
    data() {
        return {
            showPM: false,
            pmPropKey: '',
            pmPropValueType: EnumPropsValueType.expression,
        };
    },
    methods: {
        showParamsModal(propKey: string, propValueType: EnumPropsValueType) {
            this.pmPropKey = propKey;
            this.pmPropValueType = propValueType;
            this.showPM = true;
        },
        copyComponentId() {
            if (this.$clipboard && this.element) {
                this.$clipboard(this.element.key);
            }
        },
        // 删除所选组件
        deleteComponent() {
            if (this.element) {
                document.getElementById('designer-main-action-box')!.style.display = 'none';
                useEditorStore().deleteComponent({ id: this.element.key });
            }
        },
        // 渲染属性选择器
        renderPropsSelector(props: IPropsConfig<{ k: any }>): VNode | undefined | VNode[] {
            const other = {
                showParamsModal: this.showParamsModal,
            };
            // 如果是选择器数组
            if (props.selector instanceof Array) {
                return (
                    <div class="multipleSelectors">
                        <div class="selector">
                            {this.renderPropsSelector({
                                ...props,
                                selector: (props.selector as any)[0],
                            })}
                        </div>
                        <div class="check-btn">
                            <a-popover placement="leftTop">
                                {/*// @ts-ignore */}
                                <div slot="content">
                                    {props.selector.slice(1).map(s => {
                                        return <p>{s.toString()}</p>;
                                    })}
                                </div>
                                <a href="javascript: void(0)">切换</a>
                            </a-popover>
                        </div>
                    </div>
                );
            }
            // 直接指定的selector的name
            else if (typeof props.selector === 'string') {
                const selectorName = props.selector as EnumSelectorName;
                const _selector = (selector as any)[selectorName];
                return _selector ? _selector(this.element!, props, other) : undefined;
            }
            // 指定的selector对象，包含options
            else if (typeof props.selector === 'object' && 'name' in props.selector) {
                const selectorObj = props.selector as IPropsSelectorObj;
                const _selector = (selector as any)[selectorObj.name];
                const _selectorOptions = selectorObj.options || {};
                return _selector(this.element!, props, { ..._selectorOptions, ...other });
            }
            // 开发者自定义选择器函数
            else if (typeof props.selector === 'function') {
                return props.selector(this.element!, propsFactory);
            } else {
                return undefined;
            }
        },
        // 渲染属性列表
        renderProps(): VNode[] {
            if (this.element) {
                const componentList = this.componentList as IDesignerComponent[];
                const comp = componentList.find(c => c.type === this.element!.type);
                if (comp && comp.propsConfigs) {
                    return comp.propsConfigs.map(props => {
                        return (
                            <div class="item" data-props={props.key}>
                                <div class="label">{props.label}</div>
                                <div class="value">{this.renderPropsSelector(props)}</div>
                            </div>
                        );
                    });
                }
                return [];
            } else {
                return [];
            }
        },
        renderPropsPanel() {
            return <div class="section section-panel">{this.renderProps()}</div>;
        },
    },
    render() {
        return (
            <div class="designer-props-panel">
                <div class="section">
                    <div class="item">
                        <div class="label">组件id</div>
                        <div class="value">
                            <a-dropdown
                                v-slots={{
                                    voerlay: () => (
                                        <a-menu slot="overlay">
                                            <a-menu-item>
                                                <a-button
                                                    onClick={this.copyComponentId}
                                                    type="link"
                                                    icon="copy"
                                                >
                                                    copy ID
                                                </a-button>
                                            </a-menu-item>
                                            <a-menu-item>
                                                <a-button
                                                    onClick={this.deleteComponent}
                                                    type="link"
                                                    icon="delete"
                                                >
                                                    删除
                                                </a-button>
                                            </a-menu-item>
                                            <a-menu-item>
                                                <a-button
                                                    onClick={this.unselectComponent}
                                                    type="link"
                                                    icon="undo"
                                                >
                                                    取消选中
                                                </a-button>
                                            </a-menu-item>
                                        </a-menu>
                                    ),
                                }}
                            >
                                <a
                                    class="ant-dropdown-link"
                                    onClick={(e: any) => e.preventDefault()}
                                >
                                    {this.componentId}
                                    <down-outlined />
                                </a>
                            </a-dropdown>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">组件类型</div>
                        <div class="value">{this.componentType}</div>
                    </div>
                </div>
                <a-collapse expandIconPosition="right" defaultActiveKey={['props', 'form', 'css']}>
                    <a-collapse-panel key="props" header="属性">
                        <pm
                            visible={this.showPM}
                            element={this.element}
                            forceRender={true}
                            onParamCheck={(info: any) => {
                                propsFactory.setPropsValue(
                                    this.element!,
                                    this.pmPropKey,
                                    `this.pageData.${info.name}`,
                                    this.pmPropValueType
                                );
                            }}
                            onVisibleChanged={(v: boolean) => {
                                this.showPM = v;
                            }}
                        />
                        {this.renderPropsPanel()}
                    </a-collapse-panel>
                    <a-collapse-panel key="form" header="表单">
                        {/*// @ts-ignore */}
                        <DesignerFormPanel element={this.element} />
                    </a-collapse-panel>
                    <a-collapse-panel key="css" header="外观">
                        {/*// @ts-ignore */}
                        <DesignerCssPanel element={this.element} />
                    </a-collapse-panel>
                </a-collapse>
            </div>
        );
    },
});
