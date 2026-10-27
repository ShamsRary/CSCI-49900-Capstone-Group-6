import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {

    // memory 1: which tab is showing, "login" or "signup"
    const [mode, setMode] = useState("login");

    // memory 2-5: what the player typed in each box
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // memory 6-7: a red error message and a green success message ("" = none)
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Runs when the player clicks a tab.
    // It also clears old messages so they don't follow the player to the other tab.
    function switchMode(newMode) {
        setMode(newMode);
        setError("");
        setMessage("");
    }

    // Runs when the player clicks the button or presses Enter.
    function handleSubmit(e) {
        // A form normally reloads the whole page when submitted.
        // This line stops that, so React stays in control.
        e.preventDefault();
        setMessage("");

        // Check the boxes one at a time.
        // "return" stops the function at the first problem found.
        if (mode === "signup" && !username.trim()) {
            setError("Enter a username.");
            return;
        }
        if (!email.includes("@")) {
            setError("Enter a valid email address.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (mode === "signup" && password !== confirm) {
            setError("The passwords don't match.");
            return;
        }
        setError("");

        // Backend not connected yet, so just report success for now.
        // Don't log the password, even while testing.
        console.log("Ready to send to backend:", { mode, email });
        setMessage(mode === "login" ? "Logged in! (backend coming soon)" : "Account created! (backend coming soon)");
    }

    return (
        <section>
            <div className="card auth-card">

                {/* the title changes with the tab */}
                <h1>{mode === "login" ? "Log In" : "Sign Up"}</h1>

                {/* the two tabs. type="button" stops them from submitting the form.
                    "auth-tab-active" is added only to the tab that's showing. */}
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={"auth-tab" + (mode === "login" ? " auth-tab-active" : "")}
                        onClick={() => switchMode("login")}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className={"auth-tab" + (mode === "signup" ? " auth-tab-active" : "")}
                        onClick={() => switchMode("signup")}
                    >
                        Sign Up
                    </button>
                </div>

        
        
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

                {/* form */}
                {mode === "signup" && (
                    <div className="auth-field">
                        <label htmlFor="username">Username</label>

                        <input 
                            id="username"
                            type="text"
                            placeholder="e.g. crossy_fan"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                )}

                <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {mode === "signup" && (
                    <div className="auth-field">
                        <label htmlFor="confirm">Confirm password</label>
                        <input
                            id="confirm"
                            type="password"
                            placeholder="Type it again"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>
                )}

                {error && <p role="alert" className="feedback-wrong">{error}</p>}
                {message && <p className="feedback-correct">{message}</p>}

                <button type="submit" className="btn">
                    {mode === "login" ? "Log In" : "Create Account"}
                </button>
            </form>

                {/* players can use the site without an account */}
                <p>
                    Just want to try it?  <Link to="/create"> Continue as a guest</Link>
                </p>

            </div>
        </section>
    );
}

export default Login;