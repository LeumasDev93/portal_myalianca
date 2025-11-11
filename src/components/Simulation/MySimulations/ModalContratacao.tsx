'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { FaFileInvoiceDollar, FaSpinner, FaFilePdf } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { LoadingContainer } from '@/components/ui/loading-container';
import { useSessionCheckToken } from '@/hooks/useSessionToken';

interface Document {
  id: string;
  name: string | null;
  description: string | null;
  required: boolean;
  supported_types: string[] | null;
}

interface Address {
  address: string;
  postalCode: string | null;
  county: string;
  country: string;
  city: string;
}

interface Contact {
  type: string;
  value: string;
}

interface Client {
  name: string;
  nif: string;
  activity: string;
  birthdate: string | null;
  primaryMobileContact: string;
  primaryEmailContact: string;
  addresses: Address[];
  contacts: Contact[];
}

interface SimulationDetails {
  idSimulationTel?: number;
  idContract?: number;
  reference?: string;
  totalPremium?: number;
  premium?: number;
  renewalDate?: string;
  continuedDate?: string | null;
  clientReference?: string | null;
  producerReference?: string | null;
  currency?: string;
  currencySymbol?: string;
  client?: Client;
  productId?: string;
  productType?: string;
  product?: Record<string, unknown> | null;
  propertyGroup?: Record<string, unknown> | null;
  installmentValues?: Record<string, unknown>[] | null;
  simulationObjects?: Record<string, unknown>[] | null;
  hasError?: boolean;
  errors?: Record<string, unknown>[] | null;
  hasWarnings?: boolean;
  warnings?: Record<string, unknown>[] | null;
}

interface InstallmentData {
  name: string;
  value: number;
  annualValue: number;
  taxes: Record<string, number>;
}

interface ModalContratacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRecibo?: (reference: string) => void;
  simulationData: {
    productId?: string;
    productType?: string;
    productName?: string;
    reference?: string;
    premium?: number;
    totalPremium?: number;
  };
  simulationDetails?: SimulationDetails;
  selectedInstallment?: InstallmentData | null;
}

export function ModalContratacao({ isOpen, onClose, onNavigateToRecibo, simulationData, simulationDetails, selectedInstallment }: ModalContratacaoProps) {
  const { toast } = useToast();
  const { token } = useSessionCheckToken();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [activeTab, setActiveTab] = useState<'dados' | 'documentos'>('dados');
  const [clientData, setClientData] = useState<Client | null>(null);

  // Debug: monitorar quando clientData é atualizado
  useEffect(() => {
    if (clientData) {
      console.log('✅ clientData atualizado! Campos serão preenchidos:', {
        nome: clientData.name,
        nif: clientData.nif,
        bi: (clientData as unknown as Record<string, unknown>).bi || '-',
        birthdate: clientData.birthdate,
        activity: clientData.activity
      });
    }
  }, [clientData]);

  // Limpar form quando fechar
  useEffect(() => {
    if (!isOpen) {
      setUploadedFiles({});
      setActiveTab('dados');
      setLoadingData(true);
      setClientData(null);
    }
  }, [isOpen]);

  // Carregar dados do cliente se necessário
  useEffect(() => {
    if (!isOpen) return;
    
    const loadMainData = async () => {
      setLoadingData(true);
      
      try {
        // Se não tiver dados do cliente, mas tiver clientReference, buscar da API
        if (!simulationDetails?.client && simulationDetails?.clientReference && token) {
          console.log('🔍 Buscando dados do cliente pela API (SimulationResults)...');
          console.log('📝 clientReference:', simulationDetails.clientReference);
          
          const response = await fetch(
            `/api/client/info?clientReference=${simulationDetails.clientReference}`,
            {
              method: 'GET',
              headers: {
                'X-Anywhere-Token': token,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Dados BRUTOS do cliente carregados da API:', data);
            
            // A API retorna um array, pegar o primeiro elemento
            const clientInfo = Array.isArray(data) ? data[0] : data;
            console.log('📝 Cliente extraído:', clientInfo);
            console.log('📝 Estrutura do cliente:', {
              nome: clientInfo?.name,
              nif: clientInfo?.nif,
              activity: clientInfo?.activity,
              birthdate: clientInfo?.birthdate,
              temEnderecos: !!clientInfo?.addresses,
              temContatos: !!clientInfo?.contacts
            });
            
            if (clientInfo) {
              setClientData(clientInfo);
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Erro ao buscar dados do cliente:', errorData);
          }
        } else if (simulationDetails?.client) {
          console.log('ℹ️ Dados do cliente já disponíveis (ModalDetalhes)');
          console.log('📝 Dados do cliente:', {
            nome: simulationDetails.client.name,
            nif: simulationDetails.client.nif,
            activity: simulationDetails.client.activity
          });
          setClientData(simulationDetails.client);
        } else {
          console.log('⚠️ Nenhum dado de cliente disponível');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do cliente:', error);
      }
      
      // Pequeno delay para UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setLoadingData(false);
    };
    
    loadMainData();
  }, [isOpen, simulationDetails?.clientReference, simulationDetails?.client, token]);

  // Buscar documentos necessários quando o modal abrir
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchDocuments = async () => {
      setLoadingDocuments(true);
      try {
        // Usar o productType como nome da categoria para a API
        const categoryName = simulationData.productType || 'Automovel';
        
        
        const response = await fetch(`/api/category/documents?name=${categoryName}`);
        const data = await response.json();
        
        if (response.ok && data.results) {
          console.log('✅ Documentos carregados:', data.results);
          // Filtrar apenas documentos válidos (com id)
          const validDocuments = data.results.filter((doc: Document) => doc.id);
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

    if (!token) {
      toast({
        title: 'Erro de autenticação',
        description: 'Token de sessão não encontrado. Por favor, faça login novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      // 1️⃣ PRIMEIRA API: Aceitar o contrato
      console.log('🔷 Etapa 1: Aceitando contrato...');
      console.log('🔑 Token disponível:', token ? 'SIM' : 'NÃO');
      
      const contractData = {
        idSimulationTel: simulationDetails?.idSimulationTel,
        idContract: simulationDetails?.idContract,
        proposalReference: simulationDetails?.reference,
        newStartDate: new Date().toISOString(), // Data/hora atual do sistema
        installment: selectedInstallment?.name || 'A',
        useDirectDebit: false,
      };

      console.log('📝 Dados do contrato:', contractData);

      const contractResponse = await fetch('/api/contract/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Anywhere-Token': token,
        },
        body: JSON.stringify(contractData),
      });

      if (!contractResponse.ok) {
        const errorData = await contractResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao aceitar contrato');
      }

      const contractResult = await contractResponse.json();
      console.log('✅ Contrato aceito:', contractResult);
      console.log('🔍 Verificação de pagamento:', {
        temInvoiceDTO: !!contractResult.invoiceDTO,
        hasError: contractResult.hasError,
        deveProsseguir: contractResult.invoiceDTO && !contractResult.hasError
      });

      // 2️⃣ SEGUNDA API: Enviar documentos (um por vez)
      const documentsToUpload = Object.keys(uploadedFiles).filter(
        docId => uploadedFiles[docId] !== null
      );

      if (documentsToUpload.length > 0) {
        console.log(`🔷 Etapa 2: Enviando ${documentsToUpload.length} documento(s)...`);

        for (const docId of documentsToUpload) {
          const file = uploadedFiles[docId];
          if (!file) continue;

          const doc = documents.find(d => d.id === docId);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('reference', simulationDetails?.reference || '');
          formData.append('system', 'ALIANCA_DIGITAL');
          formData.append('attachType', docId); // ID do tipo de documento
          formData.append('attachTo', 'idSimulationTel');
          formData.append('refAttachTo', String(simulationDetails?.idSimulationTel || ''));

          console.log(`📎 Enviando documento: ${doc?.name || docId}...`);

          const attachResponse = await fetch('/api/contract/attach', {
            method: 'POST',
            headers: {
              'X-Anywhere-Token': token,
            },
            body: formData,
          });

          if (!attachResponse.ok) {
            const errorData = await attachResponse.json().catch(() => ({}));
            console.error(`❌ Erro ao enviar documento ${doc?.name || docId}:`, errorData);
            throw new Error(errorData.error || `Erro ao enviar documento ${doc?.name || docId}`);
          }

          const attachResult = await attachResponse.json();
          console.log(`✅ Documento ${doc?.name || docId} enviado:`, attachResult);
        }
      }

      // 3️⃣ TERCEIRA ETAPA: Verificar resposta
      if (contractResult.hasError) {
        // Se houver erro, mostrar mensagem de erro VERMELHA
        console.log('⚠️ Contrato com erro');
        console.log('❌ Erro:', contractResult.error);
        setLoading(false);
        toast({
          title: '❌ Erro na contratação',
          description: contractResult.error || 'Ocorreu um erro ao processar a contratação.',
          variant: 'destructive', // Toast vermelho
        });
        onClose();
      } else if (contractResult.invoiceDTO) {
        // Se NÃO houver erro e houver invoice, mostrar toast com botão para ver recibo
        console.log('✅ Contrato emitido com sucesso!');
        console.log('💰 Invoice:', contractResult.invoiceDTO);
        
        const invoice = contractResult.invoiceDTO;
        setLoading(false);
        
        // Fechar modal antes de mostrar toast
        onClose();
        
        // Mostrar toast verde com botão "Ver Recibo"
        toast({
          title: '✅ Contrato emitido com sucesso!',
          description: `Recibo gerado: ${invoice.referencia}`,
          className: 'bg-green-50 border-green-500 text-green-800',
          style: {
            borderColor: '#22c55e',
            backgroundColor: '#f0fdf4',
            color: '#166534',
          },
          action: onNavigateToRecibo ? (
            <ToastAction 
              altText="Ver Recibo"
              onClick={() => {
                console.log('🔗 Navegando para recibo:', invoice.referencia);
                onNavigateToRecibo(invoice.referencia);
              }}
              className="bg-[#002855] text-white hover:bg-[#002855]/90 border-[#002855]"
            >
              Ver Recibo
            </ToastAction>
          ) : undefined,
        });
      } else {
        // Se não houver invoice e não houver erro, apenas mostrar sucesso
        console.log('✅ Contratação concluída sem invoice');
        setLoading(false);
        toast({
          title: 'Solicitação enviada com sucesso!',
          description: 'Contrato aceito e documentos anexados. Entraremos em contato em breve.',
          className: 'bg-green-50 border-green-500 text-green-800',
          style: {
            borderColor: '#22c55e',
            backgroundColor: '#f0fdf4',
            color: '#166534',
          },
      });

      onClose();
      }
    } catch (error) {
      console.error('❌ Erro no processo de contratação:', error);
      setLoading(false);
      toast({
        title: 'Erro ao enviar',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingData ? (
            /* Loading Principal */
            <LoadingContainer message="CARREGANDO DADOS DA SIMULAÇÃO..." />
          ) : (
            <>
              {/* Resumo Principal - Antes das Tabs */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 mb-6 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-xs text-gray-600 mb-1">ID Simulação</p>
                    <p className="font-semibold text-gray-900">
                      {simulationDetails?.idSimulationTel || '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 mb-1">Referência</p>
                    <p className="font-semibold text-gray-900">
                      #{simulationDetails?.reference || '-'}
                  </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 mb-1">Fracionamento</p>
                    <p className="font-semibold text-gray-900">
                      {selectedInstallment?.name === 'A' && 'Anual'}
                      {selectedInstallment?.name === 'S' && 'Semestral'}
                      {selectedInstallment?.name === 'T' && 'Trimestral'}
                      {selectedInstallment?.name === 'M' && 'Mensal'}
                      {!selectedInstallment && '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 mb-1">Valor</p>
                    <p className="font-semibold text-[#002855] text-lg">
                      {selectedInstallment?.value 
                        ? `${selectedInstallment.value.toLocaleString('pt-CV')} ${simulationDetails?.currencySymbol || 'CVE'}`
                        : '-'
                      }
                    </p>
                  </div>
                </div>
            </div>

              {/* Tabs */}
              <div className="flex border-b mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('dados')}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    activeTab === 'dados'
                      ? 'text-[#002855] border-b-2 border-[#002855]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dados da Simulação
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('documentos')}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    activeTab === 'documentos'
                      ? 'text-[#002855] border-b-2 border-[#002855]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documentos
                </button>
          </div>

              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab 1: Dados da Simulação */}
            {activeTab === 'dados' && (
              <div className="space-y-6">
                {/* Informações do Cliente */}
                {clientData && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                      Informações do Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={clientData.name}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          NIF
                        </label>
                        <input
                          type="text"
                          value={clientData.nif}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          BI
                        </label>
                        <input
                          type="text"
                          value={(clientData as unknown as Record<string, unknown>).bi as string || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data de Nascimento
                        </label>
                        <input
                          type="text"
                          value={clientData.birthdate ? new Date(clientData.birthdate).toLocaleDateString('pt-BR') : '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cliente
                        </label>
                        <input
                          type="text"
                          value={clientData.activity}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Documentos Necessários (gerados dinamicamente) */}
            {activeTab === 'documentos' && (
              <div>
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
            </div>
          )}

          {/* Footer com Botões */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
                className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              Cancelar
              </button>
              
              {activeTab === 'dados' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('documentos')}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-[#002855] text-white rounded-lg hover:bg-[#002256]/90 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  Próximo
                  <span>→</span>
                </button>
              )}

              {activeTab === 'documentos' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dados')}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-[#002855] text-[#002855] rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm order-2 sm:order-1"
                  >
                    <span>←</span>
                    Anterior
            </button>
            <button
              type="submit"
              disabled={loading}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-[#002855] text-white rounded-lg hover:bg-[#002256]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                        <span className="hidden sm:inline">Enviando...</span>
                        <span className="sm:hidden">Enviando...</span>
                </>
              ) : (
                <>
                  <FaFileInvoiceDollar />
                        <span className="hidden sm:inline">Enviar Solicitação</span>
                        <span className="sm:hidden">Enviar</span>
                      </>
                    )}
                  </button>
                </>
              )}
          </div>
        </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

