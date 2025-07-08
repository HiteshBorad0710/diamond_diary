import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Login from './components/Login';
import Footer from './components/Footer';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiamond } from '@fortawesome/free-solid-svg-icons';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in based on token
  const token = localStorage.getItem('token');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Helper function to format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const [diamonds, setDiamonds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [newDiamond, setNewDiamond] = useState({
    _id: '',
    shape: '',
    color: '',
    clarity: '',
    carat: '',
    pricePerCarat: '',
    totalCaratPrice: '',
    quantity: '',
    totalAmount: ''
  });
  const [editing, setEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState('diamonds');
  const [addMessage, setAddMessage] = useState('');
  const [addError, setAddError] = useState('');

  // Handle navigation state for active menu
  useEffect(() => {
    const menuState = location.state?.activeMenu;
    if (menuState && menuState === 'add') {
      setActiveMenu('add');
    }
    // Also handle direct navigation to /add
    if (window.location.pathname === '/add') {
      setActiveMenu('add');
    }
  }, [location]);

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
    // Navigate to add diamond page after login
    navigate('/add', { state: { activeMenu: 'add' } });
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    setActiveMenu('add');
  };

  // Load diamonds when component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadDiamonds();
    }
  }, [isLoggedIn]);

  // Load diamonds when active menu changes to diamonds
  useEffect(() => {
    if (isLoggedIn && activeMenu === 'add') {
      loadDiamonds();
    }
  }, [activeMenu, isLoggedIn]);

  // Clear diamonds and error when logging out
  useEffect(() => {
    if (!isLoggedIn) {
      setDiamonds([]);
      setLoadingError('');
    }
  }, [isLoggedIn]);

  // Function to load diamonds from API
  const loadDiamonds = async () => {
    setLoading(true);
    setLoadingError('');
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      if (!token || !email) {
        throw new Error('User not authenticated');
      }
      
      const response = await axios.get('https://backend-or3v.onrender.com/api/diamonds', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { email }
      });
      
      if (Array.isArray(response.data)) {
        setDiamonds(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading diamonds:', error);
      setLoadingError(error.message || 'Failed to load diamonds');
      setDiamonds([]); // Clear diamonds on error
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'add') {
      setEditing(false);
      clearForm();
    } else if (menu === 'diamonds') {
      clearForm();
    }
  };

  // Helper function to clear form
  const clearForm = () => {
    setNewDiamond({
      _id: '',
      shape: '',
      color: '',
      clarity: '',
      carat: '',
      pricePerCarat: '',
      totalCaratPrice: '',
      quantity: '',
      totalAmount: ''
    });
  };

  // Function declarations
  const fetchDiamonds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend-or3v.onrender.com/api/diamonds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetched diamonds:', response.data); // Add logging for debugging
      setDiamonds(response.data);
    } catch (error) {
      console.error('Error fetching diamonds:', error.response?.data || error.message);
    }
  };

  const handleEdit = (diamond) => {
    // Set the form fields with the diamond's data
    setNewDiamond({
      _id: diamond._id,
      shape: diamond.shape,
      color: diamond.color,
      clarity: diamond.clarity,
      carat: diamond.carat,
      pricePerCarat: diamond.pricePerCarat,
      totalCaratPrice: diamond.totalCaratPrice,
      quantity: diamond.quantity,
      totalAmount: diamond.totalAmount
    });
    // Enable edit mode and switch to add menu
    setEditing(true);
    setActiveMenu('add');
  };

  // Update the form when editing a diamond
  useEffect(() => {
    if (editing && diamonds.length > 0) {
      const selectedDiamond = diamonds.find(d => d._id === newDiamond._id);
      if (selectedDiamond) {
        setNewDiamond({
          _id: selectedDiamond._id,
          shape: selectedDiamond.shape,
          color: selectedDiamond.color,
          clarity: selectedDiamond.clarity,
          carat: selectedDiamond.carat,
          pricePerCarat: selectedDiamond.pricePerCarat,
          totalCaratPrice: selectedDiamond.totalCaratPrice,
          quantity: selectedDiamond.quantity,
          totalAmount: selectedDiamond.totalAmount
        });
      }
    }
  }, [editing, diamonds]);

  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this diamond?')) {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        if (!token || !email) {
          throw new Error('User not authenticated');
        }

        const response = await axios.delete(`https://backend-or3v.onrender.com/api/diamonds/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          data: { email }
        });
        console.log('Delete response:', response.data);
        // Remove the deleted diamond from the list immediately
      setDiamonds(prevDiamonds => prevDiamonds.filter(d => d._id !== id));
        setDeleteMessage('Data Deleted successfully!');
        setDeleteError('');
        // Clear message after 3 seconds
        setTimeout(() => {
          setDeleteMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error deleting diamond:', error);
        console.error('Error details:', error.response?.data);
        setDeleteError(`Failed to delete diamond. Error: ${error.response?.data?.message || 'Please try again.'}`);
        setDeleteMessage('');
        // Clear error after 3 seconds
        setTimeout(() => {
          setDeleteError('');
        }, 3000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Parse and validate carat
      const carat = parseFloat(newDiamond.carat);
      if (!carat || isNaN(carat)) {
        alert('Please enter a valid carat value');
        return;
      }

      // Get token and email from localStorage
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      if (!token || !email) {
        throw new Error('User not authenticated');
      }

      // Create diamond data with all fields
      const diamondData = {
        email,
        shape: newDiamond.shape,
        color: newDiamond.color,
        clarity: newDiamond.clarity,
        carat: parseFloat(newDiamond.carat),
        pricePerCarat: parseFloat(newDiamond.pricePerCarat),
        totalCaratPrice: parseFloat(newDiamond.totalCaratPrice),
        quantity: parseFloat(newDiamond.quantity),
        totalAmount: parseFloat(newDiamond.totalAmount),
      };

      // Validate that all required fields are numbers
      if (isNaN(diamondData.carat) || isNaN(diamondData.pricePerCarat)) {
        alert('Please enter valid numbers for Carat and Price per Carat');
        return;
      }

      // Log what we're sending to backend
      console.log('Sending to backend:', diamondData);

      if (editing) {
        // Update existing diamond
        try {
          const response = await axios.put(`https://backend-or3v.onrender.com/api/diamonds/${newDiamond._id}`, diamondData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('Update response:', response.data);
          setEditing(false);
          // Update the specific diamond in the list
          setDiamonds(prevDiamonds => 
            prevDiamonds.map(diamond => 
              diamond._id === newDiamond._id ? { ...diamond, ...diamondData } : diamond
            )
          );
          // Update monthly totals immediately
          setAddMessage('Diamond updated successfully!');
          setTimeout(() => setAddMessage(''), 3000);
          // Force re-render of totals
          setDiamonds(prevDiamonds => [...prevDiamonds]);
          // Update active menu to show the list
          setActiveMenu('diamonds');
        } catch (error) {
          console.error('Update error:', error);
          console.error('Update error details:', error.response?.data);
          setAddError(error.response?.data?.message || 'Failed to update diamond');
          setTimeout(() => setAddError(''), 3000);
          throw error; // Re-throw to be caught by the outer catch
        }
      } else {
        // Add new diamond
        try {
          const response = await axios.post('https://backend-or3v.onrender.com/api/diamonds', diamondData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('Create response:', response.data);
          // Add the new diamond to the list immediately
          setDiamonds(prevDiamonds => [...prevDiamonds, { ...diamondData, _id: response.data._id }]);
          // Update monthly totals immediately
          setAddMessage('Diamond added successfully!');
          setTimeout(() => setAddMessage(''), 3000);
          // Force re-render of totals
          setDiamonds(prevDiamonds => [...prevDiamonds]);
          // Update active menu to show the list
          setActiveMenu('diamonds');
        } catch (error) {
          console.error('Create error:', error);
          console.error('Create error details:', error.response?.data);
          setAddError(error.response?.data?.message || 'Failed to add diamond');
          setTimeout(() => setAddError(''), 3000);
          throw error; // Re-throw to be caught by the outer catch
        }
      }

      setNewDiamond({
        _id: '',
        shape: '',
        color: '',
        clarity: '',
        carat: '',
        pricePerCarat: '',
        totalCaratPrice: '',
        quantity: '',
        totalAmount: '',
      });
      // Load diamonds to update the list and totals
      loadDiamonds();
    } catch (error) {
      console.error('Error saving diamond:', error);
      alert(error.response?.data?.message || 'Failed to save diamond. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Calculate totals when relevant fields change
    if (name === 'pricePerCarat' || name === 'carat') {
      const carat = parseFloat(newDiamond.carat) || 0;
      const pricePerCarat = parseFloat(value);
      const totalCaratPrice = pricePerCarat * carat;

      setNewDiamond({
        ...newDiamond,
        [name]: value,
        pricePerCarat: value,
        totalCaratPrice: totalCaratPrice.toFixed(2),
        totalAmount: ''
      });
    }

    if (name === 'quantity') {
      const quantity = parseFloat(value);
      const totalCaratPrice = (parseFloat(newDiamond.pricePerCarat) || 0) * (parseFloat(newDiamond.carat) || 0);
      const totalAmount = totalCaratPrice * quantity;

      setNewDiamond({
        ...newDiamond,
        [name]: value,
        quantity: value,
        totalCaratPrice: totalCaratPrice.toFixed(2),
        totalAmount: quantity > 0 ? totalAmount.toFixed(2) : ''
      });
    }

    // Handle other fields
    else if (name === 'carat' && value) {
      const carat = parseFloat(value);
      const quantity = parseFloat(newDiamond.quantity);
      const pricePerCarat = parseFloat(newDiamond.pricePerCarat);
      const totalCaratPrice = pricePerCarat * carat;
      const totalAmount = totalCaratPrice * quantity;

      setNewDiamond({
        ...newDiamond,
        [name]: value,
        carat: value,
        totalCaratPrice: totalCaratPrice.toFixed(2),
        totalAmount: quantity > 0 ? totalAmount.toFixed(2) : ''
      });
    } else {
      setNewDiamond({
        ...newDiamond,
        [name]: value
      });
    }
  };

  const calculateMonthlyTotals = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' });

    // Calculate total for current month
    const totalAmount = diamonds.reduce((sum, diamond) => {
      const date = new Date(diamond.dateAdded);
      const isCurrentYear = date.getFullYear() === currentYear;
      const isCurrentMonth = date.getMonth() === currentMonth;
      
      return isCurrentYear && isCurrentMonth ? sum + (parseFloat(diamond.totalAmount) || 0) : sum;
    }, 0);

    return [
      {
        month: currentMonthName,
        year: currentYear,
        totalAmount: totalAmount
      }
    ];
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/add" replace />} />
        <Route path="/add" element={isLoggedIn ? (
          <div className="diamond-inventory">
            <Header 
        activeMenu={activeMenu} 
        handleMenuClick={handleMenuClick} 
        onLogout={handleLogout} 
        userEmail={localStorage.getItem('userEmail') || ''}
      />
            <div className="menu-bar">
              <button
                className={`menu-button ${activeMenu === 'add' ? 'active' : ''}`}
                onClick={() => handleMenuClick('add')}
              >
                Add Diamond
              </button>
              <button
                className={`menu-button ${activeMenu === 'diamonds' ? 'active' : ''}`}
                onClick={() => handleMenuClick('diamonds')}
              >
                View Diamond
              </button>
              <button
                className={`menu-button ${activeMenu === 'totals' ? 'active' : ''}`}
                onClick={() => handleMenuClick('totals')}
              >
                Monthly Totals
              </button>
            </div>
            {activeMenu === 'diamonds' && (
              <div className="diamond-list">
                <h2>Diamond List</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shape</th>
                      <th>Color</th>
                      <th>Clarity</th>
                      <th>Price Per Carat</th>
                      <th>Carat</th>
                      <th>Total Carat Price</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diamonds.map((diamond) => (
                      <tr key={diamond._id}>
                        <td>{formatDate(diamond.dateAdded)}</td>
                        <td>{diamond.shape}</td>
                        <td>{diamond.color}</td>
                        <td>{diamond.clarity}</td>
                        <td>{diamond.pricePerCarat}</td>
                        <td>{diamond.carat}</td>
                        <td>{diamond.totalCaratPrice}</td>
                        <td>{diamond.quantity}</td>
                        <td>{diamond.totalAmount}</td>
                        <td>
                          <button className="edit-btn" onClick={() => handleEdit(diamond)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(diamond._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeMenu === 'totals' && (
              <div className="monthly-totals">
                <h2>Monthly Totals</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateMonthlyTotals().map((item, index) => (
                      <tr key={index}>
                        <td>{`${item.month} ${item.year}`}</td>
                        <td>{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeMenu === 'add' && (
              <div className="form-container">
                <h2>Diamond Diary</h2>
                <form onSubmit={handleSubmit} className="diamond-form">
                  <div className="form-group">
                    <label>Diamond Shape:</label>
                    <select
                      name="shape"
                      value={newDiamond.shape}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Select Shape</option>
                      <option value="Round">Round</option>
                      <option value="Princess">Princess</option>
                      <option value="Emerald">Emerald</option>
                      <option value="Asscher">Asscher</option>
                      <option value="Marquise">Marquise</option>
                      <option value="Pear">Pear</option>
                      <option value="Heart">Heart</option>
                      <option value="Cushion">Cushion</option>
                      <option value="Radiant">Radiant</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diamond Color:</label>
                    <select
                      name="color"
                      value={newDiamond.color}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Select Color</option>
                      <option value="D">D (Colorless)</option>
                      <option value="E">E (Colorless)</option>
                      <option value="F">F (Colorless)</option>
                      <option value="G">G (Near Colorless)</option>
                      <option value="H">H (Near Colorless)</option>
                      <option value="I">I (Near Colorless)</option>
                      <option value="J">J (Near Colorless)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diamond Clarity:</label>
                    <select
                      name="clarity"
                      value={newDiamond.clarity}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Select Clarity</option>
                      <option value="FL">FL (Flawless)</option>
                      <option value="IF">IF (Internally Flawless)</option>
                      <option value="VVS1">VVS1 (Very, Very Slightly Included 1)</option>
                      <option value="VVS2">VVS2 (Very, Very Slightly Included 2)</option>
                      <option value="VS1">VS1 (Very Slightly Included 1)</option>
                      <option value="VS2">VS2 (Very Slightly Included 2)</option>
                      <option value="SI1">SI1 (Slightly Included 1)</option>
                      <option value="SI2">SI2 (Slightly Included 2)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price per Carat:</label>
                    <input
                      type="number"
                      name="pricePerCarat"
                      value={newDiamond.pricePerCarat}
                      onChange={handleChange}
                      step="0.01"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight (Carat):</label>
                    <input
                      type="number"
                      name="carat"
                      value={newDiamond.carat}
                      onChange={handleChange}
                      step="0.01"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Price per Carat:</label>
                    <input
                      type="number"
                      name="totalCaratPrice"
                      value={newDiamond.totalCaratPrice}
                      readOnly
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      name="quantity"
                      value={newDiamond.quantity}
                      onChange={handleChange}
                      min="1"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Amount:</label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={newDiamond.totalAmount}
                      readOnly
                      className="form-control"
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit">{editing ? 'Update Diamond' : 'Add Diamond'}</button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={() => {
                        setEditing(false);
                        clearForm();
                      }} 
                      style={{ display: editing ? 'inline' : 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : <Navigate to="/" replace />} />
      </Routes>
      {window.location.pathname !== '/' && <Footer />}
    </div>
  );
}

export default App;
