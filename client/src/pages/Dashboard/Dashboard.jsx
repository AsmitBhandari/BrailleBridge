import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../store/authSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { Play, Pause, Square, Volume2, VolumeX, Home, FileText, History, User } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [selectedFile, setSelectedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [recentDocuments, setRecentDocuments] = useState([])
  const [language, setLanguage] = useState('en')
  const [brailleGrade, setBrailleGrade] = useState('grade1')
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, name
  
  // Audio player state
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // API configuration
  const API_BASE_URL = 'http://localhost:8000/api'
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch recent documents on component mount
  useEffect(() => {
    fetchRecentDocuments()
  }, [])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }
    const updateDuration = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [result])

  const sortDocuments = (documents) => {
    const sorted = [...documents]
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sorted
    }
  }

  const fetchRecentDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/recent`, axiosConfig)
      const documents = response.data.documents || []
      setRecentDocuments(sortDocuments(documents))
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  // Re-sort documents when sortBy changes
  useEffect(() => {
    if (recentDocuments.length > 0) {
      setRecentDocuments(sortDocuments(recentDocuments))
    }
  }, [sortBy])

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setError('')
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    
    setProcessing(true)
    setError('')
    
    try {
      // Step 1: Upload document
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', selectedFile.name)
      
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      const documentId = uploadResponse.data.document_id
      
      // Step 2: Process document
      const processResponse = await axios.post(
        `${API_BASE_URL}/documents/${documentId}/process`,
        {},
        axiosConfig
      )
      
      // Step 3: Get processed document details
      const documentResponse = await axios.get(
        `${API_BASE_URL}/documents/${documentId}`,
        axiosConfig
      )
      
      const document = documentResponse.data
      
      setResult({
        id: document.id,
        originalText: document.extracted_text || 'No text extracted',
        brailleText: document.braille_content || 'No Braille content',
        audioUrl: document.audio_filepath ? `${API_BASE_URL}/documents/${documentId}/audio` : null,
        title: document.title,
        createdAt: document.created_at
      })
      
      // Refresh recent documents
      await fetchRecentDocuments()
      
    } catch (error) {
      console.error('Processing error:', error)
      setError(error.response?.data?.detail || 'Processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadBraille = () => {
    if (!result?.brailleText) return
    
    const blob = new Blob([result.brailleText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title || 'document'}_braille.brf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePlayAudio = async () => {
    if (!result?.audioUrl) {
      alert('No audio file available for this document')
      return
    }
    
    console.log('Attempting to play audio:', result.audioUrl)
    console.log('Current user token:', token)
    
    try {
      // Fetch audio with authentication
      const response = await fetch(result.audioUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Convert to blob and create object URL
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Set audio source
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.volume = isMuted ? 0 : volume
        await audioRef.current.play()
        console.log('Audio playback started successfully')
      }
      
    } catch (error) {
      console.error('Audio playback error:', error)
      alert('Unable to play audio. Please try again.')
    }
  }

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume
    }
  }

  const handleMuteToggle = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    // Clear local state
    setResult(null)
    setRecentDocuments([])
    setSelectedFile(null)
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BrailleBridge</h1>
              <p className="text-sm text-gray-600">AI-powered Braille Translation</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              
              {/* Quick Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => scrollToSection('translate-section')}
                  className="flex items-center space-x-1"
                >
                  <FileText className="h-4 w-4" />
                  <span>Translate</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => scrollToSection('recent-documents')}
                  className="flex items-center space-x-1"
                >
                  <History className="h-4 w-4" />
                  <span>Recent</span>
                </Button>
              </div>
              
              {/* Home and Logout Buttons */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/home')}
                  className="flex items-center space-x-1"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/home/profile')}
                  className="flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
                
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card id="translate-section">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a document to convert to Braille and audio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="file">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, PNG, JPG, JPEG, DOCX, TXT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grade">Braille Grade</Label>
                  <Select value={brailleGrade} onValueChange={setBrailleGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade1">Grade 1 (Uncontracted)</SelectItem>
                      <SelectItem value="grade2">Grade 2 (Contracted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleProcess} 
                disabled={!selectedFile || processing}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Process Document'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Translation Results</CardTitle>
              <CardDescription>
                Your document has been processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Original Text</Label>
                    <Textarea 
                      value={result.originalText} 
                      readOnly 
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium">Braille Translation</Label>
                    <Textarea 
                      value={result.brailleText} 
                      readOnly 
                      className="mt-1 font-mono"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadBraille}
                      disabled={!result?.brailleText}
                    >
                      Download Braille (.brf)
                    </Button>
                  </div>

                  {/* Audio Player */}
                  {result?.audioUrl && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium mb-3 block">Audio Player</Label>
                      
                      {/* Hidden audio element */}
                      <audio ref={audioRef} preload="metadata" />
                      
                      {/* Time display */}
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mb-4">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                      
                      {/* Control buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
                            disabled={!result?.audioUrl}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStopAudio}
                            disabled={!result?.audioUrl}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Volume control */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMuteToggle}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Upload and process a document to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="mt-8" id="recent-documents">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>
                  Your 10 most recently processed documents
                </CardDescription>
              </div>
              {recentDocuments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="sort" className="text-sm">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/home/history')}
                    className="flex items-center space-x-1"
                  >
                    <History className="h-4 w-4" />
                    <span>View All</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-gray-600">
                        {doc.status} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.extracted_text && (
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.extracted_text.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setResult({
                            id: doc.id,
                            originalText: doc.extracted_text || 'No text extracted',
                            brailleText: doc.braille_content || 'No Braille content',
                            audioUrl: doc.audio_filepath ? `${API_BASE_URL}/documents/${doc.id}/audio` : null,
                            title: doc.title,
                            createdAt: doc.created_at
                          })
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No documents processed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Dashboard
