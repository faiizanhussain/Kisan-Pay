// Import statements
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import '../styles/AdminDashboard.css';


const AdminDashboard = () => {
  // Existing state variables                                                                                                                                                                                                                                             
  const [custId, setCustId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);

  // State variables for products
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [inventories, setInventories] = useState([]);
  const [orders, setOrders] = useState([]);

  // State variables for editing a product
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(''); // For dropdown selection


  const [activeSection, setActiveSection] = useState('addMoney');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all required data in parallel using Promise.all
        const [
          transactionRes,
          customerRes,
          loanRes,
          productRes,
          inventoryRes,
          orderRes,
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/transactions'),
          axios.get('http://localhost:5000/api/admin/customers'),
          axios.get('http://localhost:5000/api/loans'),
          axios.get('http://localhost:5000/api/admin/products'),
          axios.get('http://localhost:5000/api/admin/inventories'),
          axios.get('http://localhost:5000/api/admin/orders'),
        ]);

        // Set the state variables with the fetched data
        setTransactions(transactionRes.data);
        setCustomers(customerRes.data);
        setLoans(loanRes.data);
        setProducts(productRes.data); // Admin products for dropdown
        setInventories(inventoryRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data); // Products for the seller dropdown
      } catch (err) {
        console.error('Error fetching products for dropdown:', err.message);
      }
    };

    fetchData();
  }, []);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/add-money',
        {
          cust_id: parseInt(custId),
          amount: parseFloat(amount),
        }
      );
      alert(response.data.message);
      setCustId('');
      setAmount('');
    } catch (err) {
      alert('Failed to add money.');
    }
  };

  const handleLoanApproval = async (loanId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/loans/${loanId}/${status}`
      );
      alert(`Loan ${status} successfully!`);
      setLoans(
        loans.map((loan) =>
          loan.loan_id === loanId ? { ...loan, status } : loan
        )
      );
    } catch (err) {
      alert('Failed to update loan status.');
    }
  };

  // Function to handle adding a product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/add-product',
        {
          product_name: productName,
          description: description,
          base_price: parseFloat(basePrice),
        }
      );
      alert(response.data.message);
      // Reset form fields
      setProductName('');
      setDescription('');
      setBasePrice('');
      // Update products list
      setProducts([response.data.product, ...products]);
    } catch (err) {
      alert('Failed to add product.');
    }
  };

  // Function to handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/products/${productId}`);
        alert('Product deleted successfully');

        // Update the products list
        setProducts(products.filter((product) => product.product_id !== productId));
      } catch (err) {
        console.error('Error deleting product:', err.response?.data?.message || err.message);
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  // Function to handle when the Edit button is clicked
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    // Pre-fill the form with the current product details
    setEditProductName(product.product_name);
    setEditDescription(product.description || '');
    setEditBasePrice(product.base_price);
  };

  // Function to handle updating the product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/products/${editingProduct.product_id}`,
        {
          product_name: editProductName,
          description: editDescription,
          base_price: parseFloat(editBasePrice),
        }
      );
      alert(response.data.message);

      // Update the products list
      setProducts(
        products.map((product) =>
          product.product_id === editingProduct.product_id
            ? response.data.product
            : product
        )
      );

      // Reset the edit form
      setEditingProduct(null);
      setEditProductName('');
      setEditDescription('');
      setEditBasePrice('');
    } catch (err) {
      console.error('Error updating product:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button className="tab-btn" onClick={() => setActiveSection('addMoney')}>Add Money</button>
        <button className="tab-btn" onClick={() => setActiveSection('manageProducts')}>Manage Products</button>
        <button className="tab-btn" onClick={() => setActiveSection('transactions')}>Transactions</button>
        <button className="tab-btn" onClick={() => setActiveSection('inventories')}>Inventories</button>
        <button className="tab-btn" onClick={() => setActiveSection('orders')}>Orders</button>
        <button className="tab-btn" onClick={() => setActiveSection('loanRequests')}>Loan Requests</button>
      </div>

      {/* Conditional Rendering Based on Active Section */}
      {activeSection === 'addMoney' && (
        <section className="section">
          <h2 className="section-title">Add Money to Customer Account</h2>
          <form className="form" onSubmit={handleAddMoney}>
            <input
              className="form-input"
              type="text"
              placeholder="Customer ID"
              value={custId}
              onChange={(e) => setCustId(e.target.value)}
              required
            />
            <input
              className="form-input"
              type="number"
              placeholder="Amount (PKR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Add Money
            </button>
          </form>
        </section>
      )}

      {activeSection === 'manageProducts' && (
        <section className="section">
          <h2 className="section-title">Manage Products</h2>

          {/* Form to Add a New Product */}
          <form className="form" onSubmit={handleAddProduct}>
            <div className="mb-4">
              <label htmlFor="productName" className="block text-gray-700 font-medium mb-2">
                Product Name
              </label>
              <input
                id="productName"
                className="form-input"
                type="text"
                placeholder="Enter Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                className="form-input"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="basePrice" className="block text-gray-700 font-medium mb-2">
                Base Price (PKR)
              </label>
              <input
                id="basePrice"
                className="form-input"
                type="number"
                placeholder="Enter Base Price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Product
            </button>
          </form>

          {/* Product List */}
          <h3 className="sub-title">Product List</h3>
          {products.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Base Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td>{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.description || 'N/A'}</td>
                    <td>{product.base_price} PKR</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteProduct(product.product_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No products available.</p>
          )}
        </section>
      )}


      {activeSection === 'transactions' && (
        <section className="section">
          <h2 className="section-title">All Transactions</h2>
          {transactions.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{transaction.transaction_id}</td>
                    <td>{transaction.sender_id}</td>
                    <td>{transaction.receiver_id}</td>
                    <td>{transaction.amount} PKR</td>
                    <td>
                      {format(
                        new Date(transaction.date_time),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No transactions available.</p>
          )}
        </section>
      )}

      {activeSection === 'inventories' && (
        <section className="section">
          <h2 className="section-title">All Inventories</h2>
          {inventories.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inventory ID</th>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((inventory) => (
                  <tr key={inventory.inventory_id}>
                    <td>{inventory.inventory_id}</td>
                    <td>{inventory.supplier_id}</td>
                    <td>
                      {inventory.supplier_first_name}{' '}
                      {inventory.supplier_last_name}
                    </td>
                    <td>{inventory.product_name}</td>
                    <td>{inventory.quantity}</td>
                    <td>{inventory.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No inventories available.</p>
          )}
        </section>
      )}

      {activeSection === 'orders' && (
        <section className="section">
          <h2 className="section-title">All Orders</h2>
          {orders.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Buyer ID</th>
                  <th>Buyer Name</th>
                  <th>Supplier ID</th>
                  <th>Supplier Name</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price per Unit (PKR)</th>
                  <th>Total Price (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_detail_id}>
                    <td>{order.order_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>{order.buyer_id}</td>
                    <td>
                      {order.buyer_first_name} {order.buyer_last_name}
                    </td>
                    <td>{order.supplier_id}</td>
                    <td>
                      {order.supplier_first_name} {order.supplier_last_name}
                    </td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.price}</td>
                    <td>{order.item_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No orders available.</p>
          )}
        </section>
      )}

      {activeSection === 'loanRequests' && (
        <section className="section">
          <h2 className="section-title">Loan Requests</h2>
          {loans.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Account Number</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.loan_id}>
                    <td>{loan.loan_id}</td>
                    <td>{loan.acc_no}</td>
                    <td>{loan.loan_amt} PKR</td>
                    <td>{loan.status || 'Pending'}</td>
                    <td>
                      {loan.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              handleLoanApproval(loan.loan_id, 'approve')
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() =>
                              handleLoanApproval(loan.loan_id, 'reject')
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No loan requests available.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;