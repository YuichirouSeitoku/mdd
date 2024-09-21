import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    fileSystem: FileSystemAPI
  }

  interface API {
    startRecord: () => Promise<boolean>
    stopRecord: () => Promise<boolean>
  }
  interface FileSystemAPI {
    readFile: (filePath: string) => Promise<Buffer>
  }
}
