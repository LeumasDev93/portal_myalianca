// Exemplo de como integrar o registro de atividades de pagamento
// Este é um componente de exemplo que demonstra como registrar atividades de pagamento

import { usePaymentActivity } from "./activityExamples";

interface PaymentFormProps {
  amount: string;
  productName: string;
  onPaymentSuccess: () => void;
}

export function PaymentFormExample({
  amount,
  productName,
  onPaymentSuccess,
}: PaymentFormProps) {
  const { registerPaymentActivity } = usePaymentActivity();

  const handlePayment = async () => {
    try {
      // Simular processamento de pagamento
      console.log("Processando pagamento...");

      // Aqui você faria a chamada real para a API de pagamento
      // const paymentResponse = await processPayment(amount, productName);

      // Após o pagamento ser bem-sucedido, registrar a atividade
      await registerPaymentActivity(amount, productName);

      onPaymentSuccess();
    } catch (error) {
      console.error("Erro no pagamento:", error);
    }
  };

  return (
    <div>
      <h3>Exemplo de Pagamento</h3>
      <p>Produto: {productName}</p>
      <p>Valor: {amount}</p>
      <button onClick={handlePayment}>Processar Pagamento</button>
    </div>
  );
}

// Exemplo de hook personalizado para pagamentos
export function usePaymentWithActivity() {
  const { registerPaymentActivity } = usePaymentActivity();

  const processPaymentWithActivity = async (paymentData: {
    amount: string;
    productName: string;
    paymentMethod: string;
    invoiceNumber?: string;
  }) => {
    try {
      // 1. Processar o pagamento
      console.log("Processando pagamento:", paymentData);

      // Aqui você faria a chamada real para a API de pagamento
      // const response = await fetch('/api/payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentData)
      // });

      // 2. Registrar a atividade
      await registerPaymentActivity(
        paymentData.amount,
        `${paymentData.productName} - ${paymentData.paymentMethod}`
      );

      return { success: true };
    } catch (error) {
      console.error("Erro no pagamento:", error);
      throw error;
    }
  };

  return { processPaymentWithActivity };
}
