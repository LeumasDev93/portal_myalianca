"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import IconContactWhite from "@/assets/Icones/Contactar_Icone.png";
import IconContactBlue from "@/assets/Icones/Contactar_Icone.svg";
import { useUserProfile } from "@/hooks/useUserProfile";

const CONTACT_LINK =
  process.env.NEXT_PUBLIC_CONTACT_URL ?? "https://wa.me/2389965580";

export default function FloatingSupportButtons() {
	const { profile } = useUserProfile();
	const [isSimulateOpen, setIsSimulateOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [subject, setSubject] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('left');
	const popupRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	
	const whatsappUrl = CONTACT_LINK;
	const qrCodeUrl = `https://quickchart.io/qr?size=140&text=${encodeURIComponent(whatsappUrl)}`;

	// Tópicos baseados nos menus disponíveis
	const topics = [
		"Apólice",
		"Sinistros",
		"Recibos & Pagamentos",
		"Ocorrências",
		"Simular & Contratar",
		"Agências",
		"Dashboard",
		"Gestão de SOAT",
		"Outro",
	];

	// Ajustar posição do popup para não ficar cortado
	useEffect(() => {
		const adjustPopupPosition = () => {
			if (isSimulateOpen && popupRef.current && buttonRef.current) {
				const button = buttonRef.current;
				const rect = button.getBoundingClientRect();
				const popupWidth = window.innerWidth < 768 ? 320 : 400; // largura do popup
				
				// Verificar se há espaço à esquerda do botão
				if (rect.left < popupWidth + 20) {
					// Não há espaço suficiente à esquerda, mostrar à direita
					setPopupPosition('right');
				} else {
					// Há espaço à esquerda, mostrar à esquerda
					setPopupPosition('left');
				}
			}
		};

		if (isSimulateOpen) {
			adjustPopupPosition();
			window.addEventListener('resize', adjustPopupPosition);
		}

		return () => {
			window.removeEventListener('resize', adjustPopupPosition);
		};
	}, [isSimulateOpen]);

	// Fechar popup ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
				setIsSimulateOpen(false);
				setError(null);
				setSuccess(false);
				setMessage("");
				setSubject("");
			}
		};

		if (isSimulateOpen) {
			// Adicionar um pequeno delay para evitar fechar imediatamente ao abrir
			setTimeout(() => {
				document.addEventListener('mousedown', handleClickOutside);
			}, 100);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSimulateOpen]);

	const handleContactClick = () => {
		if (whatsappUrl) {
			window.open(whatsappUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Limpar estados anteriores
		setError(null);
		setSuccess(false);
		
		if (!subject) {
			setError("Por favor, selecione um assunto.");
			return;
		}
		
		if (!message.trim()) {
			setError("Por favor, digite uma mensagem.");
			return;
		}

		if (!profile?.user?.id) {
			setError("Erro: Usuário não identificado. Por favor, faça login novamente.");
			return;
		}
		
		setIsSending(true);
		
		try {
			// Chamar a API de envio de mensagem
			const response = await fetch('/api/send-message', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					assunto: subject,
					conteudo: message.trim(),
					user_id: profile.user.id,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
				throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Mensagem enviada com sucesso:", data);
			
			// Mostrar sucesso
			setSuccess(true);
			setError(null);
			
			// Limpar formulário
			setMessage("");
			setSubject("");
			
			// Fechar popup após 2 segundos
			setTimeout(() => {
				setIsSimulateOpen(false);
				setSuccess(false);
			}, 2000);
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			const errorMessage = error instanceof Error ? error.message : "Erro ao enviar mensagem. Tente novamente.";
			setError(errorMessage);
			setSuccess(false);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="fixed top-1/2 -translate-y-1/2 md:top-[50%] right-0 z-[1000]">
			<div className="relative">
				<button
					ref={buttonRef}
					onClick={() => {
						setIsSimulateOpen(!isSimulateOpen);
						if (isSimulateOpen) {
							// Limpar estados ao fechar
							setError(null);
							setSuccess(false);
							setMessage("");
							setSubject("");
						}
					}}
					className="relative p-4 md:p-4 bg-blue-950 hover:bg-white hover:border border-blue-950 rounded-tl-xl rounded-bl-none shadow-lg transition-all duration-300 ease-in-out w-10 h-10 md:w-20 md:h-20 flex flex-col items-center justify-center group"
				>
					{isSimulateOpen && (
						<div 
							className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 z-[51] transition-colors duration-300 ${
								popupPosition === 'left' 
									? 'left-[-8px] border-r-[8px] border-r-blue-950 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent group-hover:border-r-white' 
									: 'right-[-8px] border-l-[8px] border-l-blue-950 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent group-hover:border-l-white'
							}`}
							style={{
								filter: 'drop-shadow(1px 0 0 rgba(0,0,0,0.1))'
							}}
						/>
					)}
					<div className="flex items-center justify-center w-4 h-3 md:w-6 md:h-6 2xl:w-8 2xl:h-8">
						<MessageSquare className="w-4 h-4 md:w-6 md:h-6 2xl:w-8 2xl:h-8 text-white group-hover:text-blue-950 transition-colors duration-300" />
					</div>
					<span className="2xl:text-xs text-[10px] text-white mt-1 hidden md:flex transition-colors duration-300 group-hover:text-[#002256]">
						Mensagens
					</span>
				</button>

				{isSimulateOpen && (
					<div 
						ref={popupRef}
						className={`absolute 2xl:bottom-0 bottom-[-100px] w-[320px] md:w-[400px] max-w-[calc(100vw-2rem)] z-50 ${
							popupPosition === 'left' 
								? 'right-full mr-2' 
								: 'left-full ml-2'
						}`}
					>
						<div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
						<div className="bg-blue-950 text-white p-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold">Envie sua dúvida</h3>
							<button
								onClick={() => {
									setIsSimulateOpen(false);
									setError(null);
									setSuccess(false);
									setMessage("");
									setSubject("");
								}}
								className="text-white cursor-pointer hover:text-gray-200 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleMessageSubmit} className="p-4 space-y-4">
							{/* Mensagem de erro */}
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
									{error}
								</div>
							)}
							
							{/* Mensagem de sucesso */}
							{success && (
								<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
									Mensagem enviada com sucesso!
								</div>
							)}
							
							<div>
								<label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
									Assunto *
								</label>
								<select
									id="subject"
									name="subject"
									value={subject}
									onChange={(e) => {
										setSubject(e.target.value);
										setError(null);
									}}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent bg-white"
								>
									<option value="">Selecione um assunto</option>
									{topics.map((topic) => (
										<option key={topic} value={topic}>
											{topic}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
									Mensagem *
								</label>
								<textarea
									id="message"
									name="message"
									value={message}
									onChange={(e) => {
										setMessage(e.target.value);
										setError(null);
									}}
									required
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent resize-none"
									placeholder="Digite sua mensagem aqui..."
								/>
							</div>

							<button
								type="submit"
								disabled={isSending}
								className="w-full bg-blue-950 text-white py-2 px-4 rounded-md hover:bg-blue-950/70 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
										<span>Enviando...</span>
									</>
								) : (
									<>
										<Send className="w-4 h-4" />
										<span>Enviar Mensagem</span>
									</>
								)}
							</button>
						</form>
						</div>
					</div>
				)}
			</div>

			{/* Contact button */}
			<button 
				onClick={handleContactClick}
				className="relative group p-4 md:p-4 bg-[#B7021C] hover:bg-white hover:border border-[#B7021C]/80 rounded-bl-xl hover:rounded-bl-none rounded-tl-none shadow-lg transition-all duration-300 ease-in-out w-10 h-10 md:w-20 md:h-20 flex flex-col items-center justify-center"
			>
				{whatsappUrl && (
					<div className="hidden absolute max-w-[350px] space-x-2 border border-[#B7021C]/80 right-full md:flex items-center bg-[#B7021C] text-white px-8 py-2 rounded-l-2xl opacity-0 translate-x-10 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none">
						<Image
							src={qrCodeUrl}
							alt="QR code para WhatsApp"
							width={70}
							height={62}
							className="w-[70px] h-[62px] rounded-lg bg-white p-1"
							unoptimized
						/>
						<span className="text-sm font-medium text-left w-60">
							Para falar conosco<br />
							escaneie o QR code ou<br />
							clique no botão.
						</span>
					</div>
				)}
				
				<div className="flex items-center justify-center md:relative w-4 h-4 md:w-6 md:h-6 2xl:w-8 2xl:h-8">
					<Image
						src={IconContactWhite}
						alt="Contactar"
						className="absolute w-4 h-4 md:w-6 md:h-6 2xl:w-8 2xl:h-8 transition-opacity duration-300 opacity-100 group-hover:opacity-0"
					/>
					<Image
						src={IconContactBlue}
						alt="Contactar Hover"
						className="absolute w-4 h-4 md:w-6 md:h-6 2xl:w-8 2xl:h-8 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
					/>
				</div>
				<span className="2xl:text-xs text-[10px] text-white mt-1 hidden md:flex transition-colors duration-300 group-hover:text-[#002256]">
					Contactar
				</span>
			</button>

		</div>
	);
}