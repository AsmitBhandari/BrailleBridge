import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../store/authSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { Home, FileText, History, User, Search, ChevronLeft, ChevronRight, Eye, Download, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import axios from 'axios'

const HistoryPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, name
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState(null)
  
  // Audio player state
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null)
  
  const documentsPerPage = 20

  // API configuration
  const API_BASE_URL = 'http://localhost:8000/api'
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    fetchDocuments()
  }, [currentPage, sortBy])

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
  }, [currentAudioUrl])

  const fetchDocuments = async () => {
    setLoading(true)
    setError('')
    
    try {
      const skip = (currentPage - 1) * documentsPerPage
      const response = await axios.get(
        `${API_BASE_URL}/documents/?skip=${skip}&limit=${documentsPerPage}`,
        axiosConfig
      )
      
      const { documents, total } = response.data
      setDocuments(documents)
      setTotalDocuments(total)
      setTotalPages(Math.ceil(total / documentsPerPage))
      
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Failed to load documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sortDocuments = (docs) => {
    const sorted = [...docs]
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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.extracted_text && doc.extracted_text.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc)
  }

  const handleDownloadBraille = (doc) => {
    if (!doc.braille_content) return
    
    const blob = new Blob([doc.braille_content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title || 'document'}_braille.brf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePlayAudio = async (doc) => {
    if (!doc.audio_filepath) {
      alert('No audio file available for this document')
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${doc.id}/audio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Set audio source
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.volume = isMuted ? 0 : volume
        await audioRef.current.play()
        setCurrentAudioUrl(audioUrl)
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document History</h1>
              <p className="text-sm text-gray-600">View and manage all your processed documents</p>
            </div>
            <div className="flex items-center space-x-4">
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
                onClick={() => navigate('/home/dashboard')}
                className="flex items-center space-x-1"
              >
                <FileText className="h-4 w-4" />
                <span>Dashboard</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Documents</Label>
                <Input
                  id="search"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={fetchDocuments}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>
                  {totalDocuments} total documents • Page {currentPage} of {totalPages}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-lg">{doc.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(doc.created_at)}
                        </div>
                        <div>
                          <span className="font-medium">File:</span> {doc.original_filename}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {(doc.original_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      
                      {doc.extracted_text && (
                        <p className="text-sm text-gray-500 mt-2">
                          {doc.extracted_text.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      
                      {doc.braille_content && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadBraille(doc)}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Braille</span>
                        </Button>
                      )}
                      
                      {doc.audio_filepath && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePlayAudio(doc)}
                          className="flex items-center space-x-1"
                        >
                          <Play className="h-4 w-4" />
                          <span>Audio</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents found</p>
                <p className="text-sm">Try adjusting your search terms or upload some documents</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * documentsPerPage) + 1} to {Math.min(currentPage * documentsPerPage, totalDocuments)} of {totalDocuments} documents
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Details Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedDocument.title}</h3>
                    <p className="text-blue-100 mt-1">
                      Created: {formatDate(selectedDocument.created_at)} • 
                      Status: <span className="capitalize">{selectedDocument.status}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDocument(null)
                      handleStopAudio()
                    }}
                    className="bg-white/20 border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Close
                  </Button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Text Content */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Original Text
                      </h4>
                      <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
                        <p className="text-sm leading-relaxed">
                          {selectedDocument.extracted_text || 'No text extracted'}
                        </p>
                      </div>
                    </div>
                    
                    {selectedDocument.braille_content && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3 flex items-center">
                          <span className="mr-2">⠃</span>
                          Braille Translation
                        </h4>
                        <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
                          <p className="text-sm font-mono leading-relaxed">
                            {selectedDocument.braille_content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Audio Player & Actions */}
                  <div className="space-y-6">
                    {/* Audio Player */}
                    {selectedDocument.audio_filepath && (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-4 flex items-center">
                          <Volume2 className="h-5 w-5 mr-2" />
                          Audio Player
                        </h4>
                        
                        {/* Hidden audio element */}
                        <audio ref={audioRef} preload="metadata" />
                        
                        {/* Time display */}
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
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
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={isPlaying ? handlePauseAudio : () => handlePlayAudio(selectedDocument)}
                              className="flex items-center space-x-1"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              <span>{isPlaying ? 'Pause' : 'Play'}</span>
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleStopAudio}
                              className="flex items-center space-x-1"
                            >
                              <Square className="h-4 w-4" />
                              <span>Stop</span>
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
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Actions</h4>
                      
                      {selectedDocument.braille_content && (
                        <Button 
                          onClick={() => handleDownloadBraille(selectedDocument)}
                          className="w-full flex items-center justify-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download Braille (.brf)</span>
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/home/dashboard')}
                          className="flex items-center justify-center space-x-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/home/history')}
                          className="flex items-center justify-center space-x-1"
                        >
                          <History className="h-4 w-4" />
                          <span>Back to History</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document Info */}
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3">Document Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">File:</span>
                          <span className="font-medium">{selectedDocument.original_filename}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">{(selectedDocument.original_size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedDocument.original_mimetype}</span>
                        </div>
                        {selectedDocument.braille_grade && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Braille Grade:</span>
                            <span className="font-medium capitalize">{selectedDocument.braille_grade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default HistoryPage
