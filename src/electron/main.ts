// @ts-nocheck
import { app, BrowserWindow } from "electron";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { ipcMainHandle, ipcMainOn, isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    frame: false,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  pollResources(mainWindow);

  ipcMainHandle("getStaticData", () => {
    return getStaticData();
  });

  ipcMainOn("sendFrameAction", (payload) => {
    switch (payload) {
      case "CLOSE":
        mainWindow.close();
        break;
      case "MAXIMIZE":
        mainWindow.maximize();
        break;
      case "MINIMIZE":
        mainWindow.minimize();
        break;
    }
  });

  createTray(mainWindow);
  handleCloseEvents(mainWindow);
  createMenu(mainWindow);

  // ✅ Yangilanishlarni tekshirishni boshlash
  checkForUpdates(mainWindow);
});

// ✅ Yangilanishlarni tekshirish funksiyasi
function checkForUpdates(mainWindow: BrowserWindow) {
  autoUpdater.checkForUpdatesAndNotify();

  // ✅ Yangilanish mavjud bo‘lsa, renderer jarayoniga habar yuborish
  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update-available");
  });

  // ✅ Yangilanish yuklab bo‘lingandan so‘ng, rendererga xabar yuborish
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
  });

  // ✅ Renderer `quitAndInstall` yuborganda, yangilanishni o‘rnatish
  ipcMainOn("quitAndInstall", () => {
    autoUpdater.quitAndInstall();
  });
}

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on("close", (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on("before-quit", () => {
    willClose = true;
  });

  mainWindow.on("show", () => {
    willClose = false;
  });
}
