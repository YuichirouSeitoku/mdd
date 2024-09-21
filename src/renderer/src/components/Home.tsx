import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home(): JSX.Element {
  const navigate = useNavigate()

  // WARN: 動画再生のテストのための処理であるため後で置き換える
  const [videoFilePath, setVideoFilePath] = useState<string | null>(null)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) setVideoFilePath(selectedFile.path)
  }
  const handleClick = (): void => {
    const encodedFilePath = videoFilePath ? encodeURIComponent(videoFilePath) : null
    navigate(`/player?video=${encodedFilePath}`)
  }

  const startRecord = (): void => {
    window.api.startRecord()
  }
  const stopRecord = (): void => {
    window.api.stopRecord()
  }

  return (
    <div>
      <h1>ホーム画面</h1>
      <section>
        <h2>キャプチャ</h2>
        <button onClick={startRecord}>録画開始</button>
        <button onClick={stopRecord}>録画終了</button>
      </section>
      <div>
        <h3>動画再生テスト用ファイルのアップロード</h3>
        <h5>ここで選択したファイルが動画再生画面で再生されます</h5>
        <input type="file" accept="video/mp4" onChange={handleFileChange} />
      </div>
      <button onClick={handleClick}>動画再生画面へ移動</button>
    </div>
  )
}

export default Home
