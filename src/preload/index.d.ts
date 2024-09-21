import { IpcRendererEvent } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'
import { Comment } from '../types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    fileSystem: FileSystemAPI
    explanation: ExplanationAPI
  }

  interface API {
    startRecord: (projectName: string) => Promise<boolean>
    stopRecord: () => Promise<boolean>
  }
  interface FileSystemAPI {
    readFile: (filePath: string) => Promise<Buffer>
  }

  interface ExplanationAPI {
    makeExplanations: (
      videoPath: string,
      mddprojectFilePath: string,
      comments: Comment[]
    ) => Promise<Explanation[]>
  }
}
