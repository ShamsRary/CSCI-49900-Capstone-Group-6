import { useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Voxels from "../components/Voxels"
import VoxelData from "../assets/test.json"




// Fake questions for now.
// Each question has a number, a question, and the correct answer.
const questions = [
    { number: 1, question: "What is the capital of France?", answer: "Paris" },
    { number: 2, question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
    { number: 3, question: "What is the largest planet in our solar system?", answer: "Jupiter" },
    { number: 4, question: "What is the chemical symbol for gold?", answer: "Au" },
    { number: 5, question: "Who wrote Romeo and Juliet?", answer: "Shakespeare" },
    { number: 6, question: "What process do plants use to make food from sunlight?", answer: "Photosynthesis" },
    { number: 7, question: "How many sides does a hexagon have?", answer: "Six" },
    { number: 8, question: "Which ocean is the largest?", answer: "Pacific" },
    { number: 9, question: "What is the hardest natural substance?", answer: "Diamond" },
    { number: 10, question: "Which planet is known as the Red Planet?", answer: "Mars" },
    { number: 11, question: "What is the largest mammal in the world?", answer: "Whale" },
    { number: 12, question: "What gas do humans need to breathe to survive?", answer: "Oxygen" },
    { number: 13, question: "What is the capital of Japan?", answer: "Tokyo" },
    { number: 14, question: "Who painted the Mona Lisa?", answer: "Leonardo" },
    { number: 15, question: "What is frozen water called?", answer: "Ice" },
    { number: 16, question: "How many continents are there on Earth?", answer: "Seven" },
    { number: 17, question: "What is the closest star to Earth?", answer: "Sun" },
    { number: 18, question: "What is the largest organ in the human body?", answer: "Skin" },
    { number: 19, question: "What is the chemical symbol for water?", answer: "H2O" },
    { number: 20, question: "In what country are the pyramids of Giza?", answer: "Egypt" },
    { number: 21, question: "What force pulls objects toward the Earth?", answer: "Gravity" },
    { number: 22, question: "How many days are in a leap year?", answer: "366" },
    { number: 23, question: "What is the smallest prime number?", answer: "Two" },
    { number: 24, question: "What do bees produce?", answer: "Honey" },
    { number: 25, question: "What language is spoken in Brazil?", answer: "Portuguese" },
];

export default function Scene() {
    
    //memory 1: which question the player clicked. Null means none yet.
    const [selected, setSelected] = useState(null);

    //memory 2: the text hte player typed in answer box
    const [answer, setAnswer] = useState("");


    // Look through the list and grab the question that was clicked.
    // .find() returns the first item where the test is true.
    // If nothing is selected, it returns undefined (meaning "nothing").
    const selectedQuestion = questions.find((q) => q.number === selected);

    // memory 3: the result message. "" = nothing yet, "correct", or "wrong"
    const [feedback, setFeedback] = useState("");

    // memory 4: the numbers of the questions answered correctly, like [1, 4, 7]
    const [answered, setAnswered] = useState([]);


    // memory 5: the hint text shown in the top bar. "" means no hint yet.
    const [hint, setHint] = useState("");


    // Runs when the player clicks "Check".
    function checkAnswer() {
        // .trim() removes extra spaces at the start and end.
        // .toLowerCase() makes everything lowercase, so "paris" and "Paris" match.
        const typed = answer.trim().toLowerCase();
        const correct = selectedQuestion.answer.trim().toLowerCase();

        // If they match, save "correct" in memory. Otherwise save "wrong".
        // Saving it makes React redraw the page, which shows the message.
        if (typed === correct) {
            setFeedback("correct");
        } else {
            setFeedback("wrong");
        }
    }     


    // Runs when the player clicks "Hint".
    // It gives the first letter and the length of the answer, but not the answer itself.
    function showHint() {
        const word = selectedQuestion.answer;
        setHint("Starts with " + word[0].toUpperCase() + " and has " + word.length + " characters");
    }

    return (

    <section>

        <div className="puzzle-layout">

            {/* cube */}
            <div className="puzzle-cube">
                    <Canvas camera={{ position: [0, 0, 20], fov: 20 }}>
                        <OrbitControls enableDamping />
                        <ambientLight intensity={10} />
                        <Voxels voxels={VoxelData} />
                    </Canvas>    
            </div>


            {/* questions list */}

            <div className="puzzle-side">
                    <div className="card questions-card">
                        {/* .map() draws one line for EACH question in the list.
                            "key" is a label React needs to tell the lines apart. */}
                        {questions.map((q) => (
                            <div
                                key={q.number}
                                // add "question-selected" only for the clicked question
                                className={"question-item" + 
                                    (selected === q.number ? " question-selected" : "") +
                                        (answered.includes(q.number) ? " question-done" : "")

                                }
                                // clicking saves this question's number and empties the answer box
                                onClick={() => {
                                    setSelected(q.number);
                                    setAnswer("");
                                    setFeedback("");
                                    setHint("");   

                                }} >
                               
                                <strong>{q.number}.</strong> {q.question}
                            </div>
                        ))}
                    </div>


            {/* answer  */}
                    {/* The && means: only draw this card if selectedQuestion has something in it.
                        With nothing selected it's undefined, so the card stays hidden. */}
                    {selectedQuestion && (
                        <div className="card">
                            <h2>Your Answer</h2>
                            <p>{selectedQuestion.number}. {selectedQuestion.question}</p>
                        
                        
                            <div className="answer-row">
                                {/* same loop as the Create page: the box shows what's in memory,
                                    and typing saves back into memory */}
                                <input
                                    type="text"
                                    placeholder="Type your answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                />
                                <button className="btn-check" onClick={checkAnswer}>Check</button>
                            </div>
                                {/* Each line only appears when feedback holds that exact word */}
                                {feedback === "correct" && <p className="feedback-correct">Correct!</p>}
                                {feedback === "wrong" && <p className="feedback-wrong">Not quite, try again.</p>}
                                    
                        </div>
                    )}


            {/*hint button and hint text */}
                <div className="puzzle-topbar">
                    {/* disabled means greyed out and unclickable. It's disabled until a question is selected. */}
                    <button className="btn-hint" onClick={showHint} disabled={!selectedQuestion}>
                        Hint
                    </button>

                    {/* Shows the hint if there is one. Otherwise shows a short instruction. */}
                    <p className="hint-text">
                        {hint !== ""
                            ? hint
                            : selectedQuestion
                                ? "Click Hint for a clue."
                                : "Select a question to get a hint."}
                    </p>
                </div>

            </div>
        </div>


    </section>
    );
}