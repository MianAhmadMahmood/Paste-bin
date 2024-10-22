// App.js
import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Viewpaste from './Viewpaste';

const App = () => {
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [expiry, setExpiry] = useState('forever');
  const [pasteData, setPasteData] = useState(null);

  const handleSubmit = () => {
    if (!authorName || !title || !content) {
      alert('Please fill in all fields.');
      return;
    }

    axios
      .post('http://localhost:4000/api/paste', { authorName, title, content, expiry })
      .then((res) => {
        setShortUrl(res.data.shortUrl);
        setQrCode(res.data.qrCode);
        return axios.get(`http://localhost:4000/view/${res.data.shortUrl.split('/').pop()}`);
      })
      .then((response) => {
        setPasteData(response.data);
      })
      .catch((error) => {
        console.log(error);
        alert('Something went wrong. Please try again.');
      });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white shadow-lg rounded-lg max-w-lg w-full p-6">
                <h1 className="text-4xl sm:text-2xl font-bold text-center text-blue-600 mb-4">
                  Pastebin Clone
                </h1>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Author Name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <textarea
                    placeholder="Enter your text/code here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows={6}
                  />
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="forever">Forever</option>
                    <option value="1year">1 Year</option>
                    <option value="6months">6 Months</option>
                    <option value="3months">3 Months</option>
                    <option value="1month">1 Month</option>
                  </select>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold transition duration-200 ease-in-out"
                  >
                    Create Paste
                  </button>

                  {shortUrl && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 mb-2">Your Paste URL:</p>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-words"
                      >
                        {shortUrl}
                      </a>
                      {qrCode && (
                        <div className="mt-4">
                          <img src={qrCode} alt="QR Code" className="mx-auto w-32 h-32" />
                        </div>
                      )}
                    </div>
                  )}

                  {pasteData && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
                      <div className="flex justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-800">Author: {pasteData.authorName}</h2>
                        <h3 className="text-md font-medium text-gray-600">Title: {pasteData.title}</h3>
                      </div>
                      <pre className="bg-white p-3 rounded-md mt-2 text-gray-800 whitespace-pre-wrap border border-gray-300">
                        {pasteData.content}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        />
        <Route path="/view/:shortUrl" element={<Viewpaste  />} />
      </Routes>
    </Router>
  );
};

export default App;
