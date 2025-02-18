import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { CreditCard, Calendar, Lock } from 'lucide-react';

interface Order {
  id: string;
  order_number: number;
  status: string;
  total: number;
}

const statusMessages = {
  pendente: 'Aguardando pagamento',
  pago: 'Pagamento confirmado',
  preparando: 'Pedido em preparação',
  saiu: 'Saiu para entrega',
  entregue: 'Pedido entregue',
};

export default function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  React.useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        toast.error('Erro ao carregar pedido');
        navigate('/cart');
        return;
      }

      setOrder(data);
    };

    loadOrder();
  }, [orderId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setLoading(true);
    try {
      // Simulação de processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualiza o status do pedido
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pago' })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Pagamento realizado com sucesso!');
      navigate(`/chat/${order.id}`);
    } catch (error) {
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
  };

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Pagamento com Cartão</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Cartão
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={3}
                      className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : `Pagar R$ ${order.total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Status do Pedido</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <p className="font-medium">Pedido #{order.order_number}</p>
              <p className="text-xl font-bold">R$ {order.total.toFixed(2)}</p>
            </div>
            <div className="space-y-6">
              {Object.entries(statusMessages).map(([status, message]) => (
                <div
                  key={status}
                  className={`flex items-center gap-4 ${
                    order.status === status ? 'text-red-500 font-bold' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      order.status === status ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}