import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

// Draws one letter on a canvas and wraps it in a texture.
function makeLetterTexture(letter) {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${size * 0.8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2 + size * 0.04);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

// All voxels that share one letter, drawn as a single InstancedMesh.
function LetterGroup({ letter, voxels }) {
    const meshRef = useRef();
    const texture = useMemo(() => makeLetterTexture(letter), [letter]);

    useEffect(() => () => texture.dispose(), [texture]);

    useLayoutEffect(() => {
        const mesh = meshRef.current;

        voxels.forEach((v, i) => {
            dummy.position.set(v[0], v[1], v[2]);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, tmpColor.set(v.color ?? "white"));
        });

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }, [voxels]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial map={texture} />
        </instancedMesh>
    );
}

export default function Voxels({ voxels }) {
    // Group voxels by letter. Recomputed only when the data changes.
    const groups = useMemo(() => {
        const byLetter = new Map();
        for (const v of voxels) {
            const key = v[3] ?? "";
            if (!byLetter.has(key)) byLetter.set(key, []);
            byLetter.get(key).push(v);
        }
        return [...byLetter.entries()];
    }, [voxels]);

    return groups.map(([letter, items]) => (
        <LetterGroup key={letter} letter={letter} voxels={items} />
    ));
}