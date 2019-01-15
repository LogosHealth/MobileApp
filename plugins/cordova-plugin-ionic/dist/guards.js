"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPluginConfig(o) {
    const obj = o;
    const allowedKeys = ['appId', 'channel', 'debug', 'host'];
    if (!obj)
        return false;
    for (const key in obj) {
        if (!allowedKeys.includes(key))
            return false;
    }
    return obj &&
        (obj.appId === undefined || typeof obj.appId === 'string') &&
        (obj.channel === undefined || typeof obj.channel === 'string') &&
        (obj.debug === undefined || typeof obj.debug === 'string') &&
        (obj.host === undefined || typeof obj.host === 'string');
}
exports.isPluginConfig = isPluginConfig;
