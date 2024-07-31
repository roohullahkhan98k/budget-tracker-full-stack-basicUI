import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './index';
import '@testing-library/jest-dom';  
import { MemoryRouter } from 'react-router-dom';

describe('SignUp component', () => {
  test('renders the form with expected fields', () => {
    const { getByText, getByLabelText } = render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    
    
    expect(getByLabelText('First Name:')).toBeInTheDocument();
    expect(getByLabelText('Email:')).toBeInTheDocument();
    expect(getByLabelText('Password:')).toBeInTheDocument();
    expect(getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(getByLabelText('Budget Limit:')).toBeInTheDocument();
  });

 test('submits the form with valid data', async () => {
  const { getByText, getByLabelText, getByRole } = render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  fireEvent.change(getByLabelText('First Name:'), { target: { value: 'Rooh khan' } });
  fireEvent.change(getByLabelText('Email:'), { target: { value: 'Roohkhan@example.com' } });
  fireEvent.change(getByLabelText('Password:'), { target: { value: 'password123' } });
  fireEvent.change(getByLabelText('Confirm Password:'), { target: { value: 'password123' } });
  fireEvent.change(getByLabelText('Budget Limit:'), { target: { value: '123' } });

  
  const submitButton = getByRole('button', { type: 'submit' });
  fireEvent.click(submitButton);

});
test('password and confirm password do not match', async () => {
  const { getByText, getByLabelText, getByRole } = render(
    <MemoryRouter initialEntries={['/Signup']}>
      <SignUp />
    </MemoryRouter>
  );


  fireEvent.change(getByLabelText('First Name:'), { target: { value: 'John Doe' } });
  fireEvent.change(getByLabelText('Email:'), { target: { value: 'johndoe@example.com' } });
  fireEvent.change(getByLabelText('Password:'), { target: { value: 'password123' } });
  fireEvent.change(getByLabelText('Confirm Password:'), { target: { value: 'password456' } });
  fireEvent.change(getByLabelText('Budget Limit:'), { target: { value: '1000' } });

  
  const submitButton = getByRole('button', { type: 'submit' });
  fireEvent.click(submitButton);

  
  expect(getByText('Passwords do not match')).toBeInTheDocument();
});




test('shows error messages for empty fields', async () => {
    const { getByRole, getByLabelText } = render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );
  
    
    fireEvent.click(getByRole('button', { type: 'submit' }));
  
    //waiting for browser validation to trigger
    await waitFor(() => {
      // Check if each input element is invalid
      expect(getByLabelText('First Name:')).toBeInvalid();
      expect(getByLabelText('Email:')).toBeInvalid();
      expect(getByLabelText('Password:')).toBeInvalid();
      expect(getByLabelText('Confirm Password:')).toBeInvalid();
      expect(getByLabelText('Budget Limit:')).toBeInvalid();
    });
  })
});