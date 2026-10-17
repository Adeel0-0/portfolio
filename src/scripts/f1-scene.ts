import * as THREE from "three";
import { gsap } from "gsap";

export interface SceneHandle {
  play(callbacks: { onReveal(): void; onComplete(): void }): void;
  dispose(): void;
}

/** Original procedural scene. No downloaded model, texture, footage or component code. */
export async function prepareScene(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<SceneHandle> {
  if (signal.aborted)
    throw new DOMException("Preparation cancelled", "AbortError");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  const world = new THREE.Scene();
  world.background = new THREE.Color("#090e16");
  const camera = new THREE.PerspectiveCamera(
    62,
    innerWidth / innerHeight,
    0.1,
    220,
  );
  camera.position.set(0, 1.3, 7);
  camera.lookAt(0, 0.7, -70);
  const uniforms = {
    uTravel: { value: 0 },
    uBend: { value: 0 },
    uSpeed: { value: 1 },
  };
  const resources: (THREE.BufferGeometry | THREE.Material)[] = [];
  let dead = false;
  let timeline: gsap.core.Timeline | undefined;

  const roadGeometry = new THREE.PlaneGeometry(28, 200, 20, 80);
  roadGeometry.rotateX(-Math.PI / 2);
  roadGeometry.translate(0, -0.15, -92);
  const roadMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv; varying float vDepth; uniform float uBend;
      void main(){vUv=uv; vec3 p=position; p.x+=pow(max(0.,-p.z)/200.,2.)*uBend;
      vDepth=-p.z; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec2 vUv; varying float vDepth; uniform float uTravel;
      void main(){float x=abs(vUv.x-.5); float stripe=step(.5,fract(vUv.y*40.+uTravel*.14));
      vec3 c=vec3(.045,.065,.09); c=mix(c,vec3(.09,.11,.14),step(x,.33));
      float curb=step(.33,x)*(1.-step(.37,x)); c=mix(c,mix(vec3(.65,.05,.03),vec3(.85),stripe),curb);
      float dash=(1.-step(.0015,abs(x-.11)))*stripe; c=mix(c,vec3(.5),dash);
      float edge=(1.-step(.0015,abs(x-.32))); c=mix(c,vec3(.8,.83,.9),edge);
      float fade=1.-smoothstep(25.,175.,vDepth); c=mix(vec3(.035,.055,.086),c,fade);
      gl_FragColor=vec4(c,1.); }`,
  });
  resources.push(roadGeometry, roadMaterial);
  world.add(new THREE.Mesh(roadGeometry, roadMaterial));

  const geometry = new THREE.BoxGeometry(0.045, 0.045, 3);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `uniform float uTravel; uniform float uBend; uniform float uSpeed; varying float vSide; varying float vDepth; varying vec2 vUv;
      void main(){vUv=uv; vec3 local=position; local.z*=uSpeed;
      vec4 p=instanceMatrix*vec4(local,1.); p.z=mod(p.z+uTravel,200.)-193.;
      vSide=step(0.,p.x); vDepth=-p.z; p.x+=pow(max(0.,-p.z)/200.,2.)*uBend;
      gl_Position=projectionMatrix*modelViewMatrix*p;}`,
    fragmentShader: `varying float vSide; varying float vDepth; varying vec2 vUv;
      void main(){vec3 c=mix(vec3(1.,.15,.07),vec3(.8,.89,1.),vSide);
      c*=1.-smoothstep(70.,190.,vDepth); gl_FragColor=vec4(c,1.);}`,
  });
  resources.push(geometry, material);
  const count = innerWidth < 600 ? 100 : 180;
  const trails = new THREE.InstancedMesh(geometry, material, count);
  trails.frustumCulled = false;
  const dummy = new THREE.Object3D();
  // Deterministic distribution avoids rebuilding random textures or particle buffers per frame.
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? 1 : -1;
    dummy.position.set(
      side * (5 + (i % 7) * 0.75),
      0.2 + (i % 9) * 0.48,
      -((i * 17.37) % 200),
    );
    dummy.scale.set(1 + (i % 3), 1, 1 + (i % 4));
    dummy.updateMatrix();
    trails.setMatrixAt(i, dummy.matrix);
  }
  world.add(trails);

  const size = () => {
    const dpr = Math.min(
      devicePixelRatio || 1,
      innerWidth < 600 ? 1 : 1.5,
      1920 / innerWidth,
    );
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  const dispose = () => {
    if (dead) return;
    dead = true;
    timeline?.kill();
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", size);
    signal.removeEventListener("abort", dispose);
    resources.forEach((resource) => resource.dispose());
    world.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
  try {
    size();
    window.addEventListener("resize", size);
    signal.addEventListener("abort", dispose, { once: true });
    await renderer.compileAsync(world, camera);
    if (dead) throw new DOMException("Preparation cancelled", "AbortError");
    renderer.render(world, camera);
    return {
      dispose,
      play({ onReveal, onComplete }) {
        if (dead) return;
        let previous = performance.now();
        const start = previous;
        renderer.setAnimationLoop(() => {
          if (dead) return;
          const now = performance.now();
          if (now - start > 1850) {
            onComplete();
            return;
          }
          const dt = Math.min((now - previous) / 1000, 0.06);
          previous = now;
          uniforms.uTravel.value += dt * (35 + uniforms.uSpeed.value * 30);
          camera.updateProjectionMatrix();
          renderer.render(world, camera);
        });
        timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete,
        });
        timeline
          .to(uniforms.uSpeed, { value: 5.5, duration: 0.8 }, 0)
          .to(camera, { fov: 96, duration: 0.9 }, 0)
          .to(uniforms.uBend, { value: -18, duration: 1.2 }, 0.2)
          .call(onReveal, [], 0.95)
          .to(uniforms.uSpeed, { value: 2, duration: 0.6 }, 0.95);
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
