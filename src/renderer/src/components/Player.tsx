import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Comment, Explanation } from '../../../types'
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
  backgroundColor: '#e1f5fe',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  flex: 1,
  maxWidth: '100%',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // 影を追加
  borderRadius: '10px', // 角を丸くする
  transition: '0.3s', // ホバー時のアニメーション
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // ホバー時の影を強くする
    transform: 'scale(1.02)' // ホバー時に拡大
  }
}))

const Player: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const commentsEndRef = useRef<HTMLDivElement | null>(null) // スクロール位置を管理するref
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [currentComment, setCurrentComment] = useState<string>('')
  // TODO: 解説を表示させたい場合は必要
  // const [explanations, setExplanations] = useState<Explanation[]>([])
  const [isMovieRendering, setIsMovieRendering] = useState<boolean>(false)

  // クエリパラメータを取得
  const query = new URLSearchParams(useLocation().search)
  const videoFilePath = query.get('video')
  const keyeventFilePath = query.get('keyevent')

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

  // 解説を出す
  const handleMakeExplanation = (): void => {
    if (!videoFilePath) return
    if (!keyeventFilePath) return
    setIsMovieRendering(true)
    window.explanation
      .makeExplanations(videoFilePath, keyeventFilePath, comments)
      .then((explanations: Explanation[]) => {
        // TODO: 解説を表示させたい場合は必要
        // setExplanations(explanations)
        console.log(explanations)
        window.video
          .renderVideo(videoFilePath, keyeventFilePath, explanations)
          .then((video: Blob) => {
            setIsMovieRendering(false)
            const url = URL.createObjectURL(video)
            location.href = url
          })
      })
  }

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
    <body
      style={{
        padding: '20px',
        margin: '0 auto',
        background: 'linear-gradient(to bottom right, #4fc3f7, #e1f5fe)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // 影を追加
        minHeight: '100vh'
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Item>
          <video ref={videoRef} width="100%" controls>
            {videoUrl && <source src={videoUrl} type="video/mp4" />}
          </video>
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
                label="コメントを追加"
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
          <h1>コメント一覧</h1>
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
                  <strong>{comment.time.toFixed(2)}秒:</strong> {comment.text}
                  <IconButton
                    aria-label="削除"
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
        <button onClick={handleMakeExplanation}>
          {isMovieRendering ? '動画を作成中です...' : 'AIの解説付き動画を作成'}
        </button>
      </Stack>
    </body>
  )
}

export default Player
