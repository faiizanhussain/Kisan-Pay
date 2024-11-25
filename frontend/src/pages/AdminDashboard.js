// Import statements
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        setProducts(productRes.data);
        setInventories(inventoryRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Existing sections... */}

      <h2>Add Money to Customer Account</h2>
      <form onSubmit={handleAddMoney}>
        <input
          type="text"
          placeholder="Customer ID"
          value={custId}
          onChange={(e) => setCustId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount (PKR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Add Money</button>
      </form>

      {/* Section for adding products */}
      <h2>Add New Product</h2>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          type="number"
          placeholder="Base Price (PKR)"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Display the list of products */}
      <h2>Product List</h2>
      {products.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Base Price</th>
              <th>Actions</th> {/* Added Actions column */}
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
                  <button onClick={() => handleDeleteProduct(product.product_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products available.</p>
      )}

      {/* Existing sections... */}

      {/* Transactions */}
      <h2>All Transactions</h2>
      {/* Transactions table */}
      <table>
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

      {/* All Inventories */}
      <h2>All Inventories</h2>
      {inventories.length > 0 ? (
        <table>
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
                  {inventory.supplier_first_name} {inventory.supplier_last_name}
                </td>
                <td>{inventory.product_name}</td>
                <td>{inventory.quantity}</td>
                <td>{inventory.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No inventories available.</p>
      )}

      {/* All Orders */}
      <h2>All Orders</h2>
      {orders.length > 0 ? (
        <table>
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
        <p>No orders available.</p>
      )}

      {/* Loan Requests */}
      <h2>Loan Requests</h2>
      {/* Loans table */}
      <table>
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
                      onClick={() =>
                        handleLoanApproval(loan.loan_id, 'approve')
                      }
                    >
                      Approve
                    </button>
                    <button
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

      {/* Existing code ends */}
    </div>
  );
};

export default AdminDashboard;
