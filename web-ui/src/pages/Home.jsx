import { Link } from "react-router-dom";
import logo from "../assets/cube.png";

function Home() {
    return ( 
        <section>
        
        {/* intro */}
        <div className="card">
            
            <div className="logo-wrapper">
                <img src={logo} alt="Crossy Word Logo" className="logo" />
            </div>
            
            <h1>◀ ✦ Crossy Word ✦ ▶</h1>
            <p> Welcome to Crossy Word! </p>
            

            <div >
                <Link to="/create" className="btn">Create Your First Puzzle</Link>
            </div>


            
        
        </div>


        {/* Features */}
        <h2> Why Crossy Word? </h2>            

        <div className="feature-grid">
            
            <div className="card card-lightblue">
                <h3> AI-Generated Puzzles</h3> 
                <p> Turn your own notes into a crossword puzzle automatically!</p>
            </div>

            <div className="card card-lightblue">
                <h3> Study Your Way</h3>
                <p> Upload study materials of any subject and create personalized puzzles!</p>
            </div>
            
            <div className="card card-lightblue">
                <h3> Smart Review</h3>
                <p> Questions you struggle with will be reinforced through targeted practice!</p>
            </div>
            

            <div className="card card-lightblue">
                <h3>Learn and Have Fun</h3>
                <p>Learn while having fun with our interactive 3D crossword puzzles!</p>
            </div>

            <div className="card card-lightblue">
                <h3>Play Puzzles</h3>
                <p>Play puzzles created by other users and test your knowledge!</p>
            </div>

        </div>


        <div className="card">
            <h2>How It Works</h2>
            
            <div className="cta-row">
                <div className="card">
                    <h3>1. Upload</h3>
                    <p>Add your questions and answers.</p>
                </div>
                <div className="card">
                    <h3>2. Generate</h3>
                    <p>We build a 3D crossword cube.</p>
                </div>
                <div className="card">
                    <h3>3. Solve</h3>
                    <p>Play, review, and learn.</p>
                </div>
            </div>

        </div>


        {/* Call to Action */}
        <div className=" card card-lightblue">
            <h2 > Get Started Now! </h2>

            <div className="cta-row">
                <div className="card">
                    <h3> Try it out! </h3>
                    <div>
                        <Link to="/create" className="btn"> Create Your First Puzzle</Link>
                    </div>
                </div>
            
            
                <div className="card">
                    <h3> Sign up to save and share your puzzles! </h3>
                    <div >
                        <Link to="/login" className="btn"> Sign Up </Link>
                    </div>
                </div>

            </div>
        </div>


        {/* footer */}
        <div className="footer">
            <p>Computer Science Capstone Project</p>
            <p>Group 6 2026</p>
            <p> Members: Shams Rary, Maheru Hoque, Darren Wang, Joyce Jiang
</p>
        </div>
        </section>




    )
}

export default Home;