import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cart';

export default function Navbar() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const user = supabase.auth.getUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            DeliveryAPP
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/chat"
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    0
                  </span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
              >
                <User className="w-5 h-5" />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}