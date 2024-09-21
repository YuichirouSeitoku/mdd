import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    fileSystem: FileSystemAPI
  }

  interface FileSystemAPI {
    readFile: (filePath: string) => Promise<Buffer>
  }
}
