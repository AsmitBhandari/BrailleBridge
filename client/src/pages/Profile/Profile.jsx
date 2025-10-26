import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../store/authSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { Home, User, Mail, Calendar, Settings, LogOut, Save, Edit3 } from 'lucide-react'
import axios from 'axios'

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      language: 'en',
      braille_grade: 'grade1',
      audio_enabled: true
    }
  })

  // API configuration
  const API_BASE_URL = 'http://localhost:8000/api'
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        preferences: user.preferences || {
          language: 'en',
          braille_grade: 'grade1',
          audio_enabled: true
        }
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/me`,
        {
          name: formData.name,
          preferences: formData.preferences
        },
        axiosConfig
      )

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Update Redux state with new user data
      // Note: In a real app, you'd dispatch an action to update the user in Redux
      
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error.response?.data?.detail || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/home')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600">Manage your account settings</p>
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
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled={true} // Email cannot be changed
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Preferences</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Default Language</Label>
                      <select
                        id="language"
                        name="preferences.language"
                        value={formData.preferences.language}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="bn">Bengali</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="braille_grade">Default Braille Grade</Label>
                      <select
                        id="braille_grade"
                        name="preferences.braille_grade"
                        value={formData.preferences.braille_grade}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                      >
                        <option value="grade1">Grade 1 (Uncontracted)</option>
                        <option value="grade2">Grade 2 (Contracted)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="preferences.audio_enabled"
                        checked={formData.preferences.audio_enabled}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium">Enable audio generation by default</span>
                    </label>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">{formatDate(user?.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-gray-600 capitalize">{user?.role || 'User'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Account Actions</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
