import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share2, 
  Star, 
  FolderPlus, 
  File, 
  Folder, 
  Image, 
  FileText, 
  Music, 
  Video,
  Archive,
  Code,
  Settings,
  User,
  Bell,
  Plus,
  Eye,
  Edit3,
  Copy,
  Move,
  Clock,
  Filter,
  Home,
  Trash,
  Users,
  Cloud,
  LogOut,
  X,
  Mail,
  Check,
  AlertCircle
} from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { useAuth } from '../hooks/useAuth';
import { FileItem, ViewMode, SortBy } from '../types';

export function FileManager() {
  const { user, signOut } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{id: string | null, name: string}>>([{id: null, name: 'My Drive'}]);
  const { files, loading, storageUsage, uploadFile, createFolder, deleteFile, toggleStar, renameFile, downloadFile, error } = useFiles(currentFolderId);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileForAction, setSelectedFileForAction] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadProgress(true);
    setErrorMessage(null);
    
    console.log('Starting file upload, current folder:', currentFolderId);
    
    try {
      for (let i = 0; i < files.length; i++) {
        console.log(`Uploading file ${i + 1}/${files.length}:`, files[i].name);
        await uploadFile(files[i], currentFolderId);
      }
      setShowUploadModal(false);
      console.log('All files uploaded successfully');
    } catch (error: any) {
      console.error('File upload failed:', error);
      setErrorMessage(error.message || 'Failed to upload files');
    } finally {
      setUploadProgress(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setErrorMessage(null);
    try {
      await createFolder(newFolderName, currentFolderId);
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create folder');
    }
  };

  const handleRename = async () => {
    if (!selectedFileForAction || !renameValue.trim()) return;
    
    setErrorMessage(null);
    try {
      const file = files.find(f => f.id === selectedFileForAction);
      await renameFile(selectedFileForAction, renameValue, file?.type === 'folder');
      setShowRenameModal(false);
      setRenameValue('');
      setSelectedFileForAction(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to rename file');
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="w-6 h-6 text-blue-500" />;
    
    if (file.mime_type) {
      if (file.mime_type.startsWith('image/')) return <Image className="w-6 h-6 text-green-500" />;
      if (file.mime_type.startsWith('video/')) return <Video className="w-6 h-6 text-red-500" />;
      if (file.mime_type.startsWith('audio/')) return <Music className="w-6 h-6 text-purple-500" />;
      if (file.mime_type.includes('pdf')) return <FileText className="w-6 h-6 text-red-600" />;
      if (file.mime_type.includes('zip') || file.mime_type.includes('archive')) return <Archive className="w-6 h-6 text-orange-500" />;
      if (file.mime_type.includes('code') || file.mime_type.includes('javascript') || file.mime_type.includes('html')) return <Code className="w-6 h-6 text-blue-600" />;
    }
    
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'modified':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'size':
        return b.size - a.size;
      case 'type':
        return (a.mime_type || '').localeCompare(b.mime_type || '');
      default:
        return 0;
    }
  });

  const handleFileClick = (file: FileItem, isDoubleClick: boolean = false) => {
    if (isDoubleClick) {
      if (file.type === 'folder') {
        setCurrentFolderId(file.id);
        setFolderPath(prev => [...prev, {id: file.id, name: file.name}]);
      } else {
        downloadFile(file.id).catch(error => {
          setErrorMessage(error.message || 'Failed to download file');
        });
      }
    } else {
      setSelectedFiles([file.id]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navigateToFolder = (folderId: string | null, folderName: string) => {
    const targetIndex = folderPath.findIndex(f => f.id === folderId);
    if (targetIndex !== -1) {
      setFolderPath(folderPath.slice(0, targetIndex + 1));
    }
    setCurrentFolderId(folderId);
  };

  const storagePercentage = (storageUsage.used_bytes / storageUsage.total_bytes) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Drive</h1>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>New</span>
          </button>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-1">
            <button 
              onClick={() => navigateToFolder(null, 'My Drive')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Home className="w-5 h-5" />
              <span>My Drive</span>
            </button>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Users className="w-5 h-5" />
              <span>Shared with me</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Clock className="w-5 h-5" />
              <span>Recent</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Star className="w-5 h-5" />
              <span>Starred</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
              <Trash className="w-5 h-5" />
              <span>Trash</span>
            </a>
          </div>

          <div className="mt-8">
            <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Storage
            </div>
            <div className="mt-2 px-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{formatFileSize(storageUsage.used_bytes)} used</span>
                <span>of {formatFileSize(storageUsage.total_bytes)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{storageUsage.file_count} files</p>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in Drive"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <nav className="flex items-center space-x-2 text-sm">
            {folderPath.map((crumb, index) => (
              <React.Fragment key={crumb.id || 'root'}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <button
                  onClick={() => navigateToFolder(crumb.id, crumb.name)}
                  className="text-gray-600 hover:text-blue-600 hover:underline"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="modified">Last modified</option>
                  <option value="size">Size</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
                <button 
                  onClick={() => {
                    selectedFiles.forEach(fileId => {
                      downloadFile(fileId).catch(error => {
                        setErrorMessage(error.message || 'Failed to download file');
                      });
                    });
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    selectedFiles.forEach(fileId => {
                      const file = files.find(f => f.id === fileId);
                      deleteFile(fileId, file?.type === 'folder').catch(error => {
                        setErrorMessage(error.message || 'Failed to delete file');
                      });
                    });
                    setSelectedFiles([]);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {(error || errorMessage) && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error || errorMessage}</span>
              <button 
                onClick={() => {
                  setErrorMessage(null);
                }}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* File Grid/List */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Folder className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No files or folders</p>
              <p className="text-sm">Upload files or create folders to get started</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileClick(file, false);
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileClick(file, true);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedFiles.includes(file.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      {file.type === 'folder' ? (
                        <Folder className="w-12 h-12 text-blue-500" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                      {file.shared && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-800 truncate w-full" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(file.updated_at)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(file.id).catch(error => {
                        setErrorMessage(error.message || 'Failed to toggle star');
                      });
                    }}
                    className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      file.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last modified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File size</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFileClick(file, false);
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFileClick(file, true);
                      }}
                      onContextMenu={(e) => handleContextMenu(e, file.id)}
                      className={`cursor-pointer transition-colors duration-200 ${
                        selectedFiles.includes(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{file.name}</span>
                              {file.shared && <Users className="w-4 h-4 text-green-500" />}
                              {file.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        You
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(file.updated_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, file.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">New</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {uploadProgress && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Uploading files...</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress}
                className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5 text-gray-600" />
                <span>Upload files</span>
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setShowNewFolderModal(true);
                }}
                disabled={uploadProgress}
                className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderPlus className="w-5 h-5 text-gray-600" />
                <span>New folder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">New Folder</h3>
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Rename</h3>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue('');
                  setSelectedFileForAction(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="New name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue('');
                  setSelectedFileForAction(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              if (file && file.type === 'file') {
                downloadFile(contextMenu.fileId).catch(error => {
                  setErrorMessage(error.message || 'Failed to download file');
                });
              }
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button 
            onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              if (file) {
                setSelectedFileForAction(contextMenu.fileId);
                setRenameValue(file.name);
                setShowRenameModal(true);
              }
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Rename</span>
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
            <Copy className="w-4 h-4" />
            <span>Make a copy</span>
          </button>
          <hr className="my-1" />
          <button
            onClick={() => {
              toggleStar(contextMenu.fileId).catch(error => {
                setErrorMessage(error.message || 'Failed to toggle star');
              });
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Star className="w-4 h-4" />
            <span>{files.find(f => f.id === contextMenu.fileId)?.starred ? 'Remove from starred' : 'Add to starred'}</span>
          </button>
          <button
            onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              deleteFile(contextMenu.fileId, file?.type === 'folder').catch(error => {
                setErrorMessage(error.message || 'Failed to delete');
              });
              closeContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
}