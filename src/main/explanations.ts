import { IpcMainInvokeEvent } from 'electron'
import OpenAI from 'openai'
import { ChatCompletionContentPart, ChatCompletionUserMessageParam } from 'openai/resources'
import type { Comment, Explanation } from '../types'
import type { ShortcutEvent } from './shortcut'
import { readFile, readdir, mkdtemp } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import ffmpeg from 'fluent-ffmpeg'

const client = new OpenAI()

export const makeExplanations = async (
  event: IpcMainInvokeEvent,
  videoPath: string,
  mddprojectFilePath: string,
  comments: Comment[]
): Promise<Explanation[]> => {
  console.log(event)

  // ファイル読み込み
  const [shortcutEvents, startAt] = await loadProjectFile(mddprojectFilePath)

  // ビデオデータを画像に分割して一時ディレクトリに保存
  const frameInterval = 10 //  FIXME: 仮決め
  const tmpDir = await mkdtemp(join(tmpdir(), 'video-')) // 画像の保存先の一時ディレクトリ
  await splitVideoData(videoPath, frameInterval, tmpDir)

  const files = await readdir(tmpDir)
  const sortedFiles = files.sort()

  // 解説生成
  const startTime = startAt / 1000000
  const fps = await calcFPS(videoPath)
  const explanations = await Promise.all(
    comments.map((comment: Comment) =>
      explainCommnet(startTime, comment, shortcutEvents, fps, frameInterval, sortedFiles)
    )
  )
  return explanations
}

export const loadProjectFile = async (
  mddprojectFilePath: string
): Promise<[ShortcutEvent[], number]> => {
  const data = await readFile(mddprojectFilePath, 'utf8')
  const jsonData = JSON.parse(data)

  // データ読み込み
  const shortcutEvents: ShortcutEvent[] = jsonData['shortcutEvents']

  return [shortcutEvents, jsonData['shortcut']['startAt']]
}

const calcFPS = async (videoPath: string): Promise<number> => {
  const defaultFPS = 60 // FIXME: 仮のFPS
  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      return defaultFPS
    }

    const videoStream = metadata.streams.find((stream) => stream.codec_type == 'video')

    if (videoStream?.avg_frame_rate) {
      const fps = eval(videoStream.avg_frame_rate)
      return fps
    } else {
      return defaultFPS
    }
  })
  return defaultFPS
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

const explainCommnet = async (
  startTime: number, // UNIX時間[s]
  comment: Comment,
  shorcutEvents: ShortcutEvent[], // キーボードショートカットのイベント
  fps: number,
  frameInterval: number,
  imageFiles: string[]
): Promise<Explanation> => {
  const frameBaseTime = (1 / fps) * frameInterval // 1画像ごとの秒数[s]

  // 必要な画像の取得
  const imageIndex = Math.floor(comment.time / frameBaseTime) // 何枚目がコメントの画像かを計算
  // 前後の画像をnImageRange枚取得
  const nImageRange = 10
  const startIndex = Math.max(imageIndex - nImageRange, 0) // インデックスが0を下回らないようにする
  const endIndex = Math.min(imageIndex + nImageRange, imageFiles.length - 1) // インデックスがnImages - 1を上回らないようにする
  const slicedImageFiles = imageFiles.slice(startIndex, endIndex + 1)

  // 範囲内のキーボードショートカットイベントを取得
  const eventStartTime = startIndex * frameBaseTime
  const eventEndTime = (endIndex + 1) * frameBaseTime
  const slicedShortcutEvents: ShortcutEvent[] = []
  for (const event of shorcutEvents) {
    const eventTime = event.eventAt / 1000000 - startTime // 秒に合わせる
    if (eventStartTime <= eventTime && eventTime <= eventEndTime) {
      slicedShortcutEvents.push(event)
    }
  }

  // プロンプト作成
  const systemPrompt = `
与えられたコメントと画像、ショートカットキーの入力をもとに、
この画面を操作したユーザが何を行ったのかを解説してください

## 注意点
- 主語は入れずに短く解説をしてください
- 必ず敬語で解説してください
`
  let userTextPrompt = '## コメント\n'
  userTextPrompt += comment.text
  userTextPrompt += '\n\n'
  if (slicedShortcutEvents.length > 0) {
    userTextPrompt += '## ショートカットキー(入力順)\n\n'
  }
  for (const event of slicedShortcutEvents) {
    userTextPrompt += `- ${event.keys[0]} + ${event.keys[1]}\n`
  }

  const imagePrompts: ChatCompletionContentPart[] = []
  for (const imageFile of slicedImageFiles) {
    const buffer = await readFile(imageFile)
    const base64 = buffer.toString('base64')
    const dataUri = `data:image/png;base64,${base64}`
    imagePrompts.push({
      type: 'image_url',
      image_url: {
        url: dataUri
      }
    })
  }

  const userPrompt: ChatCompletionUserMessageParam = {
    role: 'user',
    content: [{ type: 'text', text: userTextPrompt }, ...imagePrompts]
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      userPrompt
    ],
    temperature: 0,
    max_tokens: 50 // NOTE: 出力は短めに出しておく
  })

  const explanationText = response.choices[0].message.content
  console.log(explanationText)
  if (explanationText == null) {
    throw new Error('GPTの出力が返ってきませんでした')
  }
  return {
    text: explanationText,
    time: comment.time
  }
}
