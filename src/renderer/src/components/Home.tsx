import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FilledInput from '@mui/material/FilledInput'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import TextField from '@mui/material/TextField'

function Home(): JSX.Element {
  const navigate = useNavigate()

  const [projectName, setProjectName] = useState<string>('')
  const [keyeventPath, setKeyeventPath] = useState<string | null>(null)
  const [recording, setRecording] = useState<boolean>(false)
  // WARN: 動画再生のテストのための処理であるため後で置き換える
  const [videoFilePath, setVideoFilePath] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) setVideoFilePath(selectedFile.path)
  }

  const handleClick = (): void => {
    const encodedFilePath = videoFilePath ? encodeURIComponent(videoFilePath) : null
    const encodedKeyeventPath = keyeventPath ? encodeURIComponent(keyeventPath) : null
    navigate(`/player?video=${encodedFilePath}&keyevent=${encodedKeyeventPath}`)
  }

  const startRecord = (): void => {
    if (recording) return
    setRecording(true)
    window.api.startRecord(projectName)
  }
  const stopRecord = async (): Promise<void> => {
    if (!recording) return
    const outputPath = await window.api.stopRecord()
    if (outputPath) setKeyeventPath(outputPath)
    setRecording(false)
  }

  return (
    <Paper
      elevation={3}
      style={{
        padding: '20px',
        maxWidth: '400px',
        height: '600px',
        // margin: '20px auto',
        borderRadius: '10px',
        background: 'linear-gradient(to bottom right, #4fc3f7, #e1f5fe)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <Stack
        spacing={3}
        style={{
          // marginTop: '20px',
          backgroundColor: '#e1f5fe',
          borderRadius: '10px',
          padding: '20px'
        }}
      >
        <TextField
          id="outlined-basic"
          label="レコード名称"
          variant="outlined"
          onChange={(e) => setProjectName(e.target.value)}
        />
        <Button variant="contained" disabled={recording} onClick={startRecord}>
          録画開始
        </Button>
        <Button variant="contained" disabled={!recording} onClick={stopRecord}>
          録画終了
        </Button>
      </Stack>
      <Stack
        spacing={3}
        style={{
          marginTop: '10px',
          backgroundColor: '#e1f5fe',
          borderRadius: '10px',
          padding: '20px'
        }}
      >
        <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
          動画ファイルのアップロード
        </Typography>
        <Typography variant="body2" style={{ color: '#555', marginTop: '10px' }}>
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
          <Typography
            variant="body1"
            style={{
              color: '#333',
              // marginTop: '10px',
              maxHeight: '50px', // 高さを固定
              overflowY: 'auto' // ファイル名が長い場合にスクロール
            }}
          >
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
