import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DocumentGrid } from './components/DocumentGrid';
import { CreateModal } from './components/CreateModal';
import { TableEditor } from './components/TableEditor';
import { DocumentEditor } from './components/DocumentEditor';
import { TableViewer } from './components/TableViewer';
import { DocumentViewer } from './components/DocumentViewer';
import { ShareModal } from './components/ShareModal';
import { useDocuments } from './hooks/useDocuments';
import type { DocumentItem, CategoryType, Table, Document } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [isDocumentEditorOpen, setIsDocumentEditorOpen] = useState(false);
  const [isTableViewerOpen, setIsTableViewerOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingTable, setViewingTable] = useState<Table | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [shareItem, setShareItem] = useState<DocumentItem | null>(null);

  const { documents, loading, error, addTable, addDocument, updateTable, updateDocument, deleteDocument, generateShareLink } = useDocuments();

  // Фильтрация документов по категории и поисковому запросу
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [documents, selectedCategory, searchQuery]);

  const handleCreateTable = () => {
    setEditingTable(null);
    setIsTableEditorOpen(true);
  };

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setIsDocumentEditorOpen(true);
  };

  const handleEdit = (doc: DocumentItem) => {
    if ('columns' in doc) {
      setEditingTable(doc);
      setIsTableEditorOpen(true);
    } else {
      setEditingDocument(doc);
      setIsDocumentEditorOpen(true);
    }
  };

  const handleView = (doc: DocumentItem) => {
    if ('columns' in doc) {
      setViewingTable(doc);
      setIsTableViewerOpen(true);
    } else {
      setViewingDocument(doc);
      setIsDocumentViewerOpen(true);
    }
  };

  const handleSaveTable = async (table: Table) => {
    try {
      if (editingTable) {
        await updateTable(table.id, table);
      } else {
        await addTable(table);
      }
      setIsTableEditorOpen(false);
      setEditingTable(null);
    } catch (err: any) {
      console.error('Ошибка сохранения таблицы:', err);
      alert(`Ошибка сохранения: ${err.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleSaveDocument = async (doc: Document) => {
    try {
      if (editingDocument) {
        await updateDocument(doc.id, doc);
      } else {
        await addDocument(doc);
      }
      setIsDocumentEditorOpen(false);
      setEditingDocument(null);
    } catch (err: any) {
      console.error('Ошибка сохранения документа:', err);
      alert(`Ошибка сохранения: ${err.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleShare = (doc: DocumentItem) => {
    setShareItem(doc);
    setIsShareModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот документ?')) {
      try {
        await deleteDocument(id);
      } catch (err: any) {
        console.error('Ошибка удаления:', err);
        alert(`Ошибка удаления: ${err.message || 'Неизвестная ошибка'}`);
      }
    }
  };

  const shareLink = shareItem ? generateShareLink(shareItem.id) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCreateClick={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'Все документы' : `Документы: ${selectedCategory}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Найдено документов: {filteredDocuments.length}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">Ошибка: {error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Загрузка документов...</div>
            </div>
          ) : (
            <DocumentGrid
              documents={filteredDocuments}
              onEdit={handleEdit}
              onView={handleView}
              onShare={handleShare}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTable={handleCreateTable}
        onCreateDocument={handleCreateDocument}
      />

      <TableEditor
        table={editingTable}
        isOpen={isTableEditorOpen}
        onClose={() => {
          setIsTableEditorOpen(false);
          setEditingTable(null);
        }}
        onSave={handleSaveTable}
      />

      <DocumentEditor
        document={editingDocument}
        isOpen={isDocumentEditorOpen}
        onClose={() => {
          setIsDocumentEditorOpen(false);
          setEditingDocument(null);
        }}
        onSave={handleSaveDocument}
      />

      <TableViewer
        table={viewingTable}
        isOpen={isTableViewerOpen}
        onClose={() => {
          setIsTableViewerOpen(false);
          setViewingTable(null);
        }}
      />

      <DocumentViewer
        document={viewingDocument}
        isOpen={isDocumentViewerOpen}
        onClose={() => {
          setIsDocumentViewerOpen(false);
          setViewingDocument(null);
        }}
      />

      <ShareModal
        file={shareItem}
        shareLink={shareLink}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareItem(null);
        }}
      />
    </div>
  );
}

export default App;
