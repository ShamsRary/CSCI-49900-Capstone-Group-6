import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Voxels from "../components/Voxels"
import VoxelData from "../assets/test.json"

export default function Scene() {
    return (
        <div style={{ width: "100vw", height: "80vh" }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 20 }}>
                <OrbitControls enableDamping />
                <ambientLight intensity={10} />
                <Voxels voxels={VoxelData} />
            </Canvas>
        </div>
    );
}