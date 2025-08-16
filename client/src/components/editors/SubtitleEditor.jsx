// src/components/editors/SubtitleEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  detectTextDirection, 
  formatTime, 
  parseTime, 
  validatePersianText,
  cleanPersianText,
  estimateReadingTime 
} from '../../utils/languageUtils';

const SubtitleEditor = ({ 
  videoUrl, 
  subtitles = [], 
  onSubtitlesChange,
  readonly = false 
}) => {
  const { t, i18n } = useTranslation();
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [editingSubtitle, setEditingSubtitle] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  // New subtitle form state
  const [newSubtitle, setNewSubtitle] = useState({
    startTime: 0,
    endTime: 0,
    originalText: '',
    persianText: '',
    speakerName: '',
    notes: ''
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Auto-select current subtitle
      const current = subtitles.find(sub => 
        video.currentTime >= sub.startTime && video.currentTime <= sub.endTime
      );
      if (current && current !== selectedSubtitle) {
        setSelectedSubtitle(current);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [subtitles, selectedSubtitle]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const seekTo = (time) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(time, duration));
  };

  const skipBackward = () => {
    seekTo(currentTime - 5);
  };

  const skipForward = () => {
    seekTo(currentTime + 5);
  };

  const setCurrentTimeAsStart = () => {
    setNewSubtitle(prev => ({ ...prev, startTime: currentTime }));
  };

  const setCurrentTimeAsEnd = () => {
    setNewSubtitle(prev => ({ ...prev, endTime: currentTime }));
  };

  const addSubtitle = () => {
    if (!newSubtitle.persianText.trim() || newSubtitle.startTime >= newSubtitle.endTime) return;
    
    const subtitle = {
      id: Date.now(),
      ...newSubtitle,
      persianText: cleanPersianText(newSubtitle.persianText),
      estimatedDuration: estimateReadingTime(newSubtitle.persianText),
      validation: validatePersianText(newSubtitle.persianText)
    };
    
    const updatedSubtitles = [...subtitles, subtitle].sort((a, b) => a.startTime - b.startTime);
    onSubtitlesChange(updatedSubtitles);
    
    // Reset form
    setNewSubtitle({
      startTime: newSubtitle.endTime,
      endTime: newSubtitle.endTime + 3,
      originalText: '',
      persianText: '',
      speakerName: '',
      notes: ''
    });
  };

  const updateSubtitle = (id, updates) => {
    const updatedSubtitles = subtitles.map(sub => 
      sub.id === id 
        ? { 
            ...sub, 
            ...updates,
            persianText: updates.persianText ? cleanPersianText(updates.persianText) : sub.persianText,
            validation: updates.persianText ? validatePersianText(updates.persianText) : sub.validation
          }
        : sub
    );
    onSubtitlesChange(updatedSubtitles);
  };

  const deleteSubtitle = (id) => {
    const updatedSubtitles = subtitles.filter(sub => sub.id !== id);
    onSubtitlesChange(updatedSubtitles);
    if (selectedSubtitle?.id === id) {
      setSelectedSubtitle(null);
    }
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timeRatio = clickX / rect.width;
    const clickedTime = timeRatio * duration;
    seekTo(clickedTime);
  };

  const currentSubtitle = subtitles.find(sub => 
    currentTime >= sub.startTime && currentTime <= sub.endTime
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Video Player Section */}
      <div className="bg-black relative">
        <video 
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-96 object-contain"
          controls={false}
        />
        
        {/* Current Subtitle Overlay */}
        {currentSubtitle && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div 
              className="bg-black bg-opacity-80 text-white px-4 py-2 rounded max-w-3xl text-center"
              dir={detectTextDirection(currentSubtitle.persianText)}
              style={{ fontFamily: i18n.language === 'fa' ? 'Vazir, Tahoma' : 'Arial' }}
            >
              <div className="text-lg leading-relaxed">
                {currentSubtitle.persianText}
              </div>
              {currentSubtitle.originalText && (
                <div className="text-sm text-gray-300 mt-1">
                  {currentSubtitle.originalText}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={skipBackward}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <span className="text-xl">⏪</span>
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 bg-persian-500 text-white rounded-full hover:bg-persian-600"
          >
            <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
          </button>
          
          <button
            onClick={skipForward}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <span className="text-xl">⏩</span>
          </button>
          
          <div className="text-sm text-gray-600 ml-4">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Timeline */}
        <div 
          ref={timelineRef}
          className="relative h-12 bg-gray-200 rounded cursor-pointer mb-4"
          onClick={handleTimelineClick}
        >
          {/* Progress Bar */}
          <div 
            className="absolute top-0 left-0 h-full bg-persian-500 rounded"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Subtitle Blocks */}
          {subtitles.map(subtitle => (
            <div
              key={subtitle.id}
              className={`absolute top-1 h-10 rounded cursor-pointer border-2 ${
                selectedSubtitle?.id === subtitle.id 
                  ? 'border-yellow-400 bg-yellow-200' 
                  : 'border-blue-400 bg-blue-200'
              }`}
              style={{
                left: `${(subtitle.startTime / duration) * 100}%`,
                width: `${((subtitle.endTime - subtitle.startTime) / duration) * 100}%`,
                minWidth: '4px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSubtitle(subtitle);
                seekTo(subtitle.startTime);
              }}
              title={`${formatTime(subtitle.startTime)} - ${formatTime(subtitle.endTime)}\n${subtitle.persianText}`}
            />
          ))}
          
          {/* Current Time Indicator */}
          <div 
            className="absolute top-0 w-1 h-full bg-red-500"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Subtitle List */}
        <div className="w-1/2 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">{t('subtitle.list')}</h3>
            <div className="text-sm text-gray-600">
              {subtitles.length} {t('subtitle.count')}
            </div>
          </div>
          
          <div className="space-y-2 p-4">
            {subtitles.map((subtitle, index) => (
              <div
                key={subtitle.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSubtitle?.id === subtitle.id 
                    ? 'border-persian-500 bg-persian-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
                    ? 'ring-2 ring-yellow-400'
                    : ''
                }`}
                onClick={() => {
                  setSelectedSubtitle(subtitle);
                  seekTo(subtitle.startTime);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <div className="text-xs text-gray-500">
                    {formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}
                  </div>
                </div>
                
                <div 
                  className="text-sm font-medium mb-1"
                  dir={detectTextDirection(subtitle.persianText)}
                >
                  {subtitle.persianText}
                </div>
                
                {subtitle.originalText && (
                  <div className="text-xs text-gray-600 mb-2">
                    {subtitle.originalText}
                  </div>
                )}
                
                {/* Validation Indicators */}
                {subtitle.validation && !subtitle.validation.isValid && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {subtitle.validation.issues.map(issue => (
                      <span key={issue} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
                
                {!readonly && (
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubtitle(subtitle);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubtitle(subtitle.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editing Panel */}
        <div className="w-1/2 bg-gray-50">
          {!readonly && (
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-lg mb-4">
                {editingSubtitle ? t('subtitle.edit') : t('subtitle.add')}
              </h3>
              
              <div className="space-y-4">
                {/* Timing Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('subtitle.startTime')}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={editingSubtitle ? editingSubtitle.startTime : newSubtitle.startTime}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (editingSubtitle) {
                            updateSubtitle(editingSubtitle.id, { startTime: value });
                          } else {
                            setNewSubtitle(prev => ({ ...prev, startTime: value }));
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-l text-sm"
                      />
                      <button
                        onClick={setCurrentTimeAsStart}
                        className="px-3 py-2 bg-persian-500 text-white rounded-r text-sm hover:bg-persian-600"
                      >
                        Now
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('subtitle.endTime')}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={editingSubtitle ? editingSubtitle.endTime : newSubtitle.endTime}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (editingSubtitle) {
                            updateSubtitle(editingSubtitle.id, { endTime: value });
                          } else {
                            setNewSubtitle(prev => ({ ...prev, endTime: value }));
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-l text-sm"
                      />
                      <button
                        onClick={setCurrentTimeAsEnd}
                        className="px-3 py-2 bg-persian-500 text-white rounded-r text-sm hover:bg-persian-600"
                      >
                        Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Original Text */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('subtitle.originalText')}
                  </label>
                  <textarea
                    value={editingSubtitle ? editingSubtitle.originalText : newSubtitle.originalText}
                    onChange={(e) => {
                      if (editingSubtitle) {
                        updateSubtitle(editingSubtitle.id, { originalText: e.target.value });
                      } else {
                        setNewSubtitle(prev => ({ ...prev, originalText: e.target.value }));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded text-sm"
                    rows="2"
                    placeholder="English text..."
                  />
                </div>

                {/* Persian Translation */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('subtitle.persianText')} *
                  </label>
                  <textarea
                    value={editingSubtitle ? editingSubtitle.persianText : newSubtitle.persianText}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (editingSubtitle) {
                        updateSubtitle(editingSubtitle.id, { persianText: value });
                      } else {
                        setNewSubtitle(prev => ({ ...prev, persianText: value }));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded text-sm font-persian"
                    rows="3"
                    placeholder="متن فارسی..."
                    dir="rtl"
                  />
                  
                  {/* Persian text validation */}
                  {(editingSubtitle?.persianText || newSubtitle.persianText) && (
                    <div className="mt-2 text-xs">
                      {(() => {
                        const text = editingSubtitle ? editingSubtitle.persianText : newSubtitle.persianText;
                        const validation = validatePersianText(text);
                        const readingTime = estimateReadingTime(text);
                        
                        return (
                          <div className="space-y-1">
                            <div className="text-gray-600">
                              Estimated reading time: {readingTime}s
                            </div>
                            {validation.suggestions.map((suggestion, i) => (
                              <div key={i} className="text-orange-600">
                                💡 {suggestion}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {editingSubtitle ? (
                    <>
                      <button
                        onClick={() => setEditingSubtitle(null)}
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        onClick={() => setEditingSubtitle(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        {t('common.cancel')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={addSubtitle}
                      disabled={!newSubtitle.persianText.trim() || newSubtitle.startTime >= newSubtitle.endTime}
                      className="px-4 py-2 bg-persian-600 text-white rounded text-sm hover:bg-persian-700 disabled:bg-gray-400"
                    >
                      {t('subtitle.add')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Subtitle Details */}
          {selectedSubtitle && (
            <div className="p-4">
              <h4 className="font-medium mb-3">{t('subtitle.details')}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Duration:</span> {
                    formatTime(selectedSubtitle.endTime - selectedSubtitle.startTime)
                  }
                </div>
                <div>
                  <span className="font-medium">Character count:</span> {
                    selectedSubtitle.persianText.length
                  }
                </div>
                {selectedSubtitle.validation && (
                  <div>
                    <span className="font-medium">Quality score:</span> {
                      selectedSubtitle.validation.score
                    }/100
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtitleEditor;