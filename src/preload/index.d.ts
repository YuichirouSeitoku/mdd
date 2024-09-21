import { IpcRendererEvent } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    fileSystem: FileSystemAPI
    explanation: ExplanationAPI
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
