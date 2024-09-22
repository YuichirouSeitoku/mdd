import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FilledInput from '@mui/material/FilledInput'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

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

  return (
    <Paper
      elevation={3}
      style={{
        padding: '30px',
        maxWidth: '600px',
        margin: '20px auto',
        borderRadius: '10px',
        background: 'linear-gradient(to bottom right, #4fc3f7, #e1f5fe)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // 影を追加
      }}
    >
      <Stack
        spacing={3}
        style={{
          marginTop: '20px',
          backgroundColor: '#e1f5fe',
          borderRadius: '10px',
          padding: '20px'
        }}
      >
        <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
          動画ファイルのアップロード
        </Typography>
        <Typography variant="body2" style={{ color: '#555' }}>
          選択したファイルは動画再生画面で再生されます。
        </Typography>

        <label htmlFor="file-upload">
          <FilledInput
            id="file-upload"
            type="file"
            inputProps={{ accept: 'video/mp4' }}
            // accept="video/mp4"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the default input
          />
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '20px',
              borderColor: '#007bff'
            }}
          >
            ファイルを選択
          </Button>
        </label>

        {videoFilePath && (
          <Typography variant="body1" style={{ color: '#333', marginTop: '10px' }}>
            選択されたファイル: <strong>{videoFilePath}</strong>
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleClick}
          disabled={!videoFilePath}
          style={{
            alignSelf: 'center',
            backgroundColor: '#007bff',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '20px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          動画再生画面へ移動
        </Button>
      </Stack>
    </Paper>
  )
}

export default Home
