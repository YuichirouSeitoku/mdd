import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { writeFile } from 'fs/promises'
import { ShortcutWatcher, ShortcutEvent } from './shortcut'
import icon from '../../resources/icon.png?asset'
import path from 'path'

import { createSubtitleMovie } from './subtitleMovie'
import type { Subtitle } from './subtitleMovie'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true // FIXME: RendererからもNodeを使えるためXSSの危険性あり
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // NOTE: dev環境では開発者ツールを開く
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const SPECIAL_KEYS = Object.freeze([
  'LEFT CTRL',
  'LEFT SHIFT',
  'LEFT ALT',
  'LEFT META',
  'RIGHT CTRL',
  'RIGHT SHIFT',
  'RIGHT META'
])

let shortcutEvents: ShortcutEvent[] = []
const watcher = new ShortcutWatcher(SPECIAL_KEYS, (e) => shortcutEvents.push(e))
watcher.start()
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// see https://stackoverflow.com/questions/75168222/how-can-i-wait-for-asynchronous-operations-to-complete-when-an-electron-app-is-c
let flagQuit = false
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (flagQuit) return
  watcher.dispose()
  // FIXME: 録画終了時の処理に移動する
  // TODO: 拡張子を決定する
  await writeFile(
    './foo.mddproject',
    JSON.stringify({ format: 'v1', video: { path: './a.mp4' }, shortcutEvents: shortcutEvents })
  )
  shortcutEvents = []
  if (process.platform !== 'darwin') {
    app.quit()
  }
  flagQuit = true
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const subtitles: Subtitle[] = [
  { startTime: '0:00:01.00', endTime: '0:00:05.00', text: 'Hello, this is the first subtitle!' },
  { startTime: '0:00:06.00', endTime: '0:00:10.00', text: 'And this is the second subtitle!' },
];

const input_video_path = path.join(app.getAppPath(), 'resources', 'record.mp4');
const output_video_path = path.join(app.getAppPath(), 'resources', 'subtitle_record.mp4');

// createSubtitleMovieを呼び出すタイミングは、他プログラムと結合するときに再度検討
createSubtitleMovie(subtitles, input_video_path, output_video_path)