import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface Comment {
  text: string
  time: number
}

const Sample: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [currentComment, setCurrentComment] = useState<string>('')

  // クエリパラメータを取得
  const query = new URLSearchParams(useLocation().search)
  const videoFilePath = query.get('video') // FIXME: テスト用に用意した動画のパスを渡すためのパラメータ
  // TODO: まだ使用しないキー入力のデータ
  // const keysFilePath = query.get('keys')

  // ページ読み込み時にクエリパラメータから動画をセットする
  useEffect(() => {
    if (!videoFilePath) return
    window.fileSystem
      .readFile(videoFilePath)
      .then((data: Buffer) => {
        const blob = new Blob([data], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
      })
      .catch((err: Error) => {
        console.error('ファイル読み込みエラー', err)
      })
  }, [])

  // コメントを追加
  const handleAddComment = (): void => {
    if (!videoRef.current) return
    const videoTime = videoRef.current.currentTime
    setComments([...comments, { text: currentComment, time: videoTime }])
    setCurrentComment('')
  }

  // コメントを削除
  const handleDeleteComment = (index: number): void => {
    const updatedComments = comments.filter((_, i) => i !== index)
    setComments(updatedComments)
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* 左側の動画エリア */}
      <div style={{ flex: 1 }}>
        <h1>Video</h1>
        <video ref={videoRef} width="600" controls>
          {videoUrl && <source src={videoUrl} type="video/mp4" />}
        </video>
      </div>

      {/* 右側のコメントエリア */}
      <div style={{ flex: 1, marginLeft: '20px' }}>
        <h1>Comments</h1>

        <div>
          <input
            type="text"
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h2>Comments List</h2>
          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <strong>{comment.time.toFixed(2)}s:</strong> {comment.text}
                <button onClick={() => handleDeleteComment(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sample
