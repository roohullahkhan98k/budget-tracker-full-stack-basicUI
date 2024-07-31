import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser } from 'react-icons/fa'; // Import profile icon

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ name: '', price: '', date: new Date() });
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');//save jwt on local storage 
        if (!token) {
          setIsAuthenticated(false);
          navigate('/signin');//rediect to sign in
          return;
        }

        await axios.get('http://localhost:8000/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/signin');
      }
    };

    const interval = setInterval(checkAuth, 5000);
    checkAuth();

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/budget', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEntries(response.data);
      } catch (error) {
        console.error('Error fetching budget entries:', error);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    const checkBudgetLimit = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/budget/check-limit', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLimitExceeded(response.data.isExceeded);
      } catch (error) {
        console.error('Error checking budget limit:', error);
      }
    };

    checkBudgetLimit();
  }, [entries]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const entryData = {
      ...newEntry,
      date: newEntry.date.toISOString()
    };

    if (editingEntry) {
      try {
        const response = await axios.put(
          `http://localhost:8000/api/budget/${editingEntry._id}`,
          entryData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEntries(entries.map(entry => (entry._id === editingEntry._id ? response.data : entry)));
        setEditingEntry(null);
      } catch (error) {
        console.error('Error editing entry:', error);
      }
    } else {
      try {
        const response = await axios.post('http://localhost:8000/api/budget', entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEntries([...entries, response.data]);
      } catch (error) {
        console.error('Error adding new entry:', error);
      }
    }

    setNewEntry({ name: '', price: '', date: new Date() });
    setIsModalOpen(false);
  };

  const handleDeleteEntry = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/budget/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(entries.filter(entry => entry._id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditClick = (entry) => {
    setNewEntry({ name: entry.name, price: entry.price, date: new Date(entry.date) });
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setNewEntry({ name: '', price: '', date: new Date() });
    setEditingEntry(null);
  };

  const toggleFilterModal = () => {
    setIsFilterModalOpen(!isFilterModalOpen);
  };

  const handleFilterRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/budget/filter', {
        params: { date: filterDate.toISOString() },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.length === 0) {
        alert('No records found for the selected date.');
      } else {
        setFilteredEntries(response.data);
        setIsFilterModalOpen(true);
      }
    } catch (error) {
      console.error('Error filtering records:', error);
    }
  };

  if (!isAuthenticated) {
    return <div data-testid="redirecting">Redirecting to SignIn...</div>;
  }

  return (
    <div style={homeStyle}>
      <header style={headerStyle}>
        <div style={logoContainerStyle}>
          <img src="my-logo" alt="App Logo" style={logoStyle} />
        </div>
        <div style={profileIconContainerStyle}>
          <FaUser size={24} />
        </div>
      </header>

      <div style={mainContentContainerStyle} role="main">
        <div style={headerWithLogoutStyle} role="banner">
          <h1 style={welcomeMessageStyle}>Welcome to the Budget Tracker</h1>
          <Button color="secondary" onClick={handleLogout} style={logoutButtonStyle} aria-label="Logout">Logout</Button>
        </div>

        {isLimitExceeded && (
          <div style={limitExceededStyle} role="alert">
            <strong>Warning:</strong> You have exceeded your budget limit for this month!
          </div>
        )}

        <div style={entriesContainerStyle}>
        <Button
             color="primary"
             onClick={toggleModal}
             style={addButtonStyle}
             aria-label="Add Budget"
            data-testid="add-budget-button"
           >Add Budget</Button>

          <div style={filterContainerStyle}>
            <DatePicker
              selected={filterDate}
              onChange={(date) => setFilterDate(date)}
              className="form-control"
              aria-label="Filter Date"
            />
            <Button color="primary" onClick={handleFilterRecords} style={filterButtonStyle} aria-label="Filter Records">Filter Records</Button>
          </div>

          <div style={entryTableContainerStyle}>
            <table style={tableStyle} role='table'>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry._id} style={trStyle}>
                    <td style={tdStyle}>{entry.name}</td>
                    <td style={tdStyle}>${entry.price}</td>
                    <td style={tdStyle}>{new Date(entry.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <Button color="warning" onClick={() => handleEditClick(entry)} style={editButtonStyle} aria-label="Edit Entry">Edit</Button>
                      <Button color="danger" onClick={() => handleDeleteEntry(entry._id)} style={deleteButtonStyle} aria-label="Delete Entry">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button color="info" onClick={() => navigate('/BudgetAnalysis')} style={budgetAnalysisButtonStyle} aria-label="Budget Analysis">
            Budget Analysis
          </Button>
        </div>
      </div>

      
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {editingEntry ? 'Edit Entry' : 'Add New Entry'}
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                className="form-control"
                value={newEntry.price}
                onChange={(e) => setNewEntry({ ...newEntry, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <DatePicker
                selected={newEntry.date}
                onChange={(date) => setNewEntry({ ...newEntry, date })}
                className="form-control"
                required
              />
            </div>
            <Button type="submit" color="primary" style={submitButtonStyle}>
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Close</Button>
        </ModalFooter>
      </Modal>

             //this is the model for filtered entries
      <Modal isOpen={isFilterModalOpen} toggle={toggleFilterModal}>
        <ModalHeader toggle={toggleFilterModal}>Filtered Entries</ModalHeader>
        <ModalBody>
          <table style={tableStyle} role='table'>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry._id} style={trStyle}>
                  <td style={tdStyle}>{entry.name}</td>
                  <td style={tdStyle}>${entry.price}</td>
                  <td style={tdStyle}>{new Date(entry.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleFilterModal}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Styles
const homeStyle = {
  backgroundColor: '#f4f4f4',
  minHeight: '100vh',
  padding: '20px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '10px 20px'
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center'
};

const logoStyle = {
  height: '40px'
};

const profileIconContainerStyle = {
  fontSize: '24px'
};

const mainContentContainerStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
};

const headerWithLogoutStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const welcomeMessageStyle = {
  fontSize: '24px',
  color: '#333'
};

const logoutButtonStyle = {
  backgroundColor: '#dc3545',
  borderColor: '#dc3545'
};

const limitExceededStyle = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px'
};

const entriesContainerStyle = {
  marginTop: '20px'
};

const addButtonStyle = {
  marginBottom: '20px'
};

const filterContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between'
};

const filterButtonStyle = {
  marginLeft: '10px'
};

const entryTableContainerStyle = {
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const thStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  padding: '10px'
};

const tdStyle = {
  padding: '10px'
};

const trStyle = {
  borderBottom: '1px solid #ddd'
};

const editButtonStyle = {
  marginRight: '10px'
};

const deleteButtonStyle = {
  backgroundColor: '#dc3545',
  borderColor: '#dc3545'
};

const submitButtonStyle = {
  marginTop: '10px'
};

const budgetAnalysisButtonStyle = {
  marginTop: '20px'
};

export default Home;
