import React, { useState, useEffect } from 'react';
import QuestionList from './QuestionList';
import QuestionForm from './QuestionForm';

function App() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:4000/questions', {
          signal: controller.signal
        });
        const data = await response.json();
        if (isMounted) {
          setQuestions(data);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('Error fetching questions:', error);
          setIsLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleAddQuestion = async (newQuestion) => {
    try {
      const response = await fetch('http://localhost:4000/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });
      const data = await response.json();
      setQuestions([...questions, data]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await fetch(`http://localhost:4000/questions/${id}`, {
        method: 'DELETE',
      });
      setQuestions(questions.filter(question => question.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleUpdateQuestion = async (id, correctIndex) => {
    try {
      const response = await fetch(`http://localhost:4000/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correctIndex }),
      });
      const updatedQuestion = await response.json();
      setQuestions(questions.map(question => 
        question.id === id ? updatedQuestion : question
      ));
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  return (
    <div className="App" data-testid="app">
      <nav>
        <button 
          onClick={() => setShowForm(!showForm)}
          data-testid="view-toggle"
        >
          {showForm ? 'View Questions' : 'New Question'}
        </button>
      </nav>
      
      <main>
        <section>
          {isLoading ? (
            <p>Loading...</p>
          ) : showForm ? (
            <QuestionForm onAddQuestion={handleAddQuestion} />
          ) : (
            <QuestionList 
              questions={questions} 
              onDeleteQuestion={handleDeleteQuestion}
              onUpdateQuestion={handleUpdateQuestion}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;