import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const STORAGE_KEY = "puzzles";

function readPuzzles() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
}


function Library() {

    //react read the puzzles from local storage and store them 
    const [puzzles, setPuzzles] = useState(readPuzzles);
    const navigate = useNavigate();

    function deletePuzzle(id) {
        if (!window.confirm("Delete this puzzle?")) {
         return; }
        //filter leaves out the puzzle with the given id and updates the state and local storage
        const updatedPuzzles = puzzles.filter((puzzle) => puzzle.id !== id);
        setPuzzles(updatedPuzzles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPuzzles));
    }

    return (
        <section className="library-page">

        {/* if there are puzzles, show them in a grid */}


            <div className="library-heading">
                <div>
                    <p className="library-eyebrow">YOUR COLLECTION</p>
                    <h1>Puzzle Library</h1>
                    <p className="library-description">All the puzzles you have created in one place.</p>
                </div>
                
                <Link to="/create" className="btn">+ Create a Puzzle</Link>
            </div>

                {/* puzzle count */}
                <p className="library-count">
                    Total: {puzzles.length} {puzzles.length === 1 ? "puzzle" : "puzzles"}
                </p>

            {puzzles.length === 0 ? (
                // if there are no puzzles
                <div className="card library-empty">
                    <div className="library-empty-icon" aria-hidden="true">✦</div>

                    <h2>Your library is waiting</h2>
                    <p>Once you create a puzzle, it will show up here so you can play it again anytime.</p>
                    
                    <Link to="/create" className="btn">Create your first puzzle</Link>

=                       
                    

                </div>
            ) : (
                <div className="library-grid">
                    {/* if there are puzzles, show them in a grid */}
                    {/* goes through the list of puzzles and displays each one */}
                    {puzzles.map((puzzle) => (
                        <div className="card library-card" key={puzzle.id}>
                            <div className="library-card-icon" aria-hidden="true">✦</div>

                            <h2>{puzzle.title}</h2> 
                            <p>{puzzle.questions.length} clues</p>

                            {/* add created date */}
                            <p className="library-date">
                                
                                Created {puzzle.createdAt 
                                ? new Date(puzzle.createdAt).toLocaleDateString(undefined,
                                    { month: "short", day: "numeric", year: "numeric"
                                }) : "recently"}
                                
                                </p>



                            <div className="library-card-actions">
                            {/* play puzzle button */}
                            <button className="btn library-play-button" 
                                onClick={() => navigate("/puzzle", { 
                                // tells react router to open puzzle page and carry the title and questions pairs over
                                state: { 
                                    title: puzzle.title, 
                                    questions: puzzle.questions,                       
                                },                                
                            })}>  Play Puzzle 
                            </button>
                            
                            {/* delete puzzle button */}
                            <button className="btn-remove" 
                             onClick={() => deletePuzzle(puzzle.id)}>  
                             Delete 
                            </button>
                            </div>       


                        </div>
                    ))}
                </div>
            )}




        </section>
    );
}

export default Library;
