// src/components/editors/ArticleEditor.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  detectTextDirection, 
  validatePersianText,
  cleanPersianText 
} from '../../utils/languageUtils';

const ArticleEditor = ({ 
  originalContent = '', 
  translations = [], 
  onTranslationsChange,
  readonly = false 
}) => {
  const { t, i18n } = useTranslation();
  
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (originalContent) {
      parseContent(originalContent);
    }
  }, [originalContent]);

  const parseContent = (content) => {
    // Split content into translatable segments
    const lines = content.split('\n').filter(line => line.trim());
    const parsedSegments = lines.map((line, index) => {
      const trimmedLine = line.trim();
      let type = 'paragraph';
      let content = trimmedLine;
      
      // Detect segment type
      if (trimmedLine.startsWith('# ')) {
        type = 'heading1';
        content = trimmedLine.replace('# ', '');
      } else if (trimmedLine.startsWith('## ')) {
        type = 'heading2';
        content = trimmedLine.replace('## ', '');
      } else if (trimmedLine.startsWith('### ')) {
        type = 'heading3';
        content = trimmedLine.replace('### ', '');
      } else if (trimmedLine.startsWith('- ')) {
        type = 'list';
        content = trimmedLine.replace('- ', '');
      }
      
      // Find existing translation
      const existingTranslation = translations.find(t => t.segmentId === index);
      
      return {
        id: index,
        type,
        originalText: content,
        persianText: existingTranslation?.persianText || '',
        status: existingTranslation?.status || 'pending',
        notes: existingTranslation?.notes || '',
        validation: existingTranslation?.persianText ? validatePersianText(existingTranslation.persianText) : null
      };
    });
    
    setSegments(parsedSegments);
  };

  const updateTranslation = (segmentId, persianText, notes = '') => {
    const cleanedText = cleanPersianText(persianText);
    const validation = validatePersianText(cleanedText);
    
    const updatedTranslations = translations.filter(t => t.segmentId !== segmentId);
    updatedTranslations.push({
      segmentId,
      persianText: cleanedText,
      status: cleanedText ? 'completed' : 'pending',
      notes,
      validation,
      lastModified: new Date().toISOString()
    });
    
    onTranslationsChange(updatedTranslations);
    
    // Update local segments
    setSegments(prev => prev.map(segment => 
      segment.id === segmentId 
        ? { 
            ...segment, 
            persianText: cleanedText, 
            status: cleanedText ? 'completed' : 'pending',
            notes,
            validation 
          }
        : segment
    ));
  };

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = !searchTerm || 
      segment.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.persianText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || segment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'heading1': return '📋';
      case 'heading2': return '📄';
      case 'heading3': return '📝';
      case 'list': return '• ';
      default: return '¶';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'heading1': return 'bg-blue-100 text-blue-800';
      case 'heading2': return 'bg-green-100 text-green-800';
      case 'heading3': return 'bg-purple-100 text-purple-800';
      case 'list': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = segments.filter(s => s.status === 'completed').length;
  const completionPercentage = segments.length ? (completedCount / segments.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('article.editor')}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {completedCount}/{segments.length} segments completed
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-persian-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-persian-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-persian-500"
          >
            <option value="all">All Segments</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Segment List */}
        <div className="w-1/2 bg-white border-r overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <div className="space-y-3">
              {filteredSegments.map((segment, index) => (
                <div
                  key={segment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedSegment?.id === segment.id 
                      ? 'border-persian-500 bg-persian-50 ring-2 ring-persian-200' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedSegment(segment);
                    setCurrentTranslation(segment.persianText);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(segment.type)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(segment.type)}`}>
                        {segment.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        segment.status === 'completed' 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}></span>
                      <span className="text-xs text-gray-500">#{segment.id + 1}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {segment.originalText}
                    </p>
                  </div>
                  
                  {segment.persianText && (
                    <div className="mb-3">
                      <p 
                        className="text-sm font-persian text-gray-700 line-clamp-2"
                        dir="rtl"
                      >
                        {segment.persianText}
                      </p>
                    </div>
                  )}
                  
                  {/* Validation indicators */}
                  {segment.validation && !segment.validation.isValid && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {segment.validation.issues.slice(0, 2).map((issue, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>
                      {segment.originalText.length} chars
                    </span>
                    <span className={
                      segment.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                    }>
                      {segment.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredSegments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No segments found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Translation Editor */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          {selectedSegment ? (
            <div className="flex flex-col h-full">
              {/* Original Text Display */}
              <div className="bg-white border-b p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    Original Text (Segment #{selectedSegment.id + 1})
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(selectedSegment.type)}`}>
                    {selectedSegment.type}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedSegment.originalText}
                  </p>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {selectedSegment.originalText.length} characters • 
                  Estimated reading time: {Math.ceil(selectedSegment.originalText.split(' ').length / 200 * 60)}s
                </div>
              </div>

              {/* Translation Input */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-gray-900">
                    Persian Translation
                  </label>
                  <div className="text-xs text-gray-500">
                    {currentTranslation.length} chars
                  </div>
                </div>
                
                <textarea
                  value={currentTranslation}
                  onChange={(e) => setCurrentTranslation(e.target.value)}
                  disabled={readonly}
                  className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-persian text-right resize-none focus:outline-none focus:ring-2 focus:ring-persian-500 focus:border-transparent"
                  dir="rtl"
                  placeholder={readonly ? "Translation not available" : "متن فارسی خود را اینجا وارد کنید..."}
                />
                
                {/* Translation validation */}
                {currentTranslation && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <div className="text-sm">
                      {(() => {
                        const validation = validatePersianText(currentTranslation);
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Quality Score:</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                validation.score >= 80 
                                  ? 'bg-green-100 text-green-800' 
                                  : validation.score >= 60 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {validation.score}/100
                              </span>
                            </div>
                            
                            {validation.suggestions.length > 0 && (
                              <div>
                                <p className="font-medium text-sm mb-1">Suggestions:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {validation.suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex items-start space-x-1">
                                      <span>💡</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                {!readonly && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          updateTranslation(selectedSegment.id, currentTranslation);
                        }}
                        disabled={!currentTranslation.trim()}
                        className="px-4 py-2 bg-persian-600 text-white rounded-lg hover:bg-persian-700 disabled:bg-gray-400 transition-colors"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTranslation(selectedSegment.persianText);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const currentIndex = filteredSegments.findIndex(s => s.id === selectedSegment.id);
                          if (currentIndex > 0) {
                            const prevSegment = filteredSegments[currentIndex - 1];
                            setSelectedSegment(prevSegment);
                            setCurrentTranslation(prevSegment.persianText);
                          }
                        }}
                        disabled={filteredSegments.findIndex(s => s.id === selectedSegment.id) === 0}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = filteredSegments.findIndex(s => s.id === selectedSegment.id);
                          if (currentIndex < filteredSegments.length - 1) {
                            const nextSegment = filteredSegments[currentIndex + 1];
                            setSelectedSegment(nextSegment);
                            setCurrentTranslation(nextSegment.persianText);
                          }
                        }}
                        disabled={filteredSegments.findIndex(s => s.id === selectedSegment.id) === filteredSegments.length - 1}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes Section */}
              <div className="bg-white border-t p-4 flex-shrink-0">
                <h4 className="font-medium mb-2 text-sm">Translation Notes</h4>
                <textarea
                  value={selectedSegment.notes}
                  onChange={(e) => {
                    if (!readonly) {
                      updateTranslation(selectedSegment.id, currentTranslation, e.target.value);
                    }
                  }}
                  disabled={readonly}
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-persian-500"
                  rows="2"
                  placeholder={readonly ? "No notes available" : "Add translation notes, context, or questions..."}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">Select a segment to start translating</h3>
                <p className="text-sm">
                  Choose a segment from the list on the left to begin working on its Persian translation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Total: {segments.length} segments</span>
          <span className="text-green-600">Completed: {completedCount}</span>
          <span className="text-gray-400">Pending: {segments.length - completedCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          {!readonly && (
            <>
              <span>Auto-save enabled</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;