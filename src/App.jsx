import React from 'react'
import ImageSequenceRenderer from './components/ImageSequenceRenderer'
import ContentOverlay from './components/ContentOverlay'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <ImageSequenceRenderer />
      <ContentOverlay />
    </div>
  )
}

export default App
