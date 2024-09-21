import { desktopCapturer, session } from 'electron'
import { resolve } from 'path'

function hasOwn<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.hasOwn(obj, prop)
}

function getUserMedia(id: string): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    const navigatorHacked = navigator as unknown
    if (
      typeof navigatorHacked === 'object' &&
      navigatorHacked != null &&
      hasOwn(navigatorHacked, 'getUserMedia') &&
      typeof navigatorHacked.getUserMedia == 'function'
    ) {
      console.log('OK')
      navigatorHacked.getUserMedia(
        {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'window',
              chromeMediaSourceId: id
            }
          }
        },
        resolve,
        reject
      )
    } else {
      console.log('getUserMedia is not found')
      reject('getUserMedia is not found')
    }
  })
}
export class ScreenRecorder {
  constructor() {
    console.log('c')
  }
  async start(): Promise<boolean> {
    const source = await desktopCapturer.getSources({ types: ['window'] })
    const stream = await getUserMedia(source[0].id)
    const mediaRecorder = new MediaRecorder(stream)
    if (mediaRecorder == null) return false
    // starting the recording
    // mediaRecorder.start(1_000) // 1 second interval to trigger the dataavailable
    // mediaRecorder.
    return true
  }
}
