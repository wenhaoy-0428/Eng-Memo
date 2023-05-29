import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Stage, OrbitControls, Text, Text3D, Center, Float } from "@react-three/drei";
import font from "three/examples/fonts/helvetiker_bold.typeface.json";
import { useUser } from "../../contexts/UserContext";

import trophyCard from "./3dAssets/TrophyCard.glb";
import envMap from "./3dAssets/kloofendal_48d_partly_cloudy_puresky_1k.hdr";

// const PATH_TROPHY_CARD = "/3dAssets/TrophyCard.glb";
// const PATH_ENV_MAP = "/3dAssets/kloofendal_48d_partly_cloudy_puresky_4k.hdr";

export default function TrophyCard() {
  /**
   * Model of the TrophyCard
   */
  function Model() {
    // contains all nodes and materials of the 3D model
    const { nodes, materials } = useGLTF(trophyCard);
    // Get user information from global context
    // TODO: consider if needs to update user when milestone is implemented
    const { user } = useUser();

    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}.${month}.${day}`;

    return (
      <>
        <Stage
          adjustCamera={1.5}
          intensity={0.5}
          shadows="accumulative"
          environment={{
            files: envMap,
          }}
        >
          <group scale={0.3} dispose={null}>
            {/* consecutiveDays */}
            <Center>
              <Text3D font={font} scale={[1, 1, 0.8]} material={materials.bevelMetal}>
                {user["milestone_streak"]}
              </Text3D>
            </Center>

            {/* user name at back */}
            <Text
              position={[0, 0, -0.11]}
              maxWidth={5}
              fontSize={0.9}
              textAlign="center"
              overflowWrap="break-word"
              rotation={[0, Math.PI, 0]}
            >
              {`${user["name"]}`}
            </Text>
            {/* Time footer */}
            <Text
              position={[0, -2.2, -0.11]}
              maxWidth={5}
              fontSize={0.2}
              textAlign="center"
              overflowWrap="break-word"
              rotation={[0, Math.PI, 0]}
            >
              {formattedDate}
            </Text>

            {/* 3D trophy card */}
            <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[2.5, 0.1, 2.5]}>
              <mesh castShadow receiveShadow geometry={nodes.TrophyCard_1.geometry} material={materials.MainMetal} />
              <mesh castShadow receiveShadow geometry={nodes.TrophyCard_2.geometry} material={materials.bevelMetal} />
              <mesh castShadow receiveShadow geometry={nodes.TrophyCard_3.geometry} material={materials.RoughMetal} />
              <mesh castShadow receiveShadow geometry={nodes.TrophyCard_4.geometry} material={materials.LarualMaterial} />
            </group>
          </group>
        </Stage>
      </>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas>
        <OrbitControls enableZoom={false} />
        <pointLight position={[-1, 2, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Float>
            <Model />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(trophyCard);
