import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

interface EventPayloadMapping {
  statistics: any;
  changeView: string;
  getStaticData: any;
  sendFrameAction: "CLOSE" | "MAXIMIZE" | "MINIMIZE";
  "update-available": void;
  "update-downloaded": void;
  quitAndInstall: void;
}

contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback: (stats: any) => void) =>
    ipcOn("statistics", callback),

  subscribeChangeView: (callback: (view: string) => void) =>
    ipcOn("changeView", callback),

  getStaticData: (): Promise<any> => ipcInvoke("getStaticData"),

  sendFrameAction: (payload: "CLOSE" | "MAXIMIZE" | "MINIMIZE") =>
    ipcSend("sendFrameAction", payload),

  // 📌 YANGI FUNKSIYALAR
  subscribeUpdateAvailable: (callback: () => void) =>
    ipcOn("update-available", callback),

  subscribeUpdateDownloaded: (callback: () => void) =>
    ipcOn("update-downloaded", callback),

  quitAndInstall: () => ipcSend("quitAndInstall"),
});

// 📌 Helper funksiyalar
function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key
): Promise<EventPayloadMapping[Key]> {
  return ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: IpcRendererEvent, payload: any) => callback(payload);
  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload?: EventPayloadMapping[Key]
) {
  ipcRenderer.send(key, payload);
}
