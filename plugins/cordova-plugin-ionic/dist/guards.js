"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPluginConfig(o) {
    const obj = o;
    return obj &&
        (obj.appId === undefined || typeof obj.appId === 'string') &&
        (obj.channel === undefined || typeof obj.channel === 'string') &&
        (obj.debug === undefined || typeof obj.debug === 'string') &&
        (obj.host === undefined || typeof obj.host === 'string');
}
exports.isPluginConfig = isPluginConfig;
