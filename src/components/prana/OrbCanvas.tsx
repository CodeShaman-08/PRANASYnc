"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uTurbulence;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vNoise;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = position;
    float n = fbm(p * 1.35 + vec3(0.0, uTime * 0.11, uTime * 0.05));
    float n2 = fbm(p * 3.1 - vec3(uTime * 0.07, 0.0, uTime * 0.03));
    float n3 = fbm(p * 6.5 + vec3(uTime * 0.04));
    float amplitude = 0.1 + uTurbulence * 0.26;
    float displacement = (n - 0.5) * amplitude + (n2 - 0.5) * 0.09 + (n3 - 0.5) * 0.03;
    p += normal * displacement;

    vNoise = n * 0.7 + n2 * 0.3;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vViewPos = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uVata;
  uniform vec3 uPitta;
  uniform vec3 uKapha;
  uniform float uWv;
  uniform float uWp;
  uniform float uWk;
  uniform float uHarmony;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vNoise;

  void main() {
    vec3 viewDir = normalize(-vViewPos);
    float facing = max(dot(normalize(vNormal), viewDir), 0.0);
    float fresnel = pow(1.0 - facing, 2.8);

    float flowA = smoothstep(0.28, 0.78, vNoise);
    float flowB = 1.0 - flowA;

    vec3 w = vec3(uWv, uWp, uWk);
    w = pow(w, vec3(1.35));
    w *= vec3(0.55 + flowA * 0.9, 0.5 + flowB * 1.05, 0.45 + flowA * 0.75);
    w /= max(w.x + w.y + w.z, 0.0001);

    vec3 base = uVata * w.x + uPitta * w.y + uKapha * w.z;

    float vein = smoothstep(0.46, 0.52, vNoise) * (1.0 - smoothstep(0.54, 0.62, vNoise));
    float core = pow(facing, 2.2);

    float band = 0.5 + 0.5 * sin(vNoise * 18.0 + uTime * 0.55);
    float energy = mix(0.55, 1.25, band);

    vec3 color = base * (0.2 + core * 0.42) * energy;
    color += base * vein * 0.85;
    color += base * fresnel * 1.5;
    color += mix(base, vec3(0.0), 0.35) * pow(fresnel, 3.0) * 0.55;

    float pulse = 0.92 + 0.08 * sin(uTime * (1.0 + (100.0 - uHarmony) * 0.032));
    color *= pulse;

    color = pow(color, vec3(1.02));

    gl_FragColor = vec4(color, 0.98);
  }
`;

interface OrbCanvasProps {
  vata: number;
  pitta: number;
  kapha: number;
  harmony: number;
}

export default function OrbCanvas({ vata, pitta, kapha, harmony }: OrbCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ vata: vata / 100, pitta: pitta / 100, kapha: kapha / 100, harmony });
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    targetRef.current = {
      vata: vata / 100,
      pitta: pitta / 100,
      kapha: kapha / 100,
      harmony,
    };
  }, [vata, pitta, kapha, harmony]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 3.75);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const group = new THREE.Group();
    scene.add(group);

    const uniforms = {
      uTime: { value: 0 },
      uTurbulence: { value: 0.4 },
      uVata: { value: new THREE.Color("#1a1a1a") },
      uPitta: { value: new THREE.Color("#4d4d4d") },
      uKapha: { value: new THREE.Color("#8c8c8c") },
      uWv: { value: targetRef.current.vata },
      uWp: { value: targetRef.current.pitta },
      uWk: { value: targetRef.current.kapha },
      uHarmony: { value: harmony },
    };

    const orbGeometry = new THREE.IcosahedronGeometry(1, 5);
    const orbMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    group.add(orb);

    const wireGeometry = new THREE.IcosahedronGeometry(1, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    wire.scale.setScalar(1.22);
    group.add(wire);

    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.72 + Math.random() * 0.55;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.017,
      color: 0x111111,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.rotation.set(0.4, 0, 0.18);
    group.add(particles);

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frame = 0;
    let previous = performance.now();
    const started = previous;
    const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const time = (now - started) / 1000;
      const target = targetRef.current;
      const ease = Math.min(1, delta * 2.4);

      uniforms.uTime.value = time;
      uniforms.uWv.value = lerp(uniforms.uWv.value, target.vata, ease);
      uniforms.uWp.value = lerp(uniforms.uWp.value, target.pitta, ease);
      uniforms.uWk.value = lerp(uniforms.uWk.value, target.kapha, ease);
      uniforms.uHarmony.value = lerp(uniforms.uHarmony.value, target.harmony, Math.min(1, delta * 1.8));
      uniforms.uTurbulence.value = lerp(
        uniforms.uTurbulence.value,
        0.25 + (1 - target.harmony / 100) * 0.85,
        ease,
      );

      group.rotation.x = lerp(group.rotation.x, pointerRef.current.y * 0.22, 0.04);
      group.rotation.y = lerp(group.rotation.y, pointerRef.current.x * 0.4 + time * 0.06, 0.04);
      wire.rotation.y = -time * 0.09;
      wire.rotation.z = time * 0.04;
      particles.rotation.y = time * 0.035;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      orbGeometry.dispose();
      orbMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
