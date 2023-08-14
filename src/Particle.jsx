import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';


export const Particles = ({particlePositions}) => {
    console.log("particles");
    console.log(particlePositions);
    const ref = useRef();
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute 
                    attach='attributes-position'
                    count={particlePositions.length/3}
                    itemSize={3}
                    array={particlePositions}
                    onUpdate={self => {
						self.needsUpdate = true
					}}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.01}
                color={"green"}
                transparent
            />
        </points>
    );
};