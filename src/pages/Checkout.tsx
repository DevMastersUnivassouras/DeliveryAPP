import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cart';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Não autenticado');

      // Gera um número aleatório para o pedido (entre 1000 e 9999)
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;

      // Atualiza o perfil do usuário com informações de entrega
      await supabase
        .from('profiles')
        .update({ address, phone })
        .eq('id', user.data.user.id);

      // Cria o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.data.user.id,
            total: total(),
            status: 'pendente',
            order_number: orderNumber,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Cria os itens do pedido
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/payment/${order.id}`);
    } catch (error) {
      toast.error('Falha ao criar pedido. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Informações de Entrega</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Endereço de Entrega
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
          />
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
            <span>Total:</span>
            <span>R$ {total().toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Continuar para Pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
}