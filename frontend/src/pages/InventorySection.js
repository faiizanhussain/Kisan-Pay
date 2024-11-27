import React, { useState } from 'react';
import axios from 'axios';

const InventorySection = ({ 
  profile, 
  inventoryItems, 
  navigate, 
  setInventoryItems 
}) => {
  const [productName, setProductName] = useState('');   
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [inventoryMessage, setInventoryMessage] = useState('');
  const [inventoryError, setInventoryError] = useState('');

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

  return (
    <div className="section">
      <h2 className="section-title">Your Inventory</h2>

      {/* Add Product Form */}
      <form className="form" onSubmit={handleAddToInventory}>
        <input
          type="text"
          className="form-input"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Price (PKR)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Add to Inventory
        </button>
      </form>
      {inventoryMessage && <p className="success-message">{inventoryMessage}</p>}
      {inventoryError && <p className="error-message">{inventoryError}</p>}

      {/* Inventory Items Table */}
      {inventoryItems.length > 0 ? (
        <table className="data-table">
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
        <p>No items in inventory.</p>
      )}
    </div>
  );
};

export default InventorySection;