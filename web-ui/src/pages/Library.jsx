import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const STORAGE_KEY = "puzzles";

function readPuzzles() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function Library() {

    //react read the puzzles from local storage and store them 
    const [puzzles, setPuzzles] = useState(readPuzzles);
    const [puzzleToDelete, setPuzzleToDelete] = useState(null);
    const [puzzleToReplay, setPuzzleToReplay] = useState(null);
    const navigate = useNavigate();

    function deletePuzzle(id) {
        //filter leaves out the puzzle with the given id and updates the state and local storage
        const updatedPuzzles = puzzles.filter((puzzle) => puzzle.id !== id);
        setPuzzles(updatedPuzzles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPuzzles));
        setPuzzleToDelete(null);
    }

    
    function replayPuzzle() {
        if (!puzzleToReplay) return;
        const puzzle = puzzleToReplay;
        const updatedPuzzles = puzzles.map((savedPuzzle) => savedPuzzle.id === puzzle.id
            ? { ...savedPuzzle, completed: false, answeredQuestions: [] }
            : savedPuzzle);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPuzzles));
        setPuzzles(updatedPuzzles);
        setPuzzleToReplay(null);
        navigate("/puzzle", {
            state: {
                puzzleId: puzzle.id,
                title: puzzle.title,
                questions: puzzle.questions,
            },
        });
    }

    return (
        <section className="library-page">

        {/* if there are puzzles, show them in a grid */}

        
            <div className="library-heading">
                <div>
                    <p className="library-eyebrow">YOUR COLLECTION</p>
                    <h1>My Puzzles</h1>
                    <p className="library-description">Your created puzzles, ready whenever you are.</p>
                </div>
                
                <Link to="/create" className="btn">+ Create a Puzzle</Link>
            </div>

            {/* guest mode */}
            <div className="guest-library-note" role="note">
                <span className="guest-library-icon" aria-hidden="true">
                    
                    {/* icon */}
                    <svg viewBox="0 0 24 24" focusable="false">
                        <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
                        <path d="M3.5 9h17M7 6.8h.01M10 6.8h.01" />
                    </svg>

                </span>
                <p><strong>Guest mode</strong><br />Your puzzles are saved in this browser, so you can come back to them on this device.</p>
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
                     
                    
                </div>
            ) : (
                <div className="library-grid">
                    {/* if there are puzzles, show them in a grid */}
                    {/* goes through the list of puzzles and displays each one */}
                    {puzzles.map((puzzle) => (

                        <div className="card library-card" key={puzzle.id}>
                            
                            <div className="library-card-topline">
                                <div className={"library-card-icon" + 
                                    // star is red if puzzle, incomplete, green if complete + replay button
                                    (puzzle.completed === true ? " library-card-icon-complete" : " library-card-icon-incomplete")} 
                                    role="img" aria-label={puzzle.completed === true ? "Puzzle complete" : "Puzzle incomplete"}>✦</div>
                                
                                {/* replay button */}
                                {puzzle.completed === true && (
                                    <button className="btn-replay" type="button" onClick={() => setPuzzleToReplay(puzzle)}>
                                        Replay
                                    </button>
                                    
                                )}
                            </div>


                            <h2>{puzzle.title}</h2>
                            <p>{puzzle.questions.length} questions</p>

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
                                    puzzleId: puzzle.id,
                                    title: puzzle.title, 
                                    questions: puzzle.questions,                       
                                },                                
                            })}>  Play Puzzle 
                            </button>

                            {/* delete puzzle button */}
                            <button className="btn-remove" 
                             onClick={() => setPuzzleToDelete(puzzle)}>  
                             Delete 
                            </button>
                            </div>       


                        </div>
                    ))}
                </div>
            )}




            {puzzleToDelete && (
                <div className="confirm-overlay" onClick={(event) => {
                    if (event.target === event.currentTarget) setPuzzleToDelete(null);
                }}>
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                        <h2 id="delete-title">Delete puzzle: {puzzleToDelete.title}</h2>
                        <p>Are you sure you want to delete this puzzle?</p>
                        <div className="confirm-actions">
                            <button className="btn-hint" onClick={() => setPuzzleToDelete(null)}>Cancel</button>
                            <button className="btn-remove" onClick={() => deletePuzzle(puzzleToDelete.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {puzzleToReplay && (
                <div className="confirm-overlay" onClick={(event) => {
                    if (event.target === event.currentTarget) setPuzzleToReplay(null);
                }}>
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="replay-title">
                        <h2 id="replay-title">Replay {puzzleToReplay.title}?</h2>
                        <p>This will reset your answers and start the puzzle over.</p>
                        <div className="confirm-actions">
                            <button className="btn-hint" onClick={() => setPuzzleToReplay(null)}>Cancel</button>
                            <button className="btn-replay" onClick={replayPuzzle}>Replay</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Library;
