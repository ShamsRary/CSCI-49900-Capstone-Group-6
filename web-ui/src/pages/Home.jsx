import { Link } from "react-router-dom";
import logo from "../assets/cube.png";

function Home() {
    return ( 
        <section>
        
        {/* intro */}
        <div className="card">
            
            {/* <h3> designs: ⚪︎⚫︎⚬✦✧✩✢✫✰✯✮▸◂▻◅◄►▹◃◂▸▷◁◀︎▶︎▿▵▾▴▽△▼▲◸◿◹◺◭◮◌○◈◊⬖⬗⬘⬙∴∵⦁⧫ </h3> */}
            <h1>▻▹▷ ✦ Crossy Word ✦ ◁◃◅</h1>
            <p> Welcome to Crossy Word! </p>

            <div className="logo-wrapper">
                <img src={logo} alt="Crossy Word Logo" className="logo" />
            </div>
        
        </div>


        {/* Features */}
        <div className="card">
            <h2> Why Crossy Word? </h2>            
            
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


        {/* Call to Action */}
        <div className=" card">
            <h2 > Get Started Now! </h2>

            <div className="card">
                <h3> Try it out! </h3>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Link to="/play" className="btn"> Create Your First Puzzle</Link>
                </div>
            </div>
        
        
        <div className="card">
            <h3> Sign up to save and share your puzzles! </h3>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Link to="/login" className="btn"> Sign Up </Link>
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