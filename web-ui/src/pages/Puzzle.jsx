"use strict";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Voxels from "../components/Voxels"
import VoxelData from "../assets/test.json"
import crosswordAlgor from "../components/CrosswordAlgor.py?raw";
import { useEffect, useState } from "react";
import { struct } from "three/src/nodes/TSL.js";

let pyodidePromise = null;
function loadPyodideOnce() {
    if (!pyodidePromise) {
        pyodidePromise = (async () => {
            // Load the Pyodide loader script once.
            await new Promise((resolve, reject) => {
                console.log("Loading Pyodide...");
                const s = document.createElement("script");
                s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
            return await window.loadPyodide();
        })();
    }
    return pyodidePromise;
}

function orange(vox) {
    const newVox = structuredClone(vox);
    for (const voxel of newVox.Voxels) {
        if (voxel.length < 5) {
            voxel[4] = "orange";
            break;
        }
    }
    return newVox;
}
export default function Scene() {
    /*
    loadPyodideOnce().then(async (py) => {
        //py.runPython(crosswordAlgor);
    });
    console.log("Scene() called");
    */

    const [vd, setVd] = useState(VoxelData);

    //for testing: every second, turn a voxel's color to orange
    useEffect(() => {
        const id = setInterval(() => {
            setVd(prev => orange(prev));
        }, 1000)
        return () => clearInterval(id);
    }, [])

    return (
        <div style={{ width: "100vw", height: "80vh" }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 20 }}>
                <OrbitControls enableDamping />
                <ambientLight intensity={10} />
                <Voxels voxels={vd} />
            </Canvas>
        </div>
    );
}