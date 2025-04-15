import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from '../components/App';

// Mock fetch
beforeEach(() => {
  jest.spyOn(window, 'fetch').mockImplementation((url) => {
    if (url === 'http://localhost:4000/questions') {
      return Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, prompt: 'Question 1', answers: ['A', 'B'], correctIndex: 0 },
          { id: 2, prompt: 'Question 2', answers: ['C', 'D'], correctIndex: 1 }
        ]),
        ok: true
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
});

afterEach(() => {
  window.fetch.mockRestore();
});

test('displays question prompts after fetching', async () => {
  render(<App />);
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  // Verify questions are displayed
  expect(screen.getByText('Question 1')).toBeInTheDocument();
  expect(screen.getByText('Question 2')).toBeInTheDocument();
});

test('deletes the question when the delete button is clicked', async () => {
  render(<App />);
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  // Mock delete response
  window.fetch.mockImplementationOnce(() => 
    Promise.resolve({ ok: true })
  );
  
  fireEvent.click(screen.getAllByText('Delete Question')[0]);
  
  await waitFor(() => {
    expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
  });
});

test('updates the answer when the dropdown is changed', async () => {
  render(<App />);
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  // Mock patch response
  window.fetch.mockImplementationOnce(() => 
    Promise.resolve({
      json: () => Promise.resolve({
        id: 1, prompt: 'Question 1', answers: ['A', 'B'], correctIndex: 1
      }),
      ok: true
    })
  );
  
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
  
  await waitFor(() => {
    expect(screen.getAllByRole('combobox')[0].value).toBe('1');
  });
});