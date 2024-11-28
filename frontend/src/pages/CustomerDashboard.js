import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomerDashboard.css';

// Import all section components
import ProfileSection from './ProfileSection';
import BalanceSection from './BalanceSection';
import TransactionsSection from './TransactionsSection';
import InventorySection from './InventorySection';
import MoneyTransferSection from './MoneyTransferSection';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  // State variables
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accountExists, setAccountExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');
  const [orders, setOrders] = useState([]);

  // Marketplace and Purchase-related states
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role) {
      navigate('/login');
      return;
    }

    const fetchAccountData = async () => {
      try {
        const cust_id = localStorage.getItem('cust_id');
        if (!cust_id) {
          alert('Customer ID not found. Please log in again.');
          navigate('/login');
          return;
        }

        // Fetch balance
        const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
          params: { cust_id },
        });
        setBalance(balanceResponse.data.balance);
        setAccountExists(true);

        // Fetch transactions
        const transactionsResponse = await axios.get('http://localhost:5000/api/customers/transactions', {
          params: { cust_id },
        });
        setTransactions(transactionsResponse.data);

        // Fetch profile details
        const profileResponse = await axios.get('http://localhost:5000/api/customers/profile', {
          params: { cust_id },
        });
        setProfile(profileResponse.data);

        // Fetch inventory items based on role
        if (profileResponse.data.role === 'Seller') {
          // Fetch seller's own inventory
          const inventoryResponse = await axios.get('http://localhost:5000/api/customers/inventory', {
            params: { cust_id },
          });
          setInventoryItems(inventoryResponse.data);
        } else if (profileResponse.data.role === 'Buyer') {
          // Fetch all available inventory items for buyers
          const inventoryResponse = await axios.get('http://localhost:5000/api/customers/inventory/all');
          setInventoryItems(inventoryResponse.data);

          // Fetch buyer's orders
          const ordersResponse = await axios.get('http://localhost:5000/api/customers/orders', {
            params: { buyer_id: cust_id },
          });
          setOrders(ordersResponse.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchAccountData:', err.message || err.response?.data?.message);
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [navigate]);

  const handleTransferComplete = async () => {
    const cust_id = localStorage.getItem('cust_id');
    try {
      // Refresh balance
      const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
        params: { cust_id },
      });
      setBalance(balanceResponse.data.balance);

      // Refresh transactions
      const transactionsResponse = await axios.get('http://localhost:5000/api/customers/transactions', {
        params: { cust_id },
      });
      setTransactions(transactionsResponse.data);
    } catch (err) {
      console.error('Error refreshing data:', err.message);
    }
  };

  const handlePurchaseClick = (item) => {
    setSelectedProduct(item);
    setShowPurchaseForm(true);
    // Previous code continues...
    setPurchaseQuantity('');
    setPurchaseError('');
    setPurchaseMessage('');
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setPurchaseError('');
    setPurchaseMessage('');

    const quantity = parseInt(purchaseQuantity);

    if (isNaN(quantity) || quantity <= 0 || quantity > selectedProduct.quantity) {
      setPurchaseError('Invalid quantity');
      return;
    }

    try {
      const buyer_id = localStorage.getItem('cust_id');
      const response = await axios.post('http://localhost:5000/api/customers/purchase', {
        buyer_id,
        inventory_id: selectedProduct.inventory_id,
        quantity,
      });
      setPurchaseMessage(response.data.message);
      setShowPurchaseForm(false);

      // Refresh inventory items
      const inventoryResponse = await axios.get('http://localhost:5000/api/customers/inventory/all');
      setInventoryItems(inventoryResponse.data);

      // Refresh balance
      const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
        params: { cust_id: buyer_id },
      });
      setBalance(balanceResponse.data.balance);

      // Refresh orders
      const ordersResponse = await axios.get('http://localhost:5000/api/customers/orders', {
        params: { buyer_id },
      });
      setOrders(ordersResponse.data);
    } catch (err) {
      setPurchaseError(err.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="customer-dashboard-container">
      <h1 className="dashboard-title">Customer Dashboard</h1>

      {/* Navigation Menu */}
      <div className="navigation-menu">
        <button
          className={`nav-button ${activeSection === 'profile' && 'active'}`}
          onClick={() => setActiveSection('profile')}
        >
          Profile
        </button>
        <button
          className={`nav-button ${activeSection === 'balance' && 'active'}`}
          onClick={() => setActiveSection('balance')}
        >
          Balance
        </button>
        <button
          className={`nav-button ${activeSection === 'transactions' && 'active'}`}
          onClick={() => setActiveSection('transactions')}
        >
          Transactions
        </button>
        {profile?.role === 'Seller' && (
          <button
            className={`nav-button ${activeSection === 'inventory' && 'active'}`}
            onClick={() => setActiveSection('inventory')}
          >
            Inventory
          </button>
        )}
        {profile?.role === 'Buyer' && (
          <>
            <button
              className={`nav-button ${activeSection === 'marketplace' && 'active'}`}
              onClick={() => setActiveSection('marketplace')}
            >
              Marketplace
            </button>
            <button
              className={`nav-button ${activeSection === 'orders' && 'active'}`}
              onClick={() => setActiveSection('orders')}
            >
              Orders
            </button>
          </>
        )}
        <button
          className={`nav-button ${activeSection === 'transfer' && 'active'}`}
          onClick={() => setActiveSection('transfer')}
        >
          Money Transfer
        </button>
      </div>

      {/* Conditional Rendering of Sections */}
      {activeSection === 'profile' && <ProfileSection profile={profile} />}
      
      {activeSection === 'balance' && (
        <BalanceSection 
          accountExists={accountExists}
          balance={balance}
          navigate={navigate}
          setAccountExists={setAccountExists}
          setBalance={setBalance}
        />
      )}
      
      {activeSection === 'transactions' && (
        <TransactionsSection transactions={transactions} />
      )}
      
      {activeSection === 'inventory' && profile?.role === 'Seller' && (
        <InventorySection 
          profile={profile}
          inventoryItems={inventoryItems}
          navigate={navigate}
          setInventoryItems={setInventoryItems}
        />
      )}
      
      {activeSection === 'transfer' && (
        <MoneyTransferSection 
          navigate={navigate} 
          onTransferComplete={handleTransferComplete} 
        />
      )}

      {/* Marketplace Section for Buyers */}
      {activeSection === 'marketplace' && profile?.role === 'Buyer' && (
        <div className="section">
          <h2 className="section-title">Marketplace</h2>
          {inventoryItems.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inventory ID</th>
                  <th>Product Name</th>
                  <th>Quantity Available</th>
                  <th>Price (PKR)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.inventory_id}>
                    <td>{item.inventory_id}</td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>
                      <button onClick={() => handlePurchaseClick(item)} className="btn btn-primary">
                        Purchase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available for purchase.</p>
          )}

          {/* Purchase Form Modal */}
          {showPurchaseForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>Purchase {selectedProduct.product_name}</h3>
                <form onSubmit={handlePurchase}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quantity"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Confirm Purchase
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPurchaseForm(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </form>
                {purchaseError && <p className="error-message">{purchaseError}</p>}
                {purchaseMessage && <p className="success-message">{purchaseMessage}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buyer Orders Section */}
      {activeSection === 'orders' && profile?.role === 'Buyer' && (
        <div className="section">
          <h2 className="section-title">Your Orders</h2>
          {orders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Price (PKR)</th>
                  <th>Seller</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_detail_id}>
                    <td>{order.order_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.item_total}</td>
                    <td>
                      {order.seller_first_name} {order.seller_last_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No orders available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard; 