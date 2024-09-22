import { IpcRendererEvent } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'
import { Comment, Explanation } from '../types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    fileSystem: FileSystemAPI
    explanation: ExplanationAPI
    video: VideoAPI
  }

  interface API {
    startRecord: (projectName: string) => Promise<boolean>
    stopRecord: () => Promise<string | null>
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

  interface VideoAPI {
    renderVideo: (
      videoPath: string,
      mddprojectFilePath: string,
      explanations: Explanation[]
    ) => Promise<Blob>
  }
}
