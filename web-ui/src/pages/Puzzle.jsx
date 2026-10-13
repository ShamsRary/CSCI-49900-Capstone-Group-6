import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Scene() {
    return (
        <div style={{ width: "100vw", height: "80vh" }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 20 }}>
                <OrbitControls enableDamping />
                <ambientLight intensity={10} />
                <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                    <boxGeometry args={[3, 3, 3]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </Canvas>
        </div>
    );
}