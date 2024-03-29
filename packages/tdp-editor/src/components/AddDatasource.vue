<template>
    <a-form class="add-datasource-form" :model="formState">
        <a-form-item label="名称">
            <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="作用域">
            <a-radio-group v-model:value="formState.scope" :disabled="action !== 'add'">
                <a-radio value="page">页面级</a-radio>
                <a-radio value="app">应用级</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="类型">
            <a-radio-group v-model:value="formState.sourceType">
                <a-radio value="url">URL</a-radio>
                <a-radio value="apiRepo">ApiRepo</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="启用">
            <a-switch v-model:checked="formState.enable" />
        </a-form-item>
        <a-form-item label="描述信息">
            <a-input v-model:value="formState.desc" type="textarea" />
        </a-form-item>

        <a-form-item label="url" class="item-2row">
            <a-input v-model:value="urlDatasourceInput.url" />
            <a-button type="primary">测试</a-button>
        </a-form-item>
        <a-form-item label="方法">
            <a-select v-model:value="urlDatasourceInput.method">
                <a-select-option value="get">GET</a-select-option>
                <a-select-option value="post">POST</a-select-option>
                <a-select-option value="put">PUT</a-select-option>
                <a-select-option value="delete">DELETE</a-select-option>
            </a-select>
        </a-form-item>

        <a-form-item label="适用组件">
            <a-select v-model:value="datasourceOutput.compType">
                <a-select-option value="basic">通用</a-select-option>
                <a-select-option :value="EnumComponentType.button">按钮</a-select-option>
                <a-select-option :value="EnumComponentType.rate">评分</a-select-option>
            </a-select>
        </a-form-item>
        <div class="ant-row ant-form-item">
            <div class="ant-col ant-form-item-label">
                <label>字段配置</label>
            </div>
            <div class="ant-col ant-form-item-control" style="text-align: center">
                <div class="field-mapping">
                    <div class="ds-field">
                        <h3>输出字段</h3>
                        <ul>
                            <li v-for="(item, index) in fieldMapping" :key="index + 'key'">
                                <a-input v-model:value="item.dsField"></a-input>
                            </li>
                        </ul>
                    </div>
                    <div class="resource-field">
                        <h3>原始字段</h3>
                        <ul>
                            <li v-for="(item, index) in fieldMapping" :key="index + 'key'">
                                <a-input v-model:value="item.resField"></a-input>
                            </li>
                        </ul>
                    </div>
                    <div class="action-field">
                        <h3>操作</h3>
                        <ul>
                            <li v-for="(item, index) in fieldMapping" :key="index + 'key'">
                                <a-button
                                    type="primary"
                                    shape="circle"
                                    @click="onRemoveFieldMappingClick(index)"
                                >
                                    -
                                </a-button>
                            </li>
                        </ul>
                    </div>
                </div>
                <a-button class="btn-add-field" type="primary" @click="onAddFieldMappingClick">
                    添加字段
                </a-button>
            </div>
        </div>
        <div style="text-align: center">
            <a-button type="primary" @click="onSubmit">
                {{ action === 'add' ? '创建' : '确定' }}
            </a-button>
            <a-button style="margin-left: 10px" @click="onReset">重置</a-button>
        </div>
    </a-form>
</template>
<style lang="less" scoped>
.add-datasource-form {
    width: 100%;
    height: 100%;
    padding-top: 20px;
    :deep(.ant-row .ant-form-item-label) {
        width: 150px;
    }

    .item-2row {
        :deep(.ant-form-item-control-input-content) {
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
            align-items: center;
            .ant-btn {
                margin-left: 10px;
            }
        }
    }
    .field-mapping {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        text-align: center;

        ul {
            margin: 0;
            padding: 0;
        }
        li {
            list-style: none;
            margin-top: 10px;
            margin-right: 10px;
        }
        .ds-field,
        .resource-field {
            flex: 1;
        }
        .action-field {
            width: 120px;
            button + button {
                margin-left: 5px;
            }
        }
        :deep(.ant-btn) {
            flex: 0 0 auto;
        }
    }
    .btn-add-field {
        margin-top: 10px;
        width: 100px;
        align-self: center;
    }
}
</style>
<script setup lang="ts">
import { $getUUID } from 'tdp-editor-common/src/utils';
import { EnumComponentType } from 'tdp-editor-types/src/enum/components';
import type {
    TDatasourceScope,
    TSourceType,
    IDataSourceInputUrl,
    IDataSourceOutput,
    IDataSource,
} from 'tdp-editor-types/src/interface/app/datasource';
import { reactive, toRaw, shallowReactive, watch, onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
    action: 'add' | 'edit' | 'view';
    editData?: IDataSource;
}>();

const emits = defineEmits<{
    (e: 'create', datasource: IDataSource): void;
    (e: 'cancel'): void;
}>();

const formState = reactive({
    name: '',
    scope: 'page' as TDatasourceScope,
    enable: true,
    sourceType: 'url' as TSourceType,
    desc: '',
});

const urlDatasourceInput = reactive<IDataSourceInputUrl>({
    url: '',
    method: 'get',
    payload: [],
    queryString: [],
});
const datasourceOutput = shallowReactive<IDataSourceOutput>({
    compType: 'basic',
    fieldMapping: [],
});
const fieldMapping = ref<{ dsField: string; resField: string }[]>([]);

const resetForm = () => {
    formState.name = '';
    formState.desc = '';
    formState.scope = 'page';
    formState.enable = true;
    formState.sourceType = 'url';

    urlDatasourceInput.url = '';
    urlDatasourceInput.method = 'get';
    urlDatasourceInput.payload = undefined;
    urlDatasourceInput.queryString = undefined;

    datasourceOutput.compType = 'basic';
    datasourceOutput.fieldMapping = [];
    fieldMapping.value = [];
};

// 添加字段按钮单击事件
const onAddFieldMappingClick = () => {
    fieldMapping.value.push({
        dsField: 'newFiled' + Date.now(),
        resField: 'res',
    });
};
// 添加字段按钮单击事件
const onRemoveFieldMappingClick = (index: number) => {
    fieldMapping.value.splice(index, 1);
};

// 点击创建事件
const onSubmit = () => {
    const dataSource: IDataSource = {
        key: props.action === 'add' ? $getUUID('ds', 10) : props.editData?.key || '',
        enable: formState.enable,
        name: formState.name,
        scope: formState.scope,
        sourceType: formState.sourceType,
        desc: formState.desc,
        input: {
            config: { ...urlDatasourceInput },
        },
        output: {
            compType: datasourceOutput.compType,
            fieldMapping: toRaw(fieldMapping.value),
        },
    };
    if (props.action === 'edit' && dataSource.scope === 'page' && props.editData) {
        dataSource.pageKey = props.editData.pageKey;
    }
    emits('create', dataSource);
};

// 点击取消按钮
const onReset = () => {
    resetForm();
};

const watch_editData_stop = watch(
    () => props.editData,
    (ds, oldDS) => {
        if (!ds) {
            resetForm();
        } else if (ds && (!oldDS || ds.key !== oldDS.key)) {
            formState.name = ds.name;
            formState.desc = ds.desc || '';
            formState.enable = ds.enable;
            formState.sourceType = ds.sourceType;
            if (ds.sourceType === 'url') {
                const config: IDataSourceInputUrl = ds.input.config;
                urlDatasourceInput.url = config.url;
                urlDatasourceInput.method = config.method;
                urlDatasourceInput.payload = config.payload;
                urlDatasourceInput.queryString = config.queryString;
            }
            datasourceOutput.compType = ds.output.compType;
            datasourceOutput.fieldMapping = ds.output.fieldMapping;
            fieldMapping.value = ds.output.fieldMapping;
        }
    },
    {
        immediate: true,
    }
);
onBeforeUnmount(() => {
    // 清除watch
    watch_editData_stop();
});
</script>
