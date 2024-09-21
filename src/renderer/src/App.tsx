import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Sample from './components/Sample'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sample" element={<Sample />} />
      </Routes>
    </Router>
  )
}

export default App
