// Import necessary modules and hooks
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  // State variables
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [receiverAccount, setReceiverAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [loading, setLoading] =useState(true);
  const [profile, setProfile] = useState(null);

  // New state variables for inventory management
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [inventoryMessage, setInventoryMessage] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);

  // State variables for purchase functionality
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // State variable for orders
  const [orders, setOrders] = useState([]);

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
        setError('Failed to fetch account data');
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [navigate]);

  const handleCreateAccount = async () => {
    const cust_id = localStorage.getItem('cust_id');

    if (!cust_id) {
      alert('Customer ID is missing. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/customers/create-account', { cust_id });
      alert(response.data.message);
      setAccountExists(true);
      setBalance(0);
    } catch (err) {
      console.error('Error creating account:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to create account');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!receiverAccount || parseFloat(transferAmount) <= 0) {
      setError('Please provide valid receiver account and amount');
      return;
    }

    try {
      const cust_id = localStorage.getItem('cust_id');
      const response = await axios.post('http://localhost:5000/api/customers/transfer', {
        cust_id,
        receiver_account: receiverAccount,
        amount: parseFloat(transferAmount),
      });
      setMessage(response.data.message);
      setReceiverAccount('');
      setTransferAmount('');

      // Refresh balance and transactions
      const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
        params: { cust_id },
      });
      setBalance(balanceResponse.data.balance);

      const transactionsResponse = await axios.get('http://localhost:5000/api/customers/transactions', {
        params: { cust_id },
      });
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    }
  };

  // Function to handle adding product to inventory
  const handleAddToInventory = async (e) => {
    e.preventDefault();
    setInventoryMessage('');
    setInventoryError('');

    const cust_id = localStorage.getItem('cust_id');

    if (!cust_id) {
      alert('Customer ID is missing. Please log in again.');
      navigate('/login');
      return;
    }

    if (!productName || !quantity || !price) {
      setInventoryError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/customers/inventory/add', {
        cust_id,
        product_name: productName,
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });
      setInventoryMessage(response.data.message);
      // Reset form fields
      setProductName('');
      setQuantity('');
      setPrice('');

      // Refresh inventory items
      const inventoryResponse = await axios.get('http://localhost:5000/api/customers/inventory', {
        params: { cust_id },
      });
      setInventoryItems(inventoryResponse.data);
    } catch (err) {
      setInventoryError(err.response?.data?.message || 'Failed to add product to inventory');
    }
  };

  // Function to handle purchase click
  const handlePurchaseClick = (item) => {
    setSelectedProduct(item);
    setShowPurchaseForm(true);
    setPurchaseQuantity('');
    setPurchaseError('');
    setPurchaseMessage('');
  };

  // Function to handle purchase submission
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
    <div>
      <h1>Customer Dashboard</h1>
      {accountExists ? (
        <>
          <h2>Balance</h2>
          <p>{balance !== null ? `${balance} PKR` : 'Loading...'}</p>

          <h2>Profile Details</h2>
          {profile ? (
            <ul>
              <li>First Name: {profile.f_name}</li>
              <li>Last Name: {profile.l_name}</li>
              <li>Email: {profile.email}</li>
              <li>Phone: {profile.phone}</li>
              <li>CNIC: {profile.cnic}</li>
              <li>Username: {profile.u_name}</li>
              <li>Role: {profile.role}</li>
            </ul>
          ) : (
            <p>Loading profile details...</p>
          )}

          {/* Seller Inventory Management */}
          {profile && profile.role === 'Seller' && (
            <>
              <h2>Add Product to Inventory</h2>
              <form onSubmit={handleAddToInventory}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Price (PKR)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <button type="submit">Add to Inventory</button>
              </form>
              {inventoryMessage && <p style={{ color: 'green' }}>{inventoryMessage}</p>}
              {inventoryError && <p style={{ color: 'red' }}>{inventoryError}</p>}

              <h2>Your Inventory</h2>
              {inventoryItems.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Inventory ID</th>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item.inventory_id}>
                        <td>{item.inventory_id}</td>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>You have no items in your inventory.</p>
              )}
            </>
          )}

          {/* Buyer Product Listing and Purchase */}
          {profile && profile.role === 'Buyer' && (
            <>
              <h2>Available Products</h2>
              {purchaseMessage && <p style={{ color: 'green' }}>{purchaseMessage}</p>}
              {purchaseError && <p style={{ color: 'red' }}>{purchaseError}</p>}
              {inventoryItems.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Inventory ID</th>
                      <th>Product Name</th>
                      <th>Quantity Available</th>
                      <th>Price (PKR)</th>
                      <th>Seller</th>
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
                          {item.seller_first_name} {item.seller_last_name}
                        </td>
                        <td>
                          <button onClick={() => handlePurchaseClick(item)}>Buy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No products available.</p>
              )}

              {/* Purchase Modal or Form */}
              {showPurchaseForm && selectedProduct && (
                <div className="modal">
                  <h3>Purchase {selectedProduct.product_name}</h3>
                  <form onSubmit={handlePurchase}>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={purchaseQuantity}
                      onChange={(e) => setPurchaseQuantity(e.target.value)}
                      min="1"
                      max={selectedProduct.quantity}
                      required
                    />
                    <button type="submit">Confirm Purchase</button>
                    <button type="button" onClick={() => setShowPurchaseForm(false)}>
                      Cancel
                    </button>
                  </form>
                  {purchaseError && <p style={{ color: 'red' }}>{purchaseError}</p>}
                </div>
              )}

              <h2>Your Orders</h2>
              {orders.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price per Unit (PKR)</th>
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
                        <td>{order.price}</td>
                        <td>{order.item_total}</td>
                        <td>
                          {order.seller_first_name} {order.seller_last_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>You have no orders.</p>
              )}
            </>
          )}

          <h2>Money Transfer</h2>
          <form onSubmit={handleTransfer}>
            <input
              type="text"
              placeholder="Receiver Account Number"
              value={receiverAccount}
              onChange={(e) => setReceiverAccount(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount (PKR)"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              required
            />
            <button type="submit">Transfer</button>
          </form>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <h2>Transaction History</h2>
          {transactions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transaction_id}>
                    <td>{txn.transaction_id}</td>
                    <td>{txn.sender_id}</td>
                    <td>{txn.receiver_id}</td>
                    <td>{txn.amount} PKR</td>
                    <td>{new Date(txn.date_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found</p>
          )}
        </>
      ) : (
        <>
          <p>No account found</p>
          <button onClick={handleCreateAccount}>Create Account</button>
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;
