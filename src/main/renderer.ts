import { IpcMainInvokeEvent } from 'electron'
import { Explanation } from '../types'
import { loadProjectFile } from './explanations'
import { createSubtitleMovie } from './subtitleMovie'
import type { Subtitle } from './subtitleMovie'
import { mkdtemp, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

export const renderVideo = async (
  event: IpcMainInvokeEvent,
  videoPath: string,
  mddprojectFilePath: string,
  explanations: Explanation[]
): Promise<Blob> => {
  console.log(event)

  // ファイル読み込み
  // FIXME:explanations.tsの方に本体があるのでちゃんと共通化する
  const [shortcutEvents, startAt] = await loadProjectFile(mddprojectFilePath)

  const tmpDir = await mkdtemp(join(tmpdir(), 'video-')) // 動画の一時保存先のディレクトリ

  // キーイベントのレンダリング
  const keySubtitles: Subtitle[] = []
  for (const event of shortcutEvents) {
    const start = (event.eventAt - startAt) / 1000
    const end = start + 2 // FIXME: 一旦は字幕を2秒表示する
    const keys = event.keys
    const sub: Subtitle = {
      startTime: sec2subtitlefmt(start),
      endTime: sec2subtitlefmt(end),
      text: `${keys[0]} + ${keys[1]}`
    }
    keySubtitles.push(sub)
  }
  console.log(keySubtitles)
  const tmpOutputPath = join(tmpDir, 'tmpOutputPath.mp4')
  createSubtitleMovie(keySubtitles, videoPath, tmpOutputPath, 'UpperLeft')

  // 解説のレンダリング
  const explanationSubtitles: Subtitle[] = []
  for (const explanation of explanations) {
    const start = explanation.time
    const end = start + 2 // FIXME: 一旦は字幕を2秒表示する
    const sub: Subtitle = {
      startTime: sec2subtitlefmt(start),
      endTime: sec2subtitlefmt(end),
      text: explanation.text
    }
    explanationSubtitles.push(sub)
  }
  console.log(explanationSubtitles)
  const outputPath = join(tmpDir, 'output.mp4')
  createSubtitleMovie(explanationSubtitles, tmpOutputPath, outputPath, 'LowerMiddle')

  const video = await readFile(outputPath)
  const blob = new Blob([video], { type: 'video/mp4' })
  return blob
}

const sec2subtitlefmt = (sec: number): string => {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const secs = Math.floor(sec % 60)
  const milliseconds = Math.floor((sec % 1) * 1000)

  const pad = (num: number, size: number): string => ('000' + num).slice(-size)

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(milliseconds, 2)}`
}
