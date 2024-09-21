import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home(): JSX.Element {
  const navigate = useNavigate()

  const handleClick = (): void => {
    navigate('/sample')
  }

  return (
    <div>
      <h1>ホーム画面</h1>
      <button onClick={handleClick}>別の画面へ移動</button>
    </div>
  )
}

export default Home
