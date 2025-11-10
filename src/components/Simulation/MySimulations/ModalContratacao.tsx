'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { FaFileInvoiceDollar, FaSpinner, FaFilePdf } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  name: string | null;
  description: string | null;
  required: boolean;
  supported_types: string[] | null;
}

interface ModalContratacaoProps {
  isOpen: boolean;
  onClose: () => void;
  simulationData: {
    productId?: string;
    productType?: string;
    productName?: string;
    reference?: string;
    premium?: number;
    totalPremium?: number;
  };
}

export function ModalContratacao({ isOpen, onClose, simulationData }: ModalContratacaoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [descricao, setDescricao] = useState('');

  // Limpar form quando fechar
  useEffect(() => {
    if (!isOpen) {
      setDescricao('');
      setUploadedFiles({});
    }
  }, [isOpen]);

  // Buscar documentos necessários quando o modal abrir
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchDocuments = async () => {
      setLoadingDocuments(true);
      try {
        // Usar o productType como nome da categoria para a API
        const categoryName = simulationData.productType || 'Automovel';
        
        console.log('📄 ========== BUSCANDO DOCUMENTOS ==========');
        console.log('  simulationData completo:', simulationData);
        console.log('  productType:', simulationData.productType);
        console.log('  productId:', simulationData.productId);
        console.log('  categoryName (usado na API):', categoryName);
        console.log('  URL completa:', `/api/category/documents?name=${categoryName}`);
        
        const response = await fetch(`/api/category/documents?name=${categoryName}`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          console.log('✅ Documentos carregados:', data.results);
          // Filtrar apenas documentos válidos (com id)
          const validDocuments = data.results.filter((doc: any) => doc.id);
          console.log('✅ Documentos válidos:', validDocuments.length, validDocuments);
          setDocuments(validDocuments);
        } else {
          console.error('❌ Erro ao buscar documentos:', data);
          setDocuments([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar documentos:', error);
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };
    
    fetchDocuments();
  }, [isOpen, simulationData.productType]);

  if (!isOpen) return null;

  const handleFileChange = (documentId: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentId]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se todos os documentos obrigatórios foram enviados
    const missingDocs = documents.filter(doc => doc.required && !uploadedFiles[doc.id]);
    if (missingDocs.length > 0) {
      toast({
        title: 'Documentos obrigatórios faltando',
        description: `Por favor, envie: ${missingDocs.map(d => d.name).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      // Aqui você vai chamar a API de contratação com os dados
      console.log('📝 Dados de contratação:', {
        productId: simulationData.productId,
        productType: simulationData.productType,
        reference: simulationData.reference,
        descricao: descricao,
        documents: Object.keys(uploadedFiles).map(docId => ({
          documentId: docId,
          fileName: uploadedFiles[docId]?.name,
          fileType: uploadedFiles[docId]?.type,
        })),
      });

      // Simular envio (substitua pela chamada real da API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Solicitação enviada!',
        description: 'Entraremos em contato em breve.',
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#002855] to-[#004080] text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaFileInvoiceDollar className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">Contratar Seguro</h2>
              <p className="text-sm text-white/80">{simulationData.productName || 'Produto'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações da Simulação */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-[#002855] mb-3">Detalhes da Simulação</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {simulationData.reference && (
                <div>
                  <p className="text-gray-600">Referência:</p>
                  <p className="font-medium text-gray-900">{simulationData.reference}</p>
                </div>
              )}
              {simulationData.premium && (
                <div>
                  <p className="text-gray-600">Prêmio:</p>
                  <p className="font-medium text-gray-900">
                    {simulationData.premium.toLocaleString('pt-CV', { style: 'currency', currency: 'CVE' })}
                  </p>
                </div>
              )}
              {simulationData.productId && (
                <div>
                  <p className="text-gray-600">Product ID:</p>
                  <p className="font-medium text-gray-900 text-xs">{simulationData.productId}</p>
                </div>
              )}
              {simulationData.productType && (
                <div>
                  <p className="text-gray-600">Tipo:</p>
                  <p className="font-medium text-gray-900">{simulationData.productType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campo de Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição / Observações
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Adicione informações adicionais sobre a contratação (opcional)"
            />
          </div>

          {/* Documentos Necessários (gerados dinamicamente) */}
          {loadingDocuments ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="ml-3 text-gray-600">Carregando documentos necessários...</span>
            </div>
          ) : documents.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Documentos Necessários ({documents.length} documento{documents.length !== 1 ? 's' : ''})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, index) => {
                // Validar se o documento tem ID válido
                if (!doc.id) {
                  console.warn('⚠️ Documento sem ID:', doc);
                  return null;
                }
                
                // Usar name, description ou id como label
                const label = doc.name 
                  ? doc.name.replace(/_/g, ' ')
                  : doc.description 
                    ? doc.description
                    : `Documento ${index + 1}`;
                
                console.log(`📄 Renderizando documento ${index + 1}:`, { id: doc.id, label, required: doc.required });
                
                return (
                  <div key={doc.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {uploadedFiles[doc.id] && (
                        <span className="text-xs text-green-600 font-medium">✓ Anexado</span>
                      )}
                    </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-all
                        ${uploadedFiles[doc.id] 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        {uploadedFiles[doc.id] ? (
                          <>
                            <FaFilePdf className="text-green-600 text-xl" />
                            <span className="text-sm text-green-700 font-medium truncate max-w-xs">
                              {uploadedFiles[doc.id]?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Clique para escolher arquivo ({doc.supported_types?.join(', ') || 'pdf'})
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept={doc.supported_types?.map(type => `.${type}`).join(',') || '.pdf'}
                        required={doc.required}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(doc.id, file);
                        }}
                        className="hidden"
                      />
                    </label>
                    
                    {uploadedFiles[doc.id] && (
                      <button
                        type="button"
                        onClick={() => handleFileChange(doc.id, null)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: {doc.supported_types?.join(', ').toUpperCase() || 'PDF'}
                  </p>
                </div>
                );
              })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum documento necessário para este produto.</p>
            </div>
          )}

          {/* Footer com Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#002855] text-white rounded-lg hover:bg-[#002256]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <FaFileInvoiceDollar />
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

