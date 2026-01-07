import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Upload, FileText, CheckCircle, Printer, Share2, Send, Download, FileImage } from 'lucide-react';
import Input from './components/Input';
import Select from './components/Select';
import { FormData } from './types';
import { 
  CITIES, 
  INSTITUTIONS, 
  COURSES_ROLES, 
  BOARDING_POINTS, 
  BUS_DRIVERS_GO,
  SHIFTS,
  INSTITUTIONAL_LOGO
} from './constants';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    cityDistrict: '',
    address: '',
    institution: '',
    courseRole: '',
    boardingPoint: '',
    busDriverGo: '',
    shift: '',
    photo: null,
    photoPreviewUrl: null,
    declarationFile: null,
    declarationPreviewUrl: null
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);
  
  const faceFileInputRef = useRef<HTMLInputElement>(null);
  const declarationFileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      const rawValue = value.replace(/\D/g, '');
      const maskedValue = rawValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
      
      setFormData(prev => ({ ...prev, [name]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'photo' | 'declarationFile') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewField = field === 'photo' ? 'photoPreviewUrl' : 'declarationPreviewUrl';
        setFormData(prev => ({
          ...prev,
          [field]: file,
          [previewField]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validação de todos os campos obrigatórios
    const isMissingField = Object.entries(formData).some(([key, value]) => {
      if (key === 'photo' || key === 'photoPreviewUrl' || key === 'declarationFile' || key === 'declarationPreviewUrl') {
        return value === null;
      }
      return value === '';
    });

    if (isMissingField) {
      alert("Por favor, preencha todos os campos e envie as fotos obrigatórias.");
      return;
    }

    setLoading(true);
    try {
      const file = await generatePDF(formData);
      setGeneratedFile(file);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'UniBadge Cadastro',
      text: 'Olá! Segue o link para preencher o cadastro de transporte universitário.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link do formulário copiado para a área de transferência!');
    }
  };

  const handleShareFile = async () => {
    if (generatedFile && navigator.canShare && navigator.canShare({ files: [generatedFile] })) {
      try {
        await navigator.share({
          files: [generatedFile],
          title: 'Meu Cadastro UniBadge',
          text: 'Segue em anexo meu cadastro para o transporte.'
        });
      } catch (error) {
        console.log('Erro ao compartilhar arquivo', error);
      }
    } else {
      const text = "Olá! Acabei de gerar meu cadastro no app UniBadge. O arquivo PDF já está salvo no meu dispositivo e vou enviá-lo por aqui.";
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      alert("O arquivo já foi baixado no seu dispositivo. O WhatsApp será aberto, por favor anexe o arquivo PDF manualmente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center relative">
          <button 
            onClick={handleShareApp}
            className="absolute top-0 right-0 p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors hidden sm:flex items-center gap-2 text-sm font-medium"
            title="Compartilhar Link do Formulário"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden md:inline">Compartilhar Link</span>
          </button>

          {/* Logo Fixo no Cabeçalho */}
          <div className="mb-4">
            <img 
              src={INSTITUTIONAL_LOGO} 
              alt="Logo Institucional" 
              className="w-20 h-20 object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            UniBadge Cadastro Digital
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Preencha todos os campos obrigatórios para gerar seu documento.
          </p>
          
          <button 
            onClick={handleShareApp}
            className="mt-4 flex sm:hidden items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-full text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar Formulário
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-10">
          <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Ficha de Cadastro Digital
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Nome Completo *"
                  name="fullName"
                  placeholder="Nome do Universitário ou Funcionário"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="CPF *"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleInputChange}
                maxLength={14}
                required
              />

              <Select
                label="Cidade / Distrito *"
                name="cityDistrict"
                options={CITIES}
                value={formData.cityDistrict}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-span-1">
              <Input
                label="Endereço Completo (Rua e Bairro) *"
                name="address"
                placeholder="Ex: Rua São José, 123, Bairro Centro"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Vínculo e Transporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Instituição / Órgão *"
                  name="institution"
                  options={INSTITUTIONS}
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                />

                <Select
                  label="Curso / Cargo *"
                  name="courseRole"
                  options={COURSES_ROLES}
                  value={formData.courseRole}
                  onChange={handleInputChange}
                  required
                />

                <Select
                  label="Ponto de Embarque *"
                  name="boardingPoint"
                  options={BOARDING_POINTS}
                  value={formData.boardingPoint}
                  onChange={handleInputChange}
                  required
                />

                <Select
                  label="ÔNIBUS/MOTORISTA (IDA) *"
                  name="busDriverGo"
                  options={BUS_DRIVERS_GO}
                  value={formData.busDriverGo}
                  onChange={handleInputChange}
                  required
                />

                <div className="col-span-1 md:col-span-2">
                  <Select
                    label="Turno *"
                    name="shift"
                    options={SHIFTS}
                    value={formData.shift}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Documentação e Fotos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Face Photo */}
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <label className="text-sm font-bold text-slate-700 mb-3 text-center">Foto de Rosto *</label>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md mb-4 flex items-center justify-center shrink-0">
                    {formData.photoPreviewUrl ? (
                      <img src={formData.photoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg"
                    ref={faceFileInputRef}
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    required
                  />
                </div>

                {/* Declaration File */}
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <label className="text-sm font-bold text-slate-700 mb-3 text-center">Declaração (Matrícula ou Serviço) *</label>
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-white bg-white shadow-md mb-4 flex items-center justify-center shrink-0">
                    {formData.declarationPreviewUrl ? (
                      <img src={formData.declarationPreviewUrl} alt="Preview Declaração" className="w-full h-full object-cover" />
                    ) : (
                      <FileImage className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg"
                    ref={declarationFileInputRef}
                    onChange={(e) => handleFileChange(e, 'declarationFile')}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
                    required
                  />
                  <p className="mt-2 text-[10px] text-slate-500 text-center uppercase font-medium">Somente JPEG</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white transition-all
                  ${loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando Documento...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 mr-2" />
                    Gerar e Baixar PDF Completo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm pb-8">
          <p>© {new Date().getFullYear()} UniBadge. Todos os direitos reservados.</p>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Cadastro Concluído!</h3>
              <p className="text-slate-600 mb-6">
                Seu PDF com todas as informações e fotos foi gerado. Agora, basta compartilhá-lo via WhatsApp.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleShareFile}
                  className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar PDF via WhatsApp
                </button>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;