import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { readFile } from 'fs/promises'

// Custom APIs for renderer
const api = {
  startRecord: (projectName: string): Promise<boolean> => ipcRenderer.invoke('ipc-start-record', projectName),
  stopRecord: (): Promise<boolean> => ipcRenderer.invoke('ipc-stop-record')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// ファイル読み込みをrendererで使う
contextBridge.exposeInMainWorld('fileSystem', {
  readFile: (filePath: string) => {
    return readFile(filePath)
  }
})
