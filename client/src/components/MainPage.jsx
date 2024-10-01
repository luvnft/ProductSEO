import { useState, useRef } from "react";
import { ThreeDots } from 'react-loader-spinner';

function MainPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [optimizedDescription, setOptimizedDescription] = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState([]); // For keyword suggestions as an array
  const [isKeywordLoading, setIsKeywordLoading] = useState(false); // Loader for keyword suggestions
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false); // Loader for description optimization
  const [newKeyword, setNewKeyword] = useState(""); // For adding new keywords
  const descriptionRef = useRef(null);

  // Function to handle fetching keyword suggestions based on user input
  const handleGenerateKeywordSuggestions = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message:
          "Based on the following product information, please generate SEO keywords: " +
          "Product Name: " + productName + ". " +
          "Category: " + category + ". " +
          "Unique Selling Points: " + uniqueSellingPoints + ". " +
          "Target Audience: " + targetAudience + ". " +
          "Current Description: " + currentDescription + ". " +
          "Specifications: " + specifications + "." +
          "Only respond with a list of keywords."
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsKeywordLoading(true);
    try {
      const response = await fetch("https://product-seo-optimizer-b5addb5025ae.herokuapp.com/completions", options);
      const data = await response.json();
      if (data.text) {
        const keywordsArray = data.text.split('\n').map((keyword) => keyword.replace('* ', '').trim()); // Convert text to array
        setKeywordSuggestions(keywordsArray);
      } else {
        setKeywordSuggestions([]);
      }
      setIsKeywordLoading(false);
    } catch (error) {
      console.error("Failed to generate keyword suggestions:", error);
      setIsKeywordLoading(false);
    }
  };

  // Function to handle generating the optimized product description
  const handleGenerateDescription = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message:
          "I have a product, " +
          productName +
          ", and would like to improve its SEO ranking on search engines. Can you help me rewrite the product description to be more compelling and informative, while also incorporating relevant keywords for current search trends? " +
          "Here are the keywords to incorporate: " + keywordSuggestions.join(', ') + ". " +
          "Additionally, could you suggest some backend tags that I can use to further optimize the product search? Here’s some additional information that could be helpful: " +
          "1. Product name and category: " + productName + ", " + category + ". " +
          "2. Unique Selling Points: " + uniqueSellingPoints + ". " +
          "3. Target Audience: " + targetAudience + ". " +
          "4. Existing Description: " + currentDescription + ". " +
          "5. Product Specifications: " + specifications + " (inform user that specifications include size, color, material).",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    setIsDescriptionLoading(true);
    try {
      const response = await fetch("https://product-seo-optimizer-b5addb5025ae.herokuapp.com/completions", options);
      const data = await response.json();
      setOptimizedDescription(data.text);
      setIsDescriptionLoading(false);
    } catch (error) {
      console.error("Failed to generate product description:", error);
      setIsDescriptionLoading(false);
    }
  };

  // Function to format the optimized description for display
  const formatDescription = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h2 key={index} className="text-xl font-bold my-2">{line.replace(/\*\*/g, '')}</h2>;
      } else {
        return <p key={index} className="my-1">{line}</p>;
      }
    });
  };

  // Function to handle adding a new keyword to the list
  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setKeywordSuggestions([...keywordSuggestions, newKeyword.trim()]);
      setNewKeyword(""); // Reset the input
    }
  };

  // Function to handle editing a keyword in the list
  const handleEditKeyword = (index, newKeyword) => {
    const updatedKeywords = [...keywordSuggestions];
    updatedKeywords[index] = newKeyword;
    setKeywordSuggestions(updatedKeywords);
  };

  // Function to handle deleting a keyword from the list
  const handleDeleteKeyword = (index) => {
    const updatedKeywords = keywordSuggestions.filter((_, i) => i !== index);
    setKeywordSuggestions(updatedKeywords);
  };

  // Function to handle copying the description to clipboard
  const handleCopyDescription = async () => {
    if (descriptionRef.current) {
      const el = descriptionRef.current;
      try {
        await navigator.clipboard.writeText(el.innerText);
        alert("Product Description Copied to Clipboard!");
      } catch (error) {
        console.error("Failed to copy text to clipboard:", error);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center pt-32 md:pt-56">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[80%]">
        <h1 className="text-4xl font-bold text-center">
          ⭐ Product Description Optimizer ⭐
        </h1>
        <h2 className="mb-6 text-lg font-light">powered by Gemini AI</h2>

        {/* Product Name input */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Product Name:</label>
          <input
            className="input-large bg-gray-200 rounded-lg w-1/2 shadow-sm resize-y"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white hover:bg-blue-600 py-1 px-4 rounded-full font-medium ml-4"
            onClick={handleGenerateKeywordSuggestions}
          >
            Generate Keyword Suggestions
          </button>
        </div>

        {/* Keyword Loading Spinner */}
        {isKeywordLoading && (
          <div className="flex items-center justify-center mb-4">
            <ThreeDots
              type="ThreeDots"
              color="#FF6347"
              height={50}
              width={50}
            />
            <p className="ml-2">Generating keywords...</p>
          </div>
        )}

        {/* Keyword Suggestions Section */}
        {keywordSuggestions.length > 0 && (
          <div className="mb-4 items-center ">
            <label className="block font-medium mb-2">Suggested Keywords:</label>
            <table className="table-auto w-3/4">
              <thead>
                <tr>
                  <th className="px-4 py-2">Keyword</th>
                  <th className="px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {keywordSuggestions.map((keyword, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      <input
                        className="bg-gray-100 border rounded px-2 py-1"
                        value={keyword}
                        onChange={(e) => handleEditKeyword(index, e.target.value)}
                      />
                    </td>
                    
                    <td className="border px-4 py-2 text-center">
                      <button className="bg-red-500 text-white rounded-full px-2 py-1" onClick={() => handleDeleteKeyword(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add New Keyword */}
            <div className="flex mt-4">
              <input
                className="input-large bg-gray-200 rounded-lg shadow-sm w-1/2"
                type="text"
                placeholder="Add a new keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-full font-medium ml-4"
                onClick={handleAddKeyword}
              >
                Add Keyword
              </button>
            </div>
          </div>
        )}

        {/* Category input */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Category:</label>
          <input
            className="input-large bg-gray-200 rounded-lg shadow-sm w-1/2 resize-y"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
 {/* Unique Selling Points input */}

 <div className="mb-4">

<label className="block font-medium mb-2">Unique Selling Points:</label>

<textarea

  className="input-large bg-gray-200 rounded-lg shadow-sm resize-y h-24 w-3/4"

  value={uniqueSellingPoints}

  onChange={(e) => setUniqueSellingPoints(e.target.value)}

/>

</div>



{/* Target Audience input */}

<div className="mb-4">

<label className="block font-medium mb-2">Target Audience:</label>

<textarea

  className="input-large bg-gray-200 rounded-lg shadow-sm resize-y h-24 w-3/4"

  value={targetAudience}

  onChange={(e) => setTargetAudience(e.target.value)}

/>

</div>



{/* Current Description input */}

<div className="mb-4">

<label className="block font-medium mb-2">Current Description:</label>

<textarea

  className="input-large bg-gray-200 w-3/4 rounded-lg shadow-sm resize-y h-24"

  value={currentDescription}

  onChange={(e) => setCurrentDescription(e.target.value)}

/>

</div>



{/* Specifications input */}

<div className="mb-4">

<label className="block font-medium mb-2">Specifications (size, color, material):</label>

<textarea

  className="input-large bg-gray-200 w-3/4 rounded-lg shadow-sm resize-y h-24"

  value={specifications}

  onChange={(e) => setSpecifications(e.target.value)}

/>

</div>

        {/* Optimize Button */}
        <button
          className="bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-full font-medium text-center w-3/4"
          onClick={handleGenerateDescription}
        >
          Optimize Description
        </button>
        {isDescriptionLoading && (
          <div className="flex items-center mt-4">
            <ThreeDots
              type="ThreeDots"
              color="#00BFFF"
              height={80}
              width={80}
              className="mr-2"
            />
            <p>Loading...</p>
          </div>
        )}

        {/* Optimized Description Section */}
        <h2 className="text-2xl font-semibold mt-6">Optimized Product Description:</h2>
        <div className="h-full flex flex-col justify-center items-center">
          <div className="border p-4 mt-2 rounded-xl shadow-xl w-3/4 flex flex-col justify-center items-center relative">
            <div className="h-full flex flex-col overflow-y-auto justify-center items-center">
              <div className="flex-grow p-8" ref={descriptionRef}>
                {formatDescription(optimizedDescription)}
              </div>
              <div className="absolute bottom-2 right-2">
                <button
                  className="bg-green-500 text-white hover:bg-green-600 py-2 px-6 rounded-full font-medium"
                  onClick={handleCopyDescription}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
