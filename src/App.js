import './index.css';
import { useState } from 'react';

const App = () => {
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState(['']);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');

  const surpriseOptions = [
    'Does the image have a whale?',
    'Is the image fabulously pink?',
    'Does the image have puppies?'
  ];

  const surprise = () => {
    const randomValue = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
    setQuestions([...questions, randomValue]);
  };

  const uploadImage = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setImage(e.target.files[0]);

    try {
      const config = {
        method: 'post',
        body: formData
      };
      const response = await fetch('http://localhost:8080/upload', config);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const analyzeImage = async (index) => {
    if (!image) {
      setError("Error! Must have an existing image!");
      return;
    }
    setError('');

    try {
      const options = {
        method: "POST",
        body: JSON.stringify({ message: questions[index] }),
        headers: {
          'content-type': 'application/json'
        }
      };
      const response = await fetch('http://localhost:8080/gemini', options);
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      const data = await response.text();
      setResponses((prevResponses) => {
        const newResponses = [...prevResponses];
        newResponses[index] = data;
        return newResponses;
      });
    } catch (error) {
      console.error(error);
      setError("Something didn't work! Please try again.");
    }
  };

  const clear = () => {
    setImage(null);
    setQuestions(['']);
    setResponses([]);
    setError('');
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleQuestionChange = (value, index) => {
    const updatedQuestions = questions.map((q, i) => (i === index ? value : q));
    setQuestions(updatedQuestions);
  };

  return (
    <div className="App">
      <section className='search-section'>
        <div className="image-container">
          {image && <img className='image' src={URL.createObjectURL(image)} alt="uploaded" />}
        </div>
        <p className='extra-info'>
          <span>
            <label htmlFor='files'>Upload Image...</label>
            <input onChange={uploadImage} id='files' accept='image/*' type="file" hidden />
          </span>
          To ask questions about.
        </p>
        <p>What do you want to know about the image?</p>
        {questions.map((question, index) => (
          <div className='input-container' key={index}>
            <input
              value={question}
              placeholder='What is in the image?'
              onChange={(e) => handleQuestionChange(e.target.value, index)}
            />
            <button onClick={() => analyzeImage(index)} disabled={responses[index]}>
              Ask me
            </button>
            {responses[index] && <p>{responses[index]}</p>}
          </div>
        ))}
        <button className='surprise' onClick={surprise}>Surprise me</button>
        <button onClick={addQuestion}>Add another question</button>
        <button onClick={clear}>Clear</button>
        {error && <p>{error}</p>}
      </section>
    </div>
  );
}

export default App;



