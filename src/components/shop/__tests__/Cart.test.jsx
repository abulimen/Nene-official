import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Cart from '../Cart';

// Mock ProductImage component
vi.mock('../ui/ProductImage', () => ({
    default: ({ type }) => <img alt={type} src="test.jpg" />
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    X: () => <span>X</span>,
    ShoppingBag: () => <span>ShoppingBag</span>,
    Plus: () => <span>Plus</span>,
    Minus: () => <span>Minus</span>,
    Trash2: () => <span>Trash2</span>
}));

describe('Cart Component', () => {
    const mockCartItems = [
        { id: 1, name: 'Yogurt', price: 500, quantity: 2 },
        { id: 2, name: 'Milk', price: 300, quantity: 1 }
    ];

    it('renders empty cart message when cart is empty', () => {
        render(<Cart cartItems={[]} isOpen={true} onClose={() => { }} />);
        expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
    });

    it('renders cart items when cart is not empty', () => {
        render(<Cart cartItems={mockCartItems} isOpen={true} onClose={() => { }} />);
        expect(screen.getByText('Yogurt')).toBeInTheDocument();
        expect(screen.getByText('Milk')).toBeInTheDocument();
        expect(screen.getByText('₦1,000')).toBeInTheDocument(); // 500 * 2
        expect(screen.getByText('₦300')).toBeInTheDocument(); // 300 * 1
    });

    it('calculates total correctly', () => {
        render(<Cart cartItems={mockCartItems} isOpen={true} onClose={() => { }} />);
        // Total: (500 * 2) + (300 * 1) = 1300
        expect(screen.getByText('₦1,300')).toBeInTheDocument();
    });

    it('calls onUpdateQuantity when +/- buttons are clicked', () => {
        const onUpdateQuantity = vi.fn();
        render(<Cart cartItems={mockCartItems} isOpen={true} onUpdateQuantity={onUpdateQuantity} />);

        const plusButtons = screen.getAllByText('Plus');
        fireEvent.click(plusButtons[0].parentElement); // Click plus for first item
        expect(onUpdateQuantity).toHaveBeenCalledWith(1, 1);

        const minusButtons = screen.getAllByText('Minus');
        fireEvent.click(minusButtons[0].parentElement); // Click minus for first item
        expect(onUpdateQuantity).toHaveBeenCalledWith(1, -1);
    });

    it('calls onRemove when trash button is clicked', () => {
        const onRemove = vi.fn();
        render(<Cart cartItems={mockCartItems} isOpen={true} onRemove={onRemove} />);

        const trashButtons = screen.getAllByText('Trash2');
        fireEvent.click(trashButtons[0].parentElement); // Click trash for first item
        expect(onRemove).toHaveBeenCalledWith(1);
    });

    it('calls onCheckout when checkout button is clicked', () => {
        const onCheckout = vi.fn();
        render(<Cart cartItems={mockCartItems} isOpen={true} onCheckout={onCheckout} />);

        fireEvent.click(screen.getByText('Checkout'));
        expect(onCheckout).toHaveBeenCalled();
    });
});
