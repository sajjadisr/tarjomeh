// src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SubtitleEditor from '../components/editors/SubtitleEditor';
import ArticleEditor from '../components/editors/ArticleEditor';
import { isRTL } from '../utils/languageUtils';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subtitles, setSubtitles] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockProject = {
        id: parseInt(id),
        title: id === '1' ? 'Understanding Quantum Physics' : id === '2' ? 'TED Talk: Future of AI' : 'How to Learn Persian',
        description: id === '1' 
          ? 'A comprehensive video explaining quantum physics concepts for beginners. Perfect for educational content.'
          : id === '2'
          ? 'Inspiring TED talk about the future of artificial intelligence and its impact on society.'
          : 'Educational video series on learning Persian language fundamentals.',
        type: id === '1' ? 'article' : 'video',
        status: 'active',
        difficulty: 'intermediate',
        sourceLanguage: 'en',
        targetLanguage: 'fa',
        videoUrl: id !== '1' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : null,
        originalContent: id === '1' ? `
          # Understanding Quantum Physics

          Quantum physics is one of the most fascinating and counterintuitive areas of science. It describes the behavior of matter and energy at the smallest scales, where the classical laws of physics break down.

          ## Key Concepts

          ### Wave-Particle Duality
          One of the most fundamental concepts in quantum physics is wave-particle duality. This principle states that all particles exhibit both wave and particle properties depending on how they are observed.

          ### Uncertainty Principle
          Heisenberg's uncertainty principle tells us that we cannot know both the position and momentum of a particle with perfect accuracy simultaneously.

          ### Quantum Entanglement
          Perhaps the most mysterious aspect of quantum physics is entanglement, where particles become correlated in such a way that measuring one instantly affects the other, regardless of distance.
        ` : null,
        createdAt: '2024-01-15',
        deadline: '2024-02-15',
        contributors: [
          { id: 1, name: 'علی احمدی', role: 'translator', avatar: '👤', contributions: 15 },
          { id: 2, name: 'Sara Johnson', role: 'reviewer', avatar: '👤', contributions: 8 },
          { id: 3, name: 'فاطمه رضایی', role: 'translator', avatar: '👤', contributions: 12 }
        ],
        stats: {
          totalSegments: id === '1' ? 25 : 120,
          completed: id === '1' ? 18 : 45,
          reviewed: id === '1' ? 12 : 30,
          quality: 85
        },
        tags: ['education', 'science', id === '1' ? 'physics' : id === '2' ? 'technology' : 'language-learning']
      };

      // Mock subtitles for video projects
      const mockSubtitles = id !== '1' ? [
        {
          id: 1,
          startTime: 2.5,
          endTime: 6.8,
          originalText: "Welcome to this presentation about the future of AI.",
          persianText: "به این ارائه درباره آینده هوش مصنوعی خوش آمدید.",
          speakerName: "Dr. Smith",
          status: "completed",
          validation: { isValid: true, score: 95, issues: [], suggestions: [] }
        },
        {
          id: 2,
          startTime: 7.2,
          endTime: 12.1,
          originalText: "Artificial Intelligence is transforming every aspect of our lives.",
          persianText: "هوش مصنوعی تمام جنبه‌های زندگی ما را دگرگون می‌کند.",
          speakerName: "Dr. Smith",
          status: "completed",
          validation: { isValid: true, score: 88, issues: [], suggestions: [] }
        },
        {
          id: 3,
          startTime: 13.5,
          endTime: 18.7,
          originalText: "From healthcare to transportation, AI is everywhere.",
          persianText: "",
          speakerName: "Dr. Smith",
          status: "pending",
          validation: null
        }
      ] : [];

      setProject(mockProject);
      setSubtitles(mockSubtitles);
      
      // Mock user role
      setUserRole('translator');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinProject = async () => {
    try {
      setJoinLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserRole('translator');
      
      // Add user to contributors
      setProject(prev => ({
        ...prev,
        contributors: [
          ...prev.contributors,
          { 
            id: user.id, 
            name: user.name, 
            role: 'translator', 
            avatar: '👤', 
            contributions: 0 
          }
        ]
      }));
      
    } catch (err) {
      setError('Failed to join project');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSubtitlesChange = (updatedSubtitles) => {
    setSubtitles(updatedSubtitles);
    // TODO: Auto-save to backend
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  const isRTLLayout = isRTL(i18n.language);
  const progressPercentage = (project.stats.completed / project.stats.totalSegments) * 100;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTLLayout ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/projects')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.type === 'video' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {project.type === 'video' ? '🎥 Video' : '📄 Article'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.sourceLanguage.toUpperCase()} → {project.targetLanguage.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {!userRole ? (
                  <button
                    onClick={joinProject}
                    disabled={joinLoading || !isAuthenticated}
                    className="btn-primary disabled:bg-gray-400"
                  >
                    {joinLoading ? 'Joining...' : t('projects.join')}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">✓ Joined as {userRole}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {project.stats.completed}/{project.stats.totalSegments} segments
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-persian-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'editor', label: project.type === 'video' ? 'Subtitle Editor' : 'Article Editor' },
              { id: 'contributors', label: 'Contributors' },
              { id: 'discussion', label: 'Discussion' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-persian-500 text-persian-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">علی احمدی</span> completed translation of segment 15
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">💬</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Sara Johnson</span> left a review comment
                      </p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-persian-100 rounded-full flex items-center justify-center">
                      <span className="text-persian-600 text-sm">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">فاطمه رضایی</span> joined the project
                      </p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <div className="card">
                <h3 className="font-semibold mb-4">Project Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Segments</span>
                    <span className="font-medium">{project.stats.totalSegments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">{project.stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Under Review</span>
                    <span className="font-medium text-orange-600">{project.stats.reviewed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Score</span>
                    <span className="font-medium">{project.stats.quality}/100</span>
                  </div>
                </div>
              </div>

              {/* Contributors */}
              <div className="card">
                <h3 className="font-semibold mb-4">Top Contributors</h3>
                <div className="space-y-3">
                  {project.contributors.slice(0, 3).map(contributor => (
                    <div key={contributor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm">{contributor.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{contributor.name}</p>
                          <p className="text-xs text-gray-500">{contributor.role}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {contributor.contributions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="card">
                <h3 className="font-semibold mb-2">Deadline</h3>
                <p className="text-sm text-gray-600">{project.deadline}</p>
                <div className="mt-2">
                  <div className="text-xs text-orange-600">
                    ⏰ 25 days remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="h-[calc(100vh-300px)]">
            {project.type === 'video' ? (
              <SubtitleEditor 
                videoUrl={project.videoUrl}
                subtitles={subtitles}
                onSubtitlesChange={handleSubtitlesChange}
                readonly={!userRole}
              />
            ) : (
              <ArticleEditor 
                originalContent={project.originalContent}
                translations={translations}
                onTranslationsChange={setTranslations}
                readonly={!userRole}
              />
            )}
          </div>
        )}

        {activeTab === 'contributors' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Project Contributors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.contributors.map(contributor => (
                <div key={contributor.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">{contributor.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{contributor.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{contributor.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>Contributions:</span>
                      <span className="font-medium">{contributor.contributions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Discussion</h2>
            <div className="text-center text-gray-500 py-8">
              <p>Discussion feature coming soon...</p>
              <p className="text-sm mt-2">Collaborate with other translators in real-time</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
