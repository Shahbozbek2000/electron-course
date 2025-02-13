import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    frame: false,
  });

  mainWindow.loadFile(getUIPath());

  checkForUpdates(mainWindow);

  ipcMain.on("sendFrameAction", (_, payload) => {
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

  ipcMain.on("quitAndInstall", () => {
    autoUpdater.quitAndInstall();
  });
});

// 📌 Yangilanishlarni tekshirish va boshqarish
function checkForUpdates(mainWindow: BrowserWindow) {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update-available");
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-downloaded");
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready",
        message:
          "Yangi versiya yuklab olindi. Ilovani qayta ishga tushirasizmi?",
        buttons: ["Qayta ishga tushirish", "Keyinroq"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (err) => {
    dialog.showErrorBox("Update Error", `Yangilashda xatolik: ${err.message}`);
  });
}
