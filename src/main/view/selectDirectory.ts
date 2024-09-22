import { dialog, BrowserWindow } from 'electron'
export async function selectDirectory(window: BrowserWindow): Promise<string | undefined> {
  const { canceled, filePaths } = await dialog.showOpenDialog(window, {
    properties: [
      'openDirectory', // directory選択許可
      'createDirectory' // (macOS) directory作成許可
    ]
  })
  if (canceled || filePaths.length === 0) {
    return
  } else {
    return filePaths[0]
  }
}
