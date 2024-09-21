import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Player from './components/Player'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  )
}

export default App
