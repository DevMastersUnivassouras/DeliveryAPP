import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_admin: boolean;
  order_id: string;
}

export default function Chat() {
  const { orderId } = useParams<{ orderId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        // Adiciona a primeira mensagem automática
        const initialMessage = {
          id: 'initial',
          content: `Olá! Gostaria de acompanhar meu pedido #${orderData.order_number}`,
          created_at: new Date().toISOString(),
          is_admin: false,
          order_id: orderId,
        };
        setMessages([initialMessage]);
      }
    };

    loadOrder();
  }, [orderId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !orderId || loading) return;

    setLoading(true);
    try {
      const message = {
        content: newMessage,
        order_id: orderId,
        is_admin: false,
        created_at: new Date().toISOString(),
      };

      // Simula o envio da mensagem
      await new Promise(resolve => setTimeout(resolve, 500));

      // Adiciona a mensagem localmente
      setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
      setNewMessage('');

      // Simula resposta do admin após 2 segundos
      setTimeout(() => {
        const adminResponse = {
          id: `admin-${Date.now()}`,
          content: 'Olá! Estamos preparando seu pedido com muito carinho. Em breve ele sairá para entrega!',
          created_at: new Date().toISOString(),
          is_admin: true,
          order_id: orderId,
        };
        setMessages(prev => [...prev, adminResponse]);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-red-500 text-white">
          <h2 className="text-xl font-bold">
            Chat do Pedido #{order?.order_number}
          </h2>
        </div>

        <div className="h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.is_admin ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.is_admin
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.is_admin ? 'text-gray-500' : 'text-red-100'
                    }`}
                  >
                    {format(new Date(message.created_at), 'HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}