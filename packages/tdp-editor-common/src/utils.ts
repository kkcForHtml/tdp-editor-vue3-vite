import { isReactive, isRef } from 'vue';
import { EnumAppEnv } from 'tdp-editor-types/src/enum';

/* eslint-disable prettier/prettier */
export const $getUUID = (prefix?: string, length = 16): string => {
    let result = $randomWord(false, length);
    if (prefix) {
        result = `${prefix}_${result}`;
    }
    return result;
};

const APP_ENV = import.meta.env.VITE_APP_ENV;
// eslint-disable-next-line no-console
export const $log = APP_ENV === EnumAppEnv.production ? () => {} : console.log;
// eslint-disable-next-line no-console
export const $warn = APP_ENV === EnumAppEnv.production ? () => {} : console.warn;
// eslint-disable-next-line no-console
export const $error = APP_ENV === EnumAppEnv.production ? () => {} : console.error;

/**
 * 生成随机字符串
 * @param randomFlag 是否随机长度 
 * @param min 最小长度
 * @param max 最大长度
 * @returns 
 */
export const $randomWord = (randomFlag: boolean, min: number, max = 50) => {
    let str = "",
        range = min;
    const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(let i = 0; i < range; i++){
        const pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}

export const $deleteTreeItem = (array: any[], key: string, childName = 'list') => {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (element.key === key) {
            array.splice(i, 1);
            break;
        } else if (element[childName] && element[childName].length) {
            $deleteTreeItem(element[childName], key, childName);
        }
    }
};

/**
 * 按照key查找元素
 * @param array 
 * @param key 
 * @param childName 
 * @returns 
 */
export const $findTreeItem = (array: any[], key: string, childName = 'list'): any => {
    let result: any[] = [];
    if (array && array.length) {
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (item.key === key) {
                result.push(item);
                break;
            } else if (item[childName] && item[childName] instanceof Array && item[childName].length > 0) {
                result = result.concat($findTreeItem(item[childName], key, childName));
            }
        }
    } 
    return result;
};

/**
 * 把数结构转成一维数组
 * @param tree 
 * @param childName 
 * @returns 
 */
export const $treeToArray = (tree: any, childName = 'list') => {
    const result: any[] = [];
    const loop = (children: any[]) => {
        for (let i = 0; i < children.length; i++) {
            result.push(children[i]);
            if (children[i][childName] && children[i][childName].length) {
                loop(children[i][childName]);
            }
        }
    };
    loop(tree[childName]);
    return result;
};

/**
 * 创建节流函数
 * @param fn 要执行的函数
 * @param delay 延迟毫秒数
 * @returns 返回节流函数
 */
export const $getDelayFunction = (fn: Function, delay: number): Function => {
    let delayTimeout: any = undefined;
    // @ts-ignore
    return (...args) => {
        window.clearTimeout(delayTimeout);
        delayTimeout = window.setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export const $createPageFunction = (functionString: string) => {
    // Split the string into individual function strings
    const functionStrings = functionString.split(/\bfunction\b/).slice(1);

    // Map each function string to a function object
    const functions = functionStrings.map((str) => {
    // Add the "function" keyword back to the string
        str = "function" + str;
        // Create the function object using the Function constructor
        return new Function(`return ${str}`)();
    });

    return functions as Function[];
};

type TPageScriptSet = {
    vars: {varKey: string; varValue: any}[];
    responsiveVars: {varKey: string; varValue: any}[];
    functions: Function[];
};

/**
 * 初始化页面脚本
 * @param script 脚本字符串
 * @returns 返回分解出的函数集合、响应式变量集合
 */
export const $iniPageScript = (script: string): TPageScriptSet => {
    const result: TPageScriptSet = {
        vars: [],
        functions: [],
        responsiveVars: [],
    };
    try {
        const pageFunc = new Function(script);
        const pageScript = pageFunc();
        for (const key in pageScript) {
            if (Object.prototype.hasOwnProperty.call(pageScript, key)) {
                const element = pageScript[key];
                if (typeof element === 'function') {
                    result.functions.push(element);
                } else if (isReactive(element) || isRef(element)) {
                    result.responsiveVars.push({
                        varKey: key,
                        varValue: element,
                    });
                }
            }
        }
    } catch (e) {
        $warn('$createPageFunction error:', e);
    }
    return result;
}

// 动态插入style标签样式
export const $createDynamicStyle = (
    key: string,
    styles: string
) => {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return false;

    const styleKey = 'style_' + key;
    let style = document.getElementById(styleKey);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('id', styleKey);
        head.appendChild(style);
    }
    style.innerHTML = styles;
};

export const $createDynamicClass = (
    key: string,
    classNameList: string[],
    cssBodyList: any[]
) => {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return false;

    const styleKey = 'style_' + key;
    let style = document.getElementById(styleKey);
    if (!style) {
        style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.setAttribute('id', styleKey);
        head.appendChild(style);
    }
    let cssText = '';
    classNameList.forEach((c, i) => {
        cssText += c + '' + $object2cssText(cssBodyList[i]) + '\r';
    });
    style.innerText = cssText;
};

export const $object2cssText = (object: Record<string, string>) => {
    const body = document.body;
    const puppetElementId = 'tdp___puppetElement';
    let puppetElement = document.getElementById(puppetElementId);
    if (!puppetElement) {
        puppetElement = document.createElement('div');
        puppetElement.setAttribute('id', puppetElementId);
        puppetElement.setAttribute('style', 'display: none; width: 0; height: 0;');
        body.appendChild(puppetElement);
    }
    let result = '{';
    const regx = /[A-Z]/;
    for (const k in object) {
        if (Object.prototype.hasOwnProperty.call(puppetElement.style, k) && object[k]) {
            result += `${k.replace(regx, word => '-' + word.toLocaleLowerCase())}: ${object[k]};`;
        }
    }
    result += '}';
    return result;
};

/**
 * 获取url中的参数值
 * @param key
 */
export const $getQueryString = (key: string): string => {
    const href = window.location.href;
    const index = href.lastIndexOf("?");
    if (index > 0) {
        const search = href.substring(index, href.length);
        return $getQueryByString(search, key);
    }
    return "";
};

/**
 * 获取指定字符串中的value值
 * @param searchStr
 * @param key
 */
export const $getQueryByString = (searchStr: string, key: string) => {
    const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    const r = searchStr.substring(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return "";
};
