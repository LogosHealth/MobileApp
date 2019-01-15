"use strict";
/// <reference path="../types/IonicCordova.d.ts" />
/// <reference types="cordova-plugin-file" />
/// <reference types="cordova" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var UpdateMethod;
(function (UpdateMethod) {
    UpdateMethod["BACKGROUND"] = "background";
    UpdateMethod["AUTO"] = "auto";
    UpdateMethod["NONE"] = "none";
})(UpdateMethod || (UpdateMethod = {}));
var UpdateState;
(function (UpdateState) {
    UpdateState["Available"] = "available";
    UpdateState["Pending"] = "pending";
    UpdateState["Ready"] = "ready";
})(UpdateState || (UpdateState = {}));
const guards_1 = require("./guards");
class Path {
    join(...paths) {
        let fullPath = paths.shift() || '';
        for (const path of paths) {
            if (fullPath && fullPath.slice(-1) !== '/') {
                fullPath += '/';
            }
            fullPath = path.slice(0, 1) !== '/' ? fullPath + path : fullPath + path.slice(1);
        }
        return fullPath;
    }
}
const path = new Path();
/**
 * LIVE UPDATE API
 *
 * The plugin API for the live updates feature.
 */
class IonicDeployImpl {
    constructor(appInfo, preferences) {
        this._fileManager = new FileManager();
        this.FILE_CACHE = 'ionic_snapshot_files';
        this.MANIFEST_CACHE = 'ionic_manifests';
        this.SNAPSHOT_CACHE = 'ionic_built_snapshots';
        // TODO: It would be nice to have this update automagically when we do a version bump
        this.PLUGIN_VERSION = '4.2.0';
        this.appInfo = appInfo;
        this._savedPreferences = preferences;
    }
    _handleInitialPreferenceState() {
        return __awaiter(this, void 0, void 0, function* () {
            const updateMethod = this._savedPreferences.updateMethod;
            switch (updateMethod) {
                case UpdateMethod.AUTO:
                    // NOTE: call sync with background as override to avoid sync
                    // reloading the app and manually reload always once sync has
                    // set the correct currentVersionId
                    console.log('calling _sync');
                    yield this.sync({ updateMethod: UpdateMethod.BACKGROUND });
                    console.log('calling _reload');
                    yield this.reloadApp();
                    console.log('done _reloading');
                    break;
                case UpdateMethod.NONE:
                    this.hideSplash();
                    break;
                default:
                    // NOTE: default anything that doesn't explicitly match to background updates
                    yield this.reloadApp();
                    this.sync({ updateMethod: UpdateMethod.BACKGROUND });
                    return;
            }
        });
    }
    getFileCacheDir() {
        return path.join(cordova.file.cacheDirectory, this.FILE_CACHE);
    }
    getManifestCacheDir() {
        return path.join(cordova.file.dataDirectory, this.MANIFEST_CACHE);
    }
    getSnapshotCacheDir(versionId) {
        return path.join(cordova.file.dataDirectory, this.SNAPSHOT_CACHE, versionId);
    }
    _syncPrefs(prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            const appInfo = this.appInfo;
            const currentPrefs = this._savedPreferences;
            if (currentPrefs) {
                currentPrefs.binaryVersion = appInfo.bundleVersion;
                Object.assign(currentPrefs, prefs);
            }
            return this._savePrefs(currentPrefs);
        });
    }
    _savePrefs(prefs) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    cordova.exec((savedPrefs) => __awaiter(this, void 0, void 0, function* () {
                        resolve(savedPrefs);
                    }), reject, 'IonicCordovaCommon', 'setPreferences', [prefs]);
                }
                catch (e) {
                    reject(e.message);
                }
            }));
        });
    }
    configure(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!guards_1.isPluginConfig(config)) {
                throw new Error('Invalid Config Object');
            }
            Object.assign(this._savedPreferences, config);
            yield this._syncPrefs(this._savedPreferences);
        });
    }
    checkForUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            const appInfo = this.appInfo;
            const endpoint = `${prefs.host}/apps/${prefs.appId}/channels/check-device`;
            // TODO: Need to send UUID device details for unique device metrics
            const device_details = {
                binary_version: appInfo.bundleVersion,
                device_id: appInfo.device,
                platform: appInfo.platform,
                platform_version: appInfo.platformVersion,
                snapshot: prefs.currentVersionId
            };
            const body = {
                channel_name: prefs.channel,
                app_id: prefs.appId,
                device: device_details,
                plugin_version: this.PLUGIN_VERSION,
                manifest: true
            };
            const resp = yield fetch(endpoint, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(body)
            });
            let jsonResp;
            if (resp.status < 500) {
                jsonResp = yield resp.json();
            }
            if (resp.ok) {
                const checkDeviceResp = jsonResp.data;
                if (checkDeviceResp.available && checkDeviceResp.url && checkDeviceResp.snapshot) {
                    prefs.availableUpdate = {
                        binaryVersion: appInfo.bundleVersion,
                        channel: prefs.channel,
                        state: UpdateState.Available,
                        lastUsed: new Date().toISOString(),
                        path: this.getSnapshotCacheDir(checkDeviceResp.snapshot),
                        url: checkDeviceResp.url,
                        versionId: checkDeviceResp.snapshot
                    };
                    yield this._savePrefs(prefs);
                }
                return checkDeviceResp;
            }
            throw new Error(`Error Status ${resp.status}: ${jsonResp ? jsonResp.error.message : yield resp.text()}`);
        });
    }
    downloadUpdate(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Available) {
                const { manifestBlob, fileBaseUrl } = yield this._fetchManifest(prefs.availableUpdate.url);
                const manifestString = yield this._fileManager.getFile(this.getManifestCacheDir(), this._getManifestName(prefs.availableUpdate.versionId), true, manifestBlob);
                const manifestJson = JSON.parse(manifestString);
                yield this._downloadFilesFromManifest(fileBaseUrl, manifestJson, progress);
                prefs.availableUpdate.state = UpdateState.Pending;
                yield this._savePrefs(prefs);
                return true;
            }
            return false;
        });
    }
    _getManifestName(versionId) {
        return versionId + '-manifest.json';
    }
    _downloadFilesFromManifest(baseUrl, manifest, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Downloading update...');
            let size = 0, downloaded = 0;
            manifest.forEach(i => {
                size += i.size;
            });
            const downloads = yield Promise.all(manifest.map((file) => __awaiter(this, void 0, void 0, function* () {
                const alreadyExists = yield this._fileManager.fileExists(this.getFileCacheDir(), this._cleanHash(file.integrity));
                if (alreadyExists) {
                    console.log(`file ${file.href} with size ${file.size} already exists`);
                    // Update progress
                    downloaded += file.size;
                    if (progress) {
                        progress(Math.floor((downloaded / size) * 50).toString());
                    }
                    return;
                }
                // if it's 0 size file just create it
                if (file.size === 0) {
                    // Update progress
                    downloaded += file.size;
                    if (progress) {
                        progress(Math.floor((downloaded / size) * 50).toString());
                    }
                    return {
                        hash: this._cleanHash(file.integrity),
                        blob: new Blob()
                    };
                }
                // otherwise get it from internets
                const base = new URL(baseUrl);
                const newUrl = new URL(file.href, baseUrl);
                newUrl.search = base.search;
                return fetch(newUrl.toString(), {
                    method: 'GET',
                    integrity: file.integrity,
                }).then((resp) => __awaiter(this, void 0, void 0, function* () {
                    // Update progress
                    downloaded += file.size;
                    if (progress) {
                        progress(Math.floor((downloaded / size) * 50).toString());
                    }
                    return {
                        hash: this._cleanHash(file.integrity),
                        blob: yield resp.blob()
                    };
                }));
            })));
            const now = new Date();
            downloaded = 0;
            for (const download of downloads) {
                if (download) {
                    yield this._fileManager.getFile(this.getFileCacheDir(), download.hash, true, download.blob);
                    // Update progress
                    downloaded += download.blob.size;
                    if (progress) {
                        progress(Math.floor(((downloaded / size) * 50) + 50).toString());
                    }
                }
            }
            console.log(`Wrote files in ${(new Date().getTime() - now.getTime()) / 1000} seconds.`);
        });
    }
    _cleanHash(metadata) {
        const hashes = metadata.split(' ');
        return hashes[0].replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    _fetchManifest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(url, {
                method: 'GET',
                redirect: 'follow',
            });
            return {
                manifestBlob: yield resp.blob(),
                fileBaseUrl: resp.url
            };
        });
    }
    extractUpdate(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            if (!prefs.availableUpdate || prefs.availableUpdate.state !== 'pending') {
                return false;
            }
            const versionId = prefs.availableUpdate.versionId;
            const manifest = yield this.readManifest(versionId);
            let size = 0, extracted = 0;
            manifest.forEach(i => {
                size += i.size;
            });
            const snapshotDir = this.getSnapshotCacheDir(versionId);
            try {
                const dirEntry = yield this._fileManager.getDirectory(snapshotDir, false);
                console.log(`directory found for snapshot ${versionId} deleting`);
                yield (new Promise((resolve, reject) => dirEntry.removeRecursively(resolve, reject)));
            }
            catch (e) {
                console.log('No directory found for snapshot no need to delete');
            }
            yield this._copyBaseAppDir(versionId);
            console.log('Successful Swizzle');
            yield Promise.all(manifest.map((file) => __awaiter(this, void 0, void 0, function* () {
                const splitPath = file.href.split('/');
                const fileName = splitPath.pop();
                let path;
                if (splitPath.length > 0) {
                    path = splitPath.join('/');
                }
                path = snapshotDir + (path ? ('/' + path) : '');
                if (fileName) {
                    try {
                        yield this._fileManager.removeFile(path, fileName);
                    }
                    catch (e) {
                        console.log(`New file ${path}/${fileName}`);
                    }
                    // Update progress
                    extracted += file.size;
                    if (progress) {
                        progress(Math.floor((extracted / size) * 100).toString());
                    }
                    return this._fileManager.copyTo(this.getFileCacheDir(), this._cleanHash(file.integrity), path, fileName);
                }
                throw new Error('No file name found');
            })));
            console.log('Successful recreate');
            prefs.availableUpdate.state = UpdateState.Ready;
            prefs.updates[prefs.availableUpdate.versionId] = prefs.availableUpdate;
            yield this._savePrefs(prefs);
            yield this.cleanupVersions();
            return true;
        });
    }
    hideSplash() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                cordova.exec(resolve, reject, 'IonicCordovaCommon', 'clearSplashFlag');
            });
        });
    }
    readManifest(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const manifestString = yield this._fileManager.getFile(this.getManifestCacheDir(), this._getManifestName(versionId));
            return JSON.parse(manifestString);
        });
    }
    reloadApp() {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            if (prefs.availableUpdate && prefs.availableUpdate.state === UpdateState.Ready) {
                prefs.currentVersionId = prefs.availableUpdate.versionId;
                delete prefs.availableUpdate;
                yield this._savePrefs(prefs);
            }
            if (prefs.currentVersionId) {
                if (yield this._isRunningVersion(prefs.currentVersionId)) {
                    console.log(`Already running version ${prefs.currentVersionId}`);
                    yield this._savePrefs(prefs);
                    this.hideSplash();
                    return false;
                }
                if (!(prefs.currentVersionId in prefs.updates)) {
                    console.error(`Missing version ${prefs.currentVersionId}`);
                    this.hideSplash();
                    return false;
                }
                const update = prefs.updates[prefs.currentVersionId];
                const newLocation = new URL(update.path);
                Ionic.WebView.setServerBasePath(newLocation.pathname);
                return true;
            }
            this.hideSplash();
            return false;
        });
    }
    _isRunningVersion(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentPath = yield this._getServerBasePath();
            console.log(`fetched current base path as ${currentPath}`);
            return currentPath.includes(versionId);
        });
    }
    _getServerBasePath() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    Ionic.WebView.getServerBasePath(resolve);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    _copyBaseAppDir(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const rootAppDirEntry = yield this._fileManager.getDirectory(`${cordova.file.applicationDirectory}/www`, false);
                    const snapshotCacheDirEntry = yield this._fileManager.getDirectory(this.getSnapshotCacheDir(''), true);
                    console.log(snapshotCacheDirEntry);
                    rootAppDirEntry.copyTo(snapshotCacheDirEntry, versionId, resolve, reject);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionId = this._savedPreferences.currentVersionId;
            if (typeof versionId === 'string') {
                return this.getVersionById(versionId);
            }
            return;
        });
    }
    getVersionById(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const update = this._savedPreferences.updates[versionId];
            if (!update) {
                throw Error(`No update available with versionId ${versionId}`);
            }
            return this._convertToSnapshotInfo(update);
        });
    }
    _convertToSnapshotInfo(update) {
        return {
            deploy_uuid: update.versionId,
            versionId: update.versionId,
            channel: update.channel,
            binary_version: update.binaryVersion,
            binaryVersion: update.binaryVersion
        };
    }
    getAvailableVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.keys(this._savedPreferences.updates).map(k => this._convertToSnapshotInfo(this._savedPreferences.updates[k]));
        });
    }
    deleteVersionById(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            if (prefs.currentVersionId === versionId) {
                throw Error(`Can't delete version with id: ${versionId} as it is the current version.`);
            }
            delete prefs.updates[versionId];
            yield this._savePrefs(prefs);
            // delete snapshot directory
            const snapshotDir = this.getSnapshotCacheDir(versionId);
            const dirEntry = yield this._fileManager.getDirectory(snapshotDir, false);
            console.log(`directory found for snapshot ${versionId} deleting`);
            yield (new Promise((resolve, reject) => dirEntry.removeRecursively(resolve, reject)));
            // delete manifest
            const manifestFile = yield this._fileManager.getFileEntry(this.getManifestCacheDir(), this._getManifestName(versionId));
            yield new Promise((resolve, reject) => manifestFile.remove(resolve, reject));
            // cleanup file cache
            yield this.cleanupCache();
            return true;
        });
    }
    cleanupCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            const hashes = new Set();
            for (const versionId of Object.keys(prefs.updates)) {
                for (const entry of yield this.readManifest(versionId)) {
                    hashes.add(this._cleanHash(entry.integrity));
                }
            }
            const fileDir = this.getFileCacheDir();
            const cacheDirEntry = yield this._fileManager.getDirectory(fileDir, false);
            const reader = cacheDirEntry.createReader();
            const entries = yield new Promise((resolve, reject) => reader.readEntries(resolve, reject));
            for (const entry of entries) {
                if (hashes.has(entry.name) || !entry.isFile) {
                    continue;
                }
                yield new Promise((resolve, reject) => entry.remove(resolve, reject));
            }
        });
    }
    cleanupVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            let updates = [];
            for (const versionId of Object.keys(prefs.updates)) {
                updates.push(prefs.updates[versionId]);
            }
            updates = updates.sort((a, b) => a.lastUsed.localeCompare(b.lastUsed));
            updates = updates.reverse();
            updates = updates.slice(prefs.maxVersions);
            for (const update of updates) {
                yield this.deleteVersionById(update.versionId);
            }
        });
    }
    sync(syncOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefs = this._savedPreferences;
            // TODO: Get API override if present?
            const updateMethod = syncOptions.updateMethod || prefs.updateMethod;
            yield this.checkForUpdate();
            if (prefs.availableUpdate) {
                if (prefs.availableUpdate.state === UpdateState.Available) {
                    yield this.downloadUpdate();
                }
                if (prefs.availableUpdate.state === UpdateState.Pending) {
                    yield this.extractUpdate();
                }
                if (prefs.availableUpdate.state === UpdateState.Ready && updateMethod === UpdateMethod.AUTO) {
                    yield this.reloadApp();
                }
            }
            if (prefs.currentVersionId) {
                return {
                    deploy_uuid: prefs.currentVersionId,
                    versionId: prefs.currentVersionId,
                    channel: prefs.channel,
                    binary_version: prefs.binaryVersion,
                    binaryVersion: prefs.binaryVersion
                };
            }
            return;
        });
    }
}
class FileManager {
    getDirectory(path, createDirectory = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                resolveLocalFileSystemURL(path, entry => entry.isDirectory ? resolve(entry) : reject(), () => __awaiter(this, void 0, void 0, function* () {
                    const components = path.split('/');
                    const child = components.pop();
                    try {
                        const parent = (yield this.getDirectory(components.join('/'), createDirectory));
                        parent.getDirectory(child, { create: createDirectory }, (entry) => __awaiter(this, void 0, void 0, function* () {
                            if (entry.fullPath === path) {
                                resolve(entry);
                            }
                            else {
                                resolve(yield this.getDirectory(path, createDirectory));
                            }
                        }), reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                }));
            });
        });
    }
    resolvePath() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                resolveLocalFileSystemURL(cordova.file.dataDirectory, (rootDirEntry) => {
                    resolve(rootDirEntry);
                }, reject);
            });
        });
    }
    readFile(fileEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fileEntry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.readAsText(file);
                }, reject);
            });
        });
    }
    getFile(path, fileName, createFile = false, dataBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileEntry = yield this.getFileEntry(path, fileName, createFile, dataBlob);
            return this.readFile(fileEntry);
        });
    }
    getFileEntry(path, fileName, createFile = false, dataBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            if (createFile && !dataBlob) {
                throw new Error('Must provide file blob if createFile is true');
            }
            const dirEntry = yield this.getDirectory(path, createFile);
            return new Promise((resolve, reject) => {
                if (createFile && dataBlob) {
                    dirEntry.getFile(fileName + '.tmp.' + Date.now(), { create: true, exclusive: false }, (fileEntry) => __awaiter(this, void 0, void 0, function* () {
                        yield this.writeFile(fileEntry, dataBlob);
                        fileEntry.moveTo(dirEntry, fileName, entry => resolve(entry), reject);
                    }), reject);
                }
                else {
                    dirEntry.getFile(fileName, { create: createFile, exclusive: false }, resolve, reject);
                }
            });
        });
    }
    fileExists(path, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.getFileEntry(path, fileName);
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    copyTo(oldPath, oldFileName, newPath, newFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileEntry = yield this.getFileEntry(oldPath, oldFileName);
            const newDirEntry = yield this.getDirectory(newPath);
            return new Promise((resolve, reject) => {
                fileEntry.copyTo(newDirEntry, newFileName, resolve, reject);
            });
        });
    }
    removeFile(path, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileEntry = yield this.getFileEntry(path, filename);
            return new Promise((resolve, reject) => {
                fileEntry.remove(resolve, reject);
            });
        });
    }
    writeFile(fileEntry, dataBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fileEntry.createWriter((fileWriter) => {
                    const status = { done: 0 };
                    let chunks = 1;
                    let offset = Math.floor(dataBlob.size / chunks);
                    // Maximum chunk size 512kb
                    while (offset > (1024 * 512)) {
                        chunks *= 2;
                        offset = Math.floor(dataBlob.size / chunks);
                    }
                    fileWriter.onwriteend = (file) => {
                        status.done += 1;
                        if (status.done === chunks) {
                            resolve();
                        }
                        else {
                            fileWriter.seek(fileWriter.length);
                            fileWriter.write(dataBlob.slice(status.done * offset, (status.done * offset) + offset));
                        }
                    };
                    fileWriter.onerror = (e) => {
                        reject(e.toString());
                    };
                    fileWriter.write(dataBlob.slice(0, offset));
                });
            });
        });
    }
}
class IonicDeploy {
    constructor(parent) {
        this.lastPause = 0;
        this.minBackgroundDuration = 10;
        this.parent = parent;
        this.delegate = this.initialize();
        this.fetchIsAvailable = typeof (fetch) === 'function';
        document.addEventListener('deviceready', this.onLoad.bind(this));
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = yield this._initPreferences();
            this.minBackgroundDuration = preferences.minBackgroundDuration;
            const appInfo = yield this.parent.getAppDetails();
            const delegate = new IonicDeployImpl(appInfo, preferences);
            // Only initialize start the plugin if fetch is available
            if (!this.fetchIsAvailable) {
                console.warn('Fetch is unavailable so cordova-plugin-ionic has been disabled.');
                yield (yield this.delegate).hideSplash();
            }
            else {
                yield delegate._handleInitialPreferenceState();
            }
            return delegate;
        });
    }
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            document.addEventListener('pause', this.onPause.bind(this));
            document.addEventListener('resume', this.onResume.bind(this));
            yield this.onResume();
        });
    }
    onPause() {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastPause = Date.now();
        });
    }
    onResume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable && this.lastPause && this.minBackgroundDuration && Date.now() - this.lastPause > this.minBackgroundDuration * 1000) {
                yield (yield this.delegate).sync();
                yield this.reloadApp();
            }
        });
    }
    _initPreferences() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    cordova.exec((prefs) => __awaiter(this, void 0, void 0, function* () {
                        resolve(prefs);
                    }), reject, 'IonicCordovaCommon', 'getPreferences');
                }
                catch (e) {
                    reject(e.message);
                }
            }));
        });
    }
    /* v4 API */
    init(config, success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.configure.');
        this.configure(config).then(result => success(), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    check(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.checkForUpdate.');
        this.checkForUpdate().then(result => success(String(result.available)), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    download(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.downloadUpdate.');
        this.downloadUpdate(success).then(result => success(result ? 'true' : 'false'), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    extract(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.extractUpdate.');
        this.extractUpdate(success).then(result => success(result ? 'true' : 'false'), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    redirect(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.reloadApp.');
        this.reloadApp().then(result => success(String(result)), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    info(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.getCurrentVersion.');
        this.getCurrentVersion().then(result => success(result), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    getVersions(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.getAvailableVersions.');
        this.getAvailableVersions().then(results => success(results.map(result => result.versionId)), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    deleteVersion(version, success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.deploy.deleteVersionById.');
        this.deleteVersionById(version).then(result => success(String(result)), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    /* v5 API */
    checkForUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable) {
                return (yield this.delegate).checkForUpdate();
            }
            return { available: false };
        });
    }
    configure(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).configure(config);
        });
    }
    getConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    cordova.exec((prefs) => __awaiter(this, void 0, void 0, function* () {
                        if (prefs.availableUpdate) {
                            delete prefs.availableUpdate;
                        }
                        if (prefs.updates) {
                            delete prefs.updates;
                        }
                        resolve(prefs);
                    }), reject, 'IonicCordovaCommon', 'getPreferences');
                }
                catch (e) {
                    reject(e.message);
                }
            }));
        });
    }
    deleteVersionById(version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).deleteVersionById(version);
            return true;
        });
    }
    downloadUpdate(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).downloadUpdate(progress);
            return false;
        });
    }
    extractUpdate(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).extractUpdate(progress);
            return false;
        });
    }
    getAvailableVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).getAvailableVersions();
            return [];
        });
    }
    getCurrentVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).getCurrentVersion();
            return;
        });
    }
    getVersionById(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).getVersionById(versionId);
            throw Error(`No update available with versionId ${versionId}`);
        });
    }
    reloadApp() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).reloadApp();
            return false;
        });
    }
    sync(syncOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchIsAvailable)
                return (yield this.delegate).sync(syncOptions);
            return;
        });
    }
}
/**
 * BASE API
 *
 * All features of the Ionic Cordova plugin are registered here, along with some low level error tracking features used
 * by the monitoring service.
 */
class IonicCordova {
    constructor() {
        this.deploy = new IonicDeploy(this);
    }
    getAppInfo(success, failure) {
        console.warn('This function has been deprecated in favor of IonicCordova.getAppDetails.');
        this.getAppDetails().then(result => success(result), err => {
            typeof err === 'string' ? failure(err) : failure(err.message);
        });
    }
    getAppDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                cordova.exec(resolve, reject, 'IonicCordovaCommon', 'getAppInfo');
            });
        });
    }
}
const instance = new IonicCordova();
module.exports = instance;
