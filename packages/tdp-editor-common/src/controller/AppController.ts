import type { App } from 'vue';
import type { Pinia } from 'pinia';
import type { EnumAppEnv, EnumAppMode } from 'tdp-editor-types/src/enum';
import type { IAppStore } from 'tdp-editor-types/src/interface/store';

import { useAppStore } from '../stores/appStore';
export default class AppController {
    private readonly $app: App;
    private readonly $pinia: Pinia;
    constructor(app: App, pinia: Pinia) {
        this.$app = app;
        this.$pinia = pinia;
    }
    initApp(appJson: IAppStore) {
        const appStore = useAppStore(this.$pinia);
        appStore.pages = appJson.pages;
        appStore.activePage = appJson.activePage || appJson.pages[0];
    }
    getActivePage() {
        const appStore = useAppStore(this.$pinia);
        const activePage = appStore.activePage;
        if (activePage) {
            return activePage;
        } else if (appStore.pages.length) {
            appStore.activePage = appStore.pages[0];
            return appStore.activePage;
        } else {
            return undefined;
        }
    }
    /**
     * 获取app当前的运行环境
     */
    getEnv() {
        return import.meta.env.VITE_APP_ENV as EnumAppEnv;
    }
    replacePage(pageId: string) {
        const appStore = useAppStore(this.$pinia);
        appStore.setActivePage({ pageId });
    }
    setMode(mode: EnumAppMode) {
        const appStore = useAppStore(this.$pinia);
        appStore.mode = mode;
    }
}