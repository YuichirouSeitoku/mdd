import { IpcMainInvokeEvent } from 'electron'
import OpenAI from 'openai'
import type { Comment, Explanation } from '../types'
import type { ShortcutEvent } from './shortcut'
import { readFile, readdir, mkdtemp } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import ffmpeg from 'fluent-ffmpeg'

export const makeExplanations = async (
  event: IpcMainInvokeEvent,
  videoPath: string,
  mddprojectFilePath: string,
  comments: Comment[]
): Promise<Explanation[]> => {
  console.log(event)

  // ファイル読み込み
  const shorcutEvents = await loadProjectFile(mddprojectFilePath)

  // ビデオデータを画像に分割して一時ディレクトリに保存
  const frameInterval = 10 //  FIXME: 仮決め
  const tmpDir = await mkdtemp(join(tmpdir(), 'video-')) // 画像の保存先の一時ディレクトリ
  await splitVideoData(videoPath, frameInterval, tmpDir)

  const files = await readdir(tmpDir) // ディレクトリ内のファイルを読み込み
  const sortedFiles = files.sort()

  // 解説生成
  const startTime = 0 // FIXME: テスト用の開始時刻を設定 (秒に合わせる)
  const explanations: Explanation[] = []
  const createExplanation = (comment: Comment): void => {
    const explanation = '' // TODO: 解説生成処理
    explanations.push({
      text: explanation,
      time: comment.time
    })
  }
  comments.forEach(createExplanation)

  return explanations
}

const loadProjectFile = async (mddprojectFilePath: string): Promise<ShortcutEvent[]> => {
  const data = await readFile(mddprojectFilePath, 'utf8')
  const jsonData = JSON.parse(data)

  // データ読み込み
  const shorcutEvents: ShortcutEvent[] = jsonData['shorcutEvents']

  return shorcutEvents
}

const splitVideoData = async (
  videoPath: string,
  frameInterval: number,
  saveDir: string
): Promise<void> => {
  ffmpeg(videoPath)
    .on('error', (err: Error) => {
      throw err
    })
    .output(join(saveDir, 'frame-%04d.png'))
    .outputOptions([
      `-vf select='not(mod(n\\,${frameInterval}))'`, // フレーム指定
      '-vsync vfr', // フレームレートの同期
      '-q:v 4' // 画像の品質
    ])
}
