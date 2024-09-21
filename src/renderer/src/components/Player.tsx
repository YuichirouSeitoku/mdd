import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'

interface Comment {
  text: string
  time: number
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027'
  })
}))

const Player: React.FC = () => {
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
    <div>
      <Stack direction="row" spacing={2}>
        <Item>
          {/* 左側の動画エリア */}
          <h1>Video</h1>
          <video ref={videoRef} width="600" controls>
            {videoUrl && <source src={videoUrl} type="video/mp4" />}
          </video>
          {/* 下部に移動したコメント入力フォーム */}
          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Add a comment"
              style={{ width: '80%' }}
            />
            <button onClick={handleAddComment} style={{ marginLeft: '10px' }}>
              Add Comment
            </button>
          </div>
        </Item>
        <Item>
          {/* 右側のコメントエリア */}
          <h1>Comments</h1>
          <div style={{ marginTop: '20px' }}>
            <h2>Comments List</h2>
            <ul>
              {comments.map((comment, index) => (
                <li key={index}>
                  <strong>{comment.time.toFixed(2)}s:</strong> {comment.text}
                  <button onClick={() => handleDeleteComment(index)} style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Item>
      </Stack>
    </div>
  )
}

export default Player
