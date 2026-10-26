import { useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Link, useLocation } from "react-router-dom";

import Voxels from "../components/Voxels"
import { GenerateAsync } from "../components/AlgorInterface.js"

// Keep the original sample puzzle available for the class demonstration at /puzzle.
const sampleQuestions = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
    { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
    { question: "What is the chemical symbol for gold?", answer: "Au" },
    { question: "Who wrote Romeo and Juliet?", answer: "Shakespeare" },
    { question: "What process do plants use to make food from sunlight?", answer: "Photosynthesis" },
    { question: "How many sides does a hexagon have?", answer: "Six" },
    { question: "Which ocean is the largest?", answer: "Pacific" },
    { question: "What is the hardest natural substance?", answer: "Diamond" },
    { question: "Which planet is known as the Red Planet?", answer: "Mars" },
    { question: "What is the largest mammal in the world?", answer: "Whale" },
    { question: "What gas do humans need to breathe to survive?", answer: "Oxygen" },
    { question: "What is the capital of Japan?", answer: "Tokyo" },
    { question: "Who painted the Mona Lisa?", answer: "Leonardo" },
    { question: "What is frozen water called?", answer: "Ice" },
    { question: "How many continents are there on Earth?", answer: "Seven" },
    { question: "What is the closest star to Earth?", answer: "Sun" },
    { question: "What is the largest organ in the human body?", answer: "Skin" },
    { question: "What is the chemical symbol for water?", answer: "H2O" },
    { question: "In what country are the pyramids of Giza?", answer: "Egypt" },
    { question: "What force pulls objects toward the Earth?", answer: "Gravity" },
    { question: "How many days are in a leap year?", answer: "366" },
    { question: "What is the smallest prime number?", answer: "Two" },
    { question: "What do bees produce?", answer: "Honey" },
    { question: "What language is spoken in Brazil?", answer: "Portuguese" },
];

export default function Scene() {

    const { state } = useLocation();

    //use questions from navigate state if there is a state, if not, use sample questions
    const questions = useMemo(() => ((state?.questions ?? sampleQuestions).map((question, index) => ({ ...question, number: index + 1 }))), [state])

    const [generationError, setGenerationError] = useState("");

//test loading & rendering the cube asynchronously
    /*
        voxels uses the following format:
        {
            Voxels: [
                [x, y, z, character, color],
            ],
            Words: {
                word: [
                    [x, y, z], //voxels constituting each word, from first to last character
                ]
            },
            CoM: [x, y, z],
        }
    */
    const [voxels, setVoxels] = useState({ Voxels: [[0, 0, 0, "", "black"]], Words: [], CoM: [] });    
    useEffect(() => {
        if (!questions.length) return;
        let cancelled = false;
        const algorInput = {
            Words: questions.map(({ answer }) => answer.toUpperCase().replace(/[^A-Z0-9]/g, "")),
            Priority: [],
            Size: 3,
        };
        GenerateAsync(algorInput)
            .then((generated) => { if (!cancelled) setVoxels(generated); })
            .catch((error) => { if (!cancelled) setGenerationError(error.message); });
        return () => { cancelled = true; };
    }, [questions]);

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

    if (!questions.length) {
        return (
            <section>
                <div className="card">
                    <h1>No puzzle selected</h1>
                    <p>Create a puzzle first, then generate it to play.</p>
                    <Link to="/create" className="btn">Create a Puzzle</Link>
                </div>
            </section>
        );
    }


    // Runs when the player clicks "Check".

    function clean(text){
        return text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }


    function checkAnswer() {
        
        if(clean(answer) === clean(selectedQuestion.answer)) {
        setFeedback("correct!");


        // save this question as answered, unless it's already in the list
        if (!answered.includes(selectedQuestion.number)) {
            setAnswered([...answered, selectedQuestion.number]);
        }
        } 
        else {
            setFeedback("wrong");
        }
    }


    // Runs when the player clicks "Hint".
    // It gives the first letter and the length of the answer, but not the answer itself.
    function showHint() {
        const word = selectedQuestion.answer;
        setHint("Starts with " + word[0].toUpperCase() + " and has " + word.length + " characters");
    }

    const ringLength = 2 * Math.PI * 22;
    const ringFilled = (answered.length / questions.length) * ringLength;
    // ringFilled is the part of that length to color in, based on how many are answered.

    return (

        <section>

            {state?.title && <h1>{state.title}</h1>}
            {generationError && <p role="alert" className="feedback-wrong">Could not generate the puzzle: {generationError}</p>}

            {/*hint button & progress */}
            <div className="puzzle-topbar ">
            
            <div className="topbar-card">
                <svg className="progress-ring" viewBox="0 0 56 56" role="img"
                    aria-label={answered.length + " of " + questions.length + " answered"}>
                {/* the grey circle behind */}
                <circle cx="28" cy="28" r="22" className="ring-track" />

                {/* the teal arc. strokeDasharray means "draw this much, then leave a gap".
                    Drawing ringFilled out of ringLength colors in that fraction of the circle.
                    rotate(-90) makes it start at the top instead of the right side. */}
                <circle
                    cx="28" cy="28" r="22"
                    className="ring-fill"
                    style={{ strokeDasharray: ringFilled + " " + ringLength }}
                    transform="rotate(-90 28 28)"
                />

                {/* the number answered, in the middle */}
                <text x="28" y="33" textAnchor="middle" className="ring-text">
                    {answered.length}
                </text>
            </svg>
                <p className="progress-text">{answered.length} of {questions.length} questions answered</p>
            </div>



            <div className="topbar-card">

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

            <div className="puzzle-layout">

                {/* cube */}
                <div className="puzzle-cube">
                    <Canvas camera={{ position: [0, 0, 20], fov: 20 }}>
                        <OrbitControls enableDamping />
                        <ambientLight intensity={10} />
                        <Voxels voxels={voxels} />
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

                                    //highlight the selected word in the puzzle
                                    setVoxels(original => {
                                        const vd = structuredClone(original);
                                        vd.Voxels.map((v, i) => vd.Voxels[i][4] = undefined); //unhighlight all voxels
                                        const answerWord = q.answer.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                        const wordVoxels = vd.Words[answerWord] ?? [];
                                        wordVoxels.map(hv => {
                                            vd.Voxels.map((v, i) => {
                                                if (hv[0] == v[0] && hv[1] == v[1] && hv[2] == v[2]) {
                                                    vd.Voxels[i][4] = "orange";
                                                }
                                            })
                                        })
                                        return vd;
                                    });
                                }} >

                                {answered.includes(q.number) && "✓ "}
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


                    

                </div>
            </div>


        </section>
    );
}
