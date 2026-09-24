import toast from 'react-hot-toast';

export const showStockToast = (stock: number, existingInCart?: number) => {
  let message = `Only ${stock} item${stock === 1 ? '' : 's'} available in stock`;
  if (stock <= 0) {
    message = 'This product is currently out of stock';
  } else if (existingInCart && existingInCart >= stock) {
    message = `Only ${stock} item${stock === 1 ? '' : 's'} available in stock (you have ${existingInCart} in cart)`;
  }

  toast(message, {
    id: `stock-warning-${stock}`,
    icon: '⚠️',
    duration: 3500,
    style: {
      borderRadius: '16px',
      background: '#fff7ed',
      color: '#c2410c',
      border: '1.5px solid #f97316',
      padding: '12px 18px',
      fontWeight: '700',
      fontSize: '13.5px',
      boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.3)',
    },
  });
};
