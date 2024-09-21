import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { writeFile } from 'fs/promises'
import microtime from 'microtime'
import { selectDirectory } from './view/selectDirectory'
import { ShortcutWatcher, ShortcutEvent } from './shortcut'

const PROJECT_EXT = 'mddproject'

type Project = { dir: string; name: string; startAt: number }

export function registerRecorder(watcher: ShortcutWatcher, window: BrowserWindow): void {
  let shortcutEvents: ShortcutEvent[] = []
  let isRecording = false
  let project: Project | null = null

  const startRecord = async (_, projectName: string): Promise<boolean> => {
    if (isRecording === true) return false
    isRecording = true
    const now = microtime.now()
    const name = path.parse(projectName).name
    if (name !== projectName) return false
    const dir = await selectDirectory(window)
    if (dir == null) return false
    project = { dir, name, startAt: now }
    console.log(`start record: ${dir}, ${projectName}`)
    watcher.start((e) => shortcutEvents.push(e))
    return true
  }

  const stopRecord = async (): Promise<boolean> => {
    if (isRecording === false || project == null) return false
    console.log('stop record')
    watcher.dispose()
    const now = microtime.now()
    const outputPath = path.resolve(path.join(project.dir, `${project.name}.${PROJECT_EXT}`))
    await writeFile(
      outputPath,
      JSON.stringify({
        format: 'v1',
        shortcut: { startAt: project.startAt, endAt: now },
        shortcutEvents
      }),
      'utf8'
    )
    shortcutEvents = []
    isRecording = false
    return true
  }

  ipcMain.handle('ipc-start-record', startRecord)
  ipcMain.handle('ipc-stop-record', stopRecord)
}
