import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function BudgetAnalysis() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [budgetData, setBudgetData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Last Month');
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');//save the jwt tocken to the local srtorage
        if (!token) {              
          setIsAuthenticated(false);
          navigate('/signin');
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

    checkAuth();
  }, [navigate]);

  const fetchBudgetData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/budget/analysis', {
        params: { filter: selectedFilter },
        headers: { Authorization: `Bearer ${token}` }
      });
      const transformedData = response.data.budgetEntries.map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        price: entry.price
      }));
      setBudgetData(transformedData);
      setIsLimitExceeded(response.data.isLimitExceeded || false);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const chartData = {
    labels: budgetData.length > 0 ? budgetData.map(item => item.date) : [],
    datasets: [
      {
        label: 'Amount',
        data: budgetData.length > 0 ? budgetData.map(item => item.price) : [],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        fill: true
      }
    ]
  };

  if (!isAuthenticated) {
    return <div>Redirecting to SignIn...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Budget Analysis</h1>

      <Form inline={selectedFilter === 'Last Month' ? 'true' : 'false'} style={filterFormStyle}>
        <FormGroup>
          <Label for="filter" style={filterLabelStyle}>Filter by:</Label>
          <Input
            type="select"
            id="filter"
            value={selectedFilter}
            onChange={handleFilterChange}
            style={filterInputStyle}
          >
            <option>Last Month</option>
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
          </Input>
          <Button color="primary" onClick={fetchBudgetData}>
            Refresh Data
          </Button>
        </FormGroup>
      </Form>

      {isLimitExceeded && (
        <div style={limitExceededStyle}>
          <strong>Warning:</strong> You have exceeded your budget limit during the selected period!
        </div>
      )}

      <div style={chartContainerStyle}>
        {budgetData.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p>No data available for the selected period.</p>
        )}
      </div>
    </div>
  );
}

// Inline styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  minHeight: '100vh',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#343a40',
  marginBottom: '20px',
};

const filterFormStyle = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center'
};

const filterLabelStyle = {
  marginRight: '10px',
};

const filterInputStyle = {
  width: '200px',
  marginRight: '10px'
};

const chartContainerStyle = {
  width: '100%',
  maxWidth: '800px',
};

const limitExceededStyle = {
  padding: '10px',
  marginBottom: '20px',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '8px',
};

export default BudgetAnalysis;
