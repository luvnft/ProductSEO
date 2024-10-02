import { useState, useRef } from "react";
import { ThreeDots } from 'react-loader-spinner';
import { FaMagic, FaCopy, FaSearch } from 'react-icons/fa'; // FontAwesome icons example

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
  const [isTableVisible, setIsTableVisible] = useState(false); // Track whether the table is visible
  const [isAudienceLoading, setIsAudienceLoading] = useState(false); // Loader for target audience suggestions
  const [targetAudienceSuggestions, setTargetAudienceSuggestions] = useState([]); // For target audience suggestions
  const [showAudienceSuggestions, setShowAudienceSuggestions] = useState(false); // To track if suggestions should be shown
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false); // To track if keyword suggestions should be shown
  const [selectedKeywords, setSelectedKeywords] = useState(''); // To store selected keywords
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState('');
  const [deleteIndex, setDeleteIndex] = useState(null);

  const descriptionRef = useRef(null);


  // Function to toggle table visibility
  const handleToggleTable = () => {
    setIsTableVisible((prev) => !prev);
  };

// Function to handle fetching keyword suggestions based on user input
const handleGenerateKeywordSuggestions = async () => {
  setIsKeywordLoading(true);
  setShowKeywordSuggestions(true); // Set to true when the button is clicked

  const options = {
    method: "POST",
    body: JSON.stringify({
      message:
        "Based on the following product information, please generate a list of highly relevant SEO keywords that are likely to convert. Consider current search trends and user intent. Ensure the keywords are both short-tail and long-tail, and that a niche or target audience is identified in this keyword research if not provided. " +
        "Product Name: " + productName + ". " +
        "Category: " + category + ". " +
        "Unique Selling Points: " + uniqueSellingPoints + ". " +
        "Target Audience: " + targetAudience + ". " +
        "Current Description: " + currentDescription + ". " +
        "Specifications: " + specifications + "." +
        "Only respond with a list of keywords, do not give me titles or any other conversation."
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch("https://product-seo-optimizer-b5addb5025ae.herokuapp.com/completions", options);
    const data = await response.json();
    
    if (data.text) {
      const keywordsArray = data.text
        .split('\n')
        .map((keyword) => keyword.replace('* ', '').trim()) // Clean up the keyword by removing leading characters and trimming whitespace
        .filter((keyword) => keyword.length > 0); // Filter out any empty or blank entries
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


// Function to format the keyword suggestions text for display with ** for bold titles
const formatKeywordSuggestions = (textArray) => {
  return textArray.map((text, index) => {
    if (text.startsWith('**') && text.endsWith('**')) {
      return (
        <p key={index} className="my-2 font-bold">{text.replace(/\*\*/g, '')}</p> // Remove the ** and bolden
      );
    } else {
      return <span key={index}>{text}, </span>; // Display other keywords separated by commas
    }
  });
};

// Function to format keywords for the table (excluding titles)
const formatKeywordsForTable = (textArray) => {
  return textArray.filter((text) => !(text.startsWith('**') && text.endsWith('**'))); // Exclude bold section titles
};
  // Function to handle generating the optimized product description
  const handleGenerateDescription = async () => {
// Combine selectedKeywords and keywordSuggestions into one array
const combinedKeywords = [...selectedKeywords.split(', '), ...keywordSuggestions].join(', ');
// Combine the targetAudience and targetAudienceSuggestions
const combinedTargetAudience = [...targetAudience.split(', '), ...targetAudienceSuggestions].join(', ');

    const options = {
      method: "POST",
      body: JSON.stringify({
        message:
          "I have a product, " +
          productName +
          ", and would like to improve its SEO ranking on search engines. Can you help me rewrite the product description to be more compelling and informative, while also incorporating relevant keywords for current search trends? " +
          "Here are some of the keywords to incorporate: " + combinedKeywords + ". " +
          "Additionally, could you suggest some backend tags that I can use to further optimize the product search? Here’s some additional information that could be helpful: " +
          "1. Product name and category: " + productName + ", " + category + ". " +
          "2. Unique Selling Points: " + uniqueSellingPoints + ". " +
          "3. Target Audience: " + combinedTargetAudience + ". " +
          "4. Existing Description: " + currentDescription + ". " +
          "5. Product Specifications: " + specifications + " (inform user that specifications include size, color, material)." +
          "Please return the description with the key product features highlighted in 3-5 concise and compelling bullet points at the beginning. These bullet points should be the most important information for search engines and potential buyers. After the bullet points, please provide a more detailed description that elaborates on these features and includes additional product information. Ensure consistent capitalization at the beginning of each bullet point. Finally, please suggest some relevant backend tags that I can use to further optimize the product search.",
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
  
    return (
      <>
        <ul className="list-disc list-inside my-4">
          {lines.map((line, index) => {
            // Check if the line starts with a bullet point and contains bold text
            if (line.startsWith('- **') && line.includes('**')) {
              const content = line
                .replace(/-\s\*\*(.*?)\*\*/, (match, p1) => `**${p1.toUpperCase()}**`) // Capitalize the header
                .replace(/\*\*/g, ''); // Remove the asterisks from the rest of the line
              return <li key={index} className="my-1 font-medium">{content}</li>;
            }
  
            // Check if the line starts and ends with ** for headings
            if (line.startsWith('**') && line.endsWith('**')) {
              const headingContent = line.replace(/\*\*/g, ''); // Remove the asterisks
              return <h2 key={index} className="text-2xl font-bold mt-4 mb-2">{headingContent}</h2>;
            }
  
            // Check for more detailed headers or sections
            if (line.startsWith('More Information:')) {
              return <h3 key={index} className="text-lg font-semibold mt-4">{line}</h3>;
            } else if (line.startsWith('Backend Tags:')) {
              return <h3 key={index} className="text-lg font-semibold mt-4">{line}</h3>;
            } else {
              return <p key={index} className="my-1">{line}</p>;
            }
          })}
        </ul>
      </>
    );
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

   // Function to open the delete confirmation modal
   const handleOpenDeleteModal = (index, keyword) => {
    setKeywordToDelete(keyword); // Store the keyword to be deleted
    setDeleteIndex(index);       // Store the index of the keyword
    setShowDeleteModal(true);    // Show the modal
  };

  // Function to handle deleting a keyword from the list
  const handleDeleteKeyword = () => {
    const updatedKeywords = keywordSuggestions.filter((_, i) => i !== deleteIndex);
    setKeywordSuggestions(updatedKeywords);
    setShowDeleteModal(false);  // Close the modal after deletion
  };
  

  // Function to cancel deletion and close the modal
  const handleCancelDelete = () => {
    setShowDeleteModal(false);  // Close the modal without deleting
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

  const handleSuggestTargetAudience = async () => {
    setShowAudienceSuggestions(true); // Set to true when the button is clicked
    setIsAudienceLoading(true);
    
    const options = {
      method: "POST",
      body: JSON.stringify({
        message:
          "Based on the following product information, please suggest the most appropriate target audience to sell to. Consider demographics, psychographics, and behaviors relevant to the product: " +
          "Product Name: " + productName + ". " +
          "Category: " + category + ". " +
          "Unique Selling Points: " + uniqueSellingPoints + ". " +
          "Current Description: " + currentDescription + ". " +
          "Specifications: " + specifications + "." +
          "Only respond with the most relevant target audience suggestions."
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  
    setIsAudienceLoading(true);
    try {
      const response = await fetch("https://product-seo-optimizer-b5addb5025ae.herokuapp.com/completions", options);
      const data = await response.json();
      
      if (data.text) {
        const audienceArray = data.text.split('\n').map((audience) => audience.replace('* ', '').trim()); // Convert text to array
        setTargetAudienceSuggestions(audienceArray);
      } else {
        setTargetAudienceSuggestions([]);
      }
      setIsAudienceLoading(false);
    } catch (error) {
      console.error("Failed to generate target audience suggestions:", error);
      setIsAudienceLoading(false);
    }
  };
  
  const formatAudienceSuggestions = (textArray) => {
    const filteredArray = textArray.filter((text) => text.length > 0); // Remove empty entries
  
    return filteredArray.map((text, index) => (
      <p key={index} className="my-1">{text}</p>
    ));
  };
  

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center pt-32 md:pt-56">
      <div className="bg-white border-gray-500 max-w-5xl p-8 rounded-xl shadow-xl w-[80%]">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center">
        <FaMagic className="inline-block mr-2" /> Product Listing Optimizer <FaMagic className="inline-block ml-2" />
        </h1>
        <h2 className="mb-6 text-lg font-light">powered by Gemini AI</h2>

        {/* Product Name input */}
        <div className="mb-4 w-[75%] mx-auto">
          <label className="block font-medium mb-2">Product Name:</label>
          
          <input
            className="input-large w-full bg-gray-200 rounded-lg  shadow-sm resize-y"
            type="text"
            placeholder="Enter your product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
       
          
        </div>


        {/* Category input */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Product Category:</label>
          <input
            className="input-large bg-gray-200 rounded-lg shadow-sm w-3/4 resize-y"
            type="text"
            placeholder="Enter the Product Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

{/* Current Description input */}

<div className="mb-4">

<label className="block font-medium mb-2">Current Description:</label>

<textarea

  className="input-large bg-gray-200 w-3/4 rounded-lg shadow-sm resize-y h-24"

  value={currentDescription}

  onChange={(e) => setCurrentDescription(e.target.value)}
  placeholder='Copy and Paste the Current Product Listing. If N/A, skip this step.'

/>

</div>


 {/* Unique Selling Points input */}

 <div className="mb-4">

<label className="block font-medium mb-2">Unique Selling Points:</label>

<textarea

  className="input-large bg-gray-200 rounded-lg shadow-sm resize-y h-24 w-3/4"

  value={uniqueSellingPoints}

  onChange={(e) => setUniqueSellingPoints(e.target.value)}

  placeholder="Enter Unique Selling points here (optional)"

/>

</div>



{/* Specifications input */}

<div className="mb-4">

<label className="block font-medium mb-2">Specifications (size, color, material):</label>

<textarea

  className="input-large bg-gray-200 w-3/4 rounded-lg shadow-sm resize-y h-24"

  value={specifications}

  onChange={(e) => setSpecifications(e.target.value)}

  placeholder="Enter Product Specifications"

/>

</div>




{/* Keyword input */}
<div className="mb-4">
  <label className="block font-medium mb-2">Keywords:</label>
  <textarea
    className="input-large bg-gray-200 rounded-lg shadow-sm resize-y h-24 w-3/4"
    placeholder="Have Keywords in mind? Enter them here."
    value={selectedKeywords} // You might want to replace this with another state variable if needed
    onChange={(e) => setSelectedKeywords(e.target.value)}
  />
  <p className="font-light">🚀 Need keyword suggestions? 
    <br/>Fill out the rest of the form and 
    <a
      className="text-blue-500 font-medium cursor-pointer underline ml-2"
      onClick={handleGenerateKeywordSuggestions}
    >
      Click Here
    </a>.
  </p>
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
{/* Keyword Suggestions */}
{showKeywordSuggestions && keywordSuggestions.length > 0 && (
        <div className="h-full flex flex-col justify-center items-center">
          <div className="border p-4 mt-2 rounded-xl shadow-xl w-full mb-6 flex flex-col justify-center items-center relative">
        

        {/* Keyword List Section */}
        {/* Display formatted keyword suggestions */}
      {!isTableVisible && keywordSuggestions.length > 0 && (
        <div className=" gap-4 mb-4 items-center">
            <h2 className="text-2xl font-bold text-blue-600 text-center p-2">Generated Keyword List:</h2>
            <p className="text-lg">{formatKeywordSuggestions(keywordSuggestions)}</p>
        </div>
      )}


        {/* Edit Keyword List Toggle */}
        <button
          className="bg-gray-500 text-white hover:bg-gray-600 py-2 px-4 rounded-full font-medium mt-4"
          onClick={handleToggleTable}
        >
          {isTableVisible ? "Hide Chart" : "Edit Keyword List"}
        </button>

              {/* Keyword Suggestions Table */}
      {isTableVisible && (
        <div className="mb-4 mt-4">
          <table className="table-auto mx-auto  w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">Keyword</th>
                {/* <th className="px-4 py-2">Edit</th> */}
                <th className="px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {formatKeywordsForTable(keywordSuggestions).map((keyword, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <input
                      className="bg-gray-100 border-gray-300 border w-[90%] mx-auto  rounded px-2 py-1"
                      value={keyword}
                      onChange={(e) => handleEditKeyword(index, e.target.value)}
                    />
                  </td>
                  {/* <td className="border px-4 py-2 text-center">
                    <button className="bg-green-500 text-white rounded-full px-2 py-1" onClick={() => handleEditKeyword(index, keyword)}>
                      Edit
                    </button>
                  </td> */}
                  <td className="border px-4 py-2 text-center">
                <button
                  className="bg-red-500 text-white rounded-full mx-auto px-4 py-2 transition-transform transform hover:scale-105 hover:bg-red-600 shadow-md flex items-center"
                  onClick={() => handleOpenDeleteModal(index, keyword)}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Delete
                </button>
              </td>
                </tr>
              ))}
            </tbody>
          </table>
         {/* Add New Keyword */}
<div className="w-[70%] mx-auto grid grid-cols-3 gap-4 mt-4">
  <input
    className="col-span-2  rounded-lg shadow-sm w-full bg-gray-100 border-gray-300 border  mx-auto   px-2 py-1"
    type="text"
    placeholder="Add a new keyword"
    value={newKeyword}
    onChange={(e) => setNewKeyword(e.target.value)}
  />
  <button
    className="col-span-1 bg-blue-500 text-white hover:bg-blue-600 py-2 px-16 md:px-16  flex items-center justify-center  w-full rounded-full font-medium"
    onClick={handleAddKeyword}
  >
    Add Keyword
  </button>
</div>
{/* Delete Confirmation Modal */}
{showDeleteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="mb-6">Do you really want to delete the keyword: <strong>{keywordToDelete}</strong>?</p>
            
            <div className="flex justify-between">
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-full font-medium hover:bg-red-600"
                onClick={handleDeleteKeyword}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-full font-medium hover:bg-gray-400"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
      
</div>
</div>
)}


{/* Target Audience input */}
<div className="mb-4">
  <label className="block font-medium mb-2">Target Audience:</label>
  <textarea
    className="input-large bg-gray-200 rounded-lg shadow-sm resize-y h-24 w-3/4"
    placeholder="Enter your target audience (optional)"
    value={targetAudience}
    onChange={(e) => setTargetAudience(e.target.value)}
  />
  <p className="font-light">  <FaSearch className="inline-block mr-2" />Need suggestions on an audience to target? 
  <a
    className="text-blue-500 font-medium cursor-pointer underline ml-2"
    onClick={handleSuggestTargetAudience}
  >
    Click Here
  </a>.
</p>

</div>
{/* Loading Spinner */}
{isAudienceLoading && (
  <div className="flex items-center justify-center mb-4">
    <ThreeDots type="ThreeDots" color="#00BFFF" height={50} width={50} />
    <p className="ml-2">Fetching audience suggestions...</p>
  </div>
)}
{/* Target Audience Suggestions */}
{showAudienceSuggestions && targetAudienceSuggestions.length > 0 && (
  <div className="h-full flex flex-col justify-center items-center">
    <div className="border p-4 mt-2 rounded-xl shadow-xl w-full mb-6 flex flex-col justify-center items-center relative">
      <h2 className="text-lg font-semibold mb-2">Suggested Target Audience:</h2>
      <div>
        {formatAudienceSuggestions(targetAudienceSuggestions)}
      </div>
    </div>
  </div>
)}



<div className="py-4">
        {/* Optimize Button */}
        <button
          className="bg-blue-500 text-white hover:bg-blue-600 py-4 px-4 rounded-full font-medium text-center w-3/4"
          onClick={handleGenerateDescription}
        >
          Optimize Product Listing
        </button>
        </div>
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
        <div className="h-full flex flex-col justify-center items-center">
          <div className="border p-4 mt-2 rounded-xl shadow-xl w-3/4 flex flex-col justify-center items-center relative">
          <h2 className="text-2xl font-semibold mt-6">Optimized Product Listing:</h2>

            <div className="h-full flex flex-col overflow-y-auto justify-center items-center">
              <div className="flex-grow p-8" ref={descriptionRef}>
                {formatDescription(optimizedDescription)}
              </div>
              <div className="absolute bottom-2 right-2">
              <button 
              className="bg-green-500 text-white hover:bg-green-600 py-2 px-6 rounded-full font-medium flex items-center"
              onClick={handleCopyDescription}
              >
                  <FaCopy className="mr-2" /> 
                  Copy
                </button>

              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
