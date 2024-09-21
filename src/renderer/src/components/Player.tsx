import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

interface Comment {
  text: string
  time: number
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  flex: 1, // 幅を持たせるためにflexを追加
  maxWidth: '100%' // 最大幅を設定
}))

const Player: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const commentsEndRef = useRef<HTMLDivElement | null>(null) // スクロール位置を管理するref
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

  // コメントが追加されるたびにスクロールする
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  return (
    <div style={{ padding: '20px', margin: '0 auto' }}>
      {/* 中央寄せのためのスタイル */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Item>
          {/* 左側の動画エリア */}
          <video ref={videoRef} width="100%" controls>
            {' '}
            {/* 幅を100%に設定 */}
            {videoUrl && <source src={videoUrl} type="video/mp4" />}
          </video>
          {/* 下部に移動したコメント入力フォーム */}
          <div style={{ marginTop: '10px' }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TextField
                id="outlined-basic"
                value={currentComment}
                label="Please add a comment"
                variant="outlined"
                onChange={(e) => setCurrentComment(e.target.value)}
                style={{ width: '80%' }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                style={{ marginLeft: '10px' }}
                size="large"
              >
                <SendIcon />
              </Button>
            </Stack>
          </div>
        </Item>
        <Item>
          {/* 右側のコメントエリア */}
          <h1>Comments</h1>
          <div
            style={{
              marginTop: '20px',
              textAlign: 'left',
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            <ul>
              {comments.map((comment, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <strong>{comment.time.toFixed(2)}[秒]:</strong> {comment.text}
                  <IconButton
                    aria-label="delete"
                    color="secondary"
                    size="small"
                    onClick={() => handleDeleteComment(index)}
                    style={{ marginLeft: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </li>
              ))}
            </ul>
            <div ref={commentsEndRef} /> {/* スクロールのための空のdiv */}
          </div>
        </Item>
      </Stack>
    </div>
  )
}

export default Player
