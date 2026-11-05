// F1 backdrop: ShaderGradient (MIT, github.com/ruucm/shadergradient), an
// animated Three.js mesh gradient, configured for racing red on carbon.
// "3d" lighting avoids the remote HDR environment maps the "env" mode loads.
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

export default function F1Gradient({ dense }: { dense: boolean }) {
  return (
    <ShaderGradientCanvas
      // A soft gradient needs few pixels; this keeps the GPU cost low.
      pixelDensity={dense ? 0.5 : 0.6}
      fov={45}
      pointerEvents="none"
      lazyLoad={false}
      powerPreference="low-power"
      style={{ position: "absolute", inset: 0 }}
    >
      <ShaderGradient
        control="props"
        type="waterPlane"
        animate="on"
        uSpeed={0.12}
        uStrength={2.2}
        uDensity={1.1}
        uFrequency={4.2}
        uAmplitude={0}
        color1="#a30a1f"
        color2="#3a0510"
        color3="#0b0c0f"
        brightness={0.55}
        lightType="3d"
        grain="off"
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={3.4}
        cameraZoom={1}
        positionX={0}
        positionY={0.9}
        positionZ={-0.3}
        rotationX={45}
        rotationY={0}
        rotationZ={0}
      />
    </ShaderGradientCanvas>
  );
}
