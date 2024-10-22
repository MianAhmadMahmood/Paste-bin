// ViewPaste.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewPaste = () => {
  const { shortUrl } = useParams();
  const [pasteData, setPasteData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the paste data when the component is mounted
    axios
      .get(`http://localhost:4000/view/${shortUrl}`)
      .then((res) => {
        setPasteData(res.data);
      })
      .catch((err) => {
        setError(err.response ? err.response.data.message : 'An error occurred');
      });
  }, [shortUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg max-w-lg w-full p-6">
        {error && <p className="text-red-500">{error}</p>}
        {pasteData && (
          <div>
            <h1 className="text-2xl font-bold">{pasteData.title}</h1>
            <p className="text-gray-500">Author: {pasteData.authorName}</p>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap">{pasteData.content}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPaste;
  