import { useState } from "react";

function Create() {
    const [title, setTitle] = useState(""); 
        //a variable 'title', a function 'setTitle' to update the title
        //initialize the title state variable to an empty string
        
    const [pairs, setPairs] = useState([
        //a state variable for the question-answer pairs
        // initialized to an array with two empty objects
        //each pair object has a 'question' and an 'answer' property
        { question: "", answer: "" },
        { question: "", answer: "" },
    ]);

    function updatePair(index, field, value) {
        //create a function to update a specific question-answer pair
        //runs everytime user types in question/answer box
        //takes 3 parameters: index of the pair, field to update, new value

        const newPairs = [...pairs]; 
        //make copy of the current pairs array
        newPairs[index] = { ...newPairs[index], [field]: value }; 
        //update the specific field of the pair at the given index with the new value
        setPairs(newPairs);
        //update the state with the new pairs array

    }

    function addPair() {
        //create a function to add a new question-answer pair
        setPairs([...pairs, { question: "", answer: "" }]);
        //add a new empty pair to the end of the pairs array
    }

    function removePair(index) {
        if (pairs.length ===2) {
            return;
        }
        //create a function to remove a specific question-answer pair
        // .filter() goes through the list one row at a time and KEEPS only
        // the rows where the answer is true.
        //   "_" is the row itself (we don't need it, so it gets a placeholder name)
        //   "i"  is that row's position in the list
        // "i !== index" means "keep every row EXCEPT the one we're removing".
        const newPairs = pairs.filter((_, i) => i !== index);
        setPairs(newPairs);
    }

    return (
        <section>
            <h1>Create a Puzzle</h1>

            <div className="card">
                <h2>Puzzle Title</h2>

                {/* input field for the puzzle title */}
                <input
                    type="text"
                    placeholder="e.g. Biology Chapter 3"
                    value={title}
                    
                    onChange={(e) => setTitle(e.target.value)}
                    /* update the title state variable whenever the user types in the input field */
                />

            </div>

            <div className="card">
                <h2>Questions and Answers</h2>

                {pairs.map((pair, index) => (
                    /* .map() goes through the list one row at a time and draws */
                    /* a question box and an answer box for EACH row. */
                    <div key={index} className="pair-row">
                        <input
                            type="text"
                            placeholder="Question"
                            value={pair.question}
                            onChange={(e) => updatePair(index, "question", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Answer"
                            value={pair.answer}
                            onChange={(e) => updatePair(index, "answer", e.target.value)}
                        />

                         <button className="btn-remove" onClick={() => removePair(index)}>  Delete </button>

                    </div>
                ))}

                <button className="btn-add" onClick={addPair}>+ Add </button>

                
                <div style={{ marginTop: "30px" }}>

                    <button className="btn" onClick={() => console.log({ title, pairs })}> Generate Puzzle </button>
                </div>



            </div>

        <div className="footer">
            
        </div>


        </section>


            

    );
}

export default Create;