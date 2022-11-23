import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { RouterConfig } from 'tdp-editor-utils/constants/router';
import TdpAppIndexVue from '../pages/TdpAppIndex.vue';
import TdpPage404Vue from '../pages/TdpPage404.vue';

declare module 'vue-router' {
    interface RouteMeta {
        className: string;
        label?: string;
        title?: string;
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        ...RouterConfig.Index,
        ...{ component: TdpAppIndexVue },
    },
    {
        ...RouterConfig.AppIndex,
        ...{ component: TdpAppIndexVue },
    },
    {
        ...RouterConfig.AppPage,
        ...{
            component: () => import(/* webpackChunkName: "tdp_app_page" */ '../pages/TdpPage.vue'),
        },
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: TdpPage404Vue },
];

const _createRouter = () => {
    console.log('env.BASE_URL', import.meta.env.BASE_URL);
    const router = createRouter({
        history: createWebHistory(import.meta.env.BASE_URL),
        routes,
    });

    router.beforeEach((to, from, next) => {
        const className: string = (to.meta?.className as string) || '';
        if (className) {
            const html = document.querySelector('html');
            const body = document.querySelector('body');
            if (html) {
                html.setAttribute('class', className);
            }
            if (body) {
                body.setAttribute('class', className);
            }
        }
        next();
    });
    return router;
};

export default _createRouter;