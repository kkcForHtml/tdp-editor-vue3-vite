<template>
    <div
        :class="{
            'tdp-editor-runtime-wrapper': true,
        }"
    >
        <RuntimePage v-if="pageJson" :state="pageJson" :appMode="EnumAppMode.runtime"></RuntimePage>
    </div>
</template>
<style lang="less">
@blueColor: #1890ff;
</style>
<script lang="ts" setup>
import { onMounted, computed, watch, toRaw } from 'vue';
// import { useRouter } from 'vue-router';
import { EnumAppMode } from 'tdp-editor-types/src/enum';
import RuntimePage from 'tdp-editor-components/src/components/page';
import { useAppControler } from 'tdp-editor-common/src/controller';
import { $log } from 'tdp-editor-common/src/utils';
const props = defineProps<{
    pageId: string; // 路由传过来的pageId
}>();
// const router = useRouter();
const appController = useAppControler();
appController.changePage(props.pageId, '');

onMounted(() => {
    $log(`tdp-app-page ${props.pageId} onMounted`);
});
watch(
    () => props.pageId,
    (newPageId, oldPageId) => {
        if (newPageId !== oldPageId) {
            $log('应该要切换页面数据了', oldPageId, newPageId);
            // 1.检查有没有页面缓存数据，有的话直接切换到缓存数据
            // 2.没有的话，发送接口，请求当前页面得数据，并缓存
            appController.changePage(newPageId, oldPageId);
        }
    }
);
// 监听当前页面数据切换
const pageJson = computed(() => {
    const activePage = appController.getActivePage();
    return toRaw(activePage);
});
</script>
