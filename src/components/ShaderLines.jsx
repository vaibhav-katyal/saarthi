import React, { useEffect, useRef } from "react";

// Color parsing utilities
const cssVariableRegex = /var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/;
function extractDefaultValue(cssVar) {
  if (!cssVar || !cssVar.startsWith("var(")) return cssVar;
  const match = cssVariableRegex.exec(cssVar);
  if (!match) return cssVar;
  const fallback = (match[2] || "").trim();
  if (fallback.startsWith("var(")) return extractDefaultValue(fallback);
  return fallback || cssVar;
}

function resolveTokenColor(input) {
  if (typeof input !== "string") return input;
  if (!input.startsWith("var(")) return input;
  return extractDefaultValue(input);
}

function parseColorToRgba(input) {
  if (!input) return { r: 0, g: 0, b: 0, a: 0 };
  const str = input.trim();
  const rgbaMatch = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
    const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
    const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
    const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
    return { r, g, b, a };
  }
  const hex = str.replace(/^#/, "");
  if (hex.length === 8) {
    return { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255, a: parseInt(hex.slice(6, 8), 16) / 255 };
  }
  if (hex.length === 6) { return { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255, a: 1 }; }
  if (hex.length === 4) { return { r: parseInt(hex[0] + hex[0], 16) / 255, g: parseInt(hex[1] + hex[1], 16) / 255, b: parseInt(hex[2] + hex[2], 16) / 255, a: parseInt(hex[3] + hex[3], 16) / 255 }; }
  if (hex.length === 3) { return { r: parseInt(hex[0] + hex[0], 16) / 255, g: parseInt(hex[1] + hex[1], 16) / 255, b: parseInt(hex[2] + hex[2], 16) / 255, a: 1 }; }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function mapLinear(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}
function mapSpeedUiToInternal(ui) { const clamped = Math.max(0.05, Math.min(1, ui)); return mapLinear(clamped, 0.05, 1, 0.5, 10); }
function mapBandWidthUiToInternal(ui) { const clamped = Math.max(0.01, Math.min(1, ui)); return mapLinear(clamped, 0.01, 1, 1, 60); }
function mapFlowToSign(flow) { return flow === "out-in" ? -1 : 1; }

export default function ShaderLines(props) {
  const containerRef = useRef(null);
  const speedRef = useRef(mapSpeedUiToInternal(props.speed ?? 0.5));
  const bandWidthRef = useRef(mapBandWidthUiToInternal(props.bandWidth ?? 0.5));
  const flowSignRef = useRef(mapFlowToSign(props.flow));
  const previewRef = useRef(props.preview ?? false);
  const colorModeRef = useRef(props.colorMode ?? "single");
  const blendModeRef = useRef(props.blendMode ?? "additive");

  const resolvedBackgroundColor = resolveTokenColor(props.backgroundColor);
  const backgroundColorRgba = parseColorToRgba(resolvedBackgroundColor || "#000000");
  const colorRgba = parseColorToRgba(props.color ?? "#ffffff");
  const color1Rgba = parseColorToRgba(props.color1 ?? "#0008FF");
  const color2Rgba = parseColorToRgba(props.color2 ?? "#000000");
  const color3Rgba = parseColorToRgba(props.color3 ?? "#70EAFF");

  const backgroundColorRef = useRef([backgroundColorRgba.r, backgroundColorRgba.g, backgroundColorRgba.b, backgroundColorRgba.a]);
  const colorRef = useRef([colorRgba.r, colorRgba.g, colorRgba.b, colorRgba.a]);
  const color1Ref = useRef([color1Rgba.r, color1Rgba.g, color1Rgba.b, color1Rgba.a]);
  const color2Ref = useRef([color2Rgba.r, color2Rgba.g, color2Rgba.b, color2Rgba.a]);
  const color3Ref = useRef([color3Rgba.r, color3Rgba.g, color3Rgba.b, color3Rgba.a]);

  const lastRef = useRef({ w: 0, h: 0, aspect: 0, ts: 0 });
  const sceneRef = useRef({ camera: null, scene: null, renderer: null, uniforms: null, animationId: null, onResize: null });

  useEffect(() => { speedRef.current = mapSpeedUiToInternal(props.speed ?? 0.5); }, [props.speed]);
  useEffect(() => { bandWidthRef.current = mapBandWidthUiToInternal(props.bandWidth ?? 0.5); }, [props.bandWidth]);
  useEffect(() => { flowSignRef.current = mapFlowToSign(props.flow); }, [props.flow]);
  useEffect(() => { previewRef.current = props.preview ?? false; }, [props.preview]);
  useEffect(() => { colorModeRef.current = props.colorMode ?? "single"; }, [props.colorMode]);
  useEffect(() => { blendModeRef.current = props.blendMode ?? "additive"; }, [props.blendMode]);

  useEffect(() => {
    const resolvedBgColor = resolveTokenColor(props.backgroundColor);
    const bgRgba = parseColorToRgba(resolvedBgColor || "#000000");
    backgroundColorRef.current = [bgRgba.r, bgRgba.g, bgRgba.b, bgRgba.a];
  }, [props.backgroundColor]);

  useEffect(() => {
    const colorRgba = parseColorToRgba(props.color ?? "#ffffff");
    colorRef.current = [colorRgba.r, colorRgba.g, colorRgba.b, colorRgba.a];
  }, [props.color]);

  useEffect(() => {
    // Load Three.js dynamically
    if (window.THREE) {
      setTimeout(() => { if (containerRef.current) initThreeJS(); }, 0);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";
    script.onload = () => { if (containerRef.current && window.THREE) { initThreeJS(); } };
    document.head.appendChild(script);

    return () => {
      if (sceneRef.current.animationId) { cancelAnimationFrame(sceneRef.current.animationId); }
      if (sceneRef.current.onResize) { sceneRef.current.onResize(); }
      if (sceneRef.current.renderer) { sceneRef.current.renderer.dispose(); }
    };
  }, []);

  const initThreeJS = () => {
    if (!containerRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const container = containerRef.current;
    container.innerHTML = "";

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);

    const uniforms = {
      time: { type: "f", value: 1 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      bandWidthPx: { type: "f", value: bandWidthRef.current * (window.devicePixelRatio || 1) },
      backgroundColor: { type: "v4", value: new THREE.Vector4(...backgroundColorRef.current) },
      color: { type: "v4", value: new THREE.Vector4(...colorRef.current) },
      color1: { type: "v4", value: new THREE.Vector4(...color1Ref.current) },
      color2: { type: "v4", value: new THREE.Vector4(...color2Ref.current) },
      color3: { type: "v4", value: new THREE.Vector4(...color3Ref.current) },
      colorMode: { type: "f", value: colorModeRef.current === "single" ? 0 : 1 },
      blendMode: { type: "f", value: blendModeRef.current === "alpha" ? 0 : 1 }
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float bandWidthPx;
      uniform vec4 backgroundColor;
      uniform vec4 color;
      uniform vec4 color1;
      uniform vec4 color2;
      uniform vec4 color3;
      uniform float colorMode;
      uniform float blendMode;

      float random (in float x) { return fract(sin(x)*1e4); }
      float random (vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123); }

      varying vec2 vUv;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float bandCenterPx = floor(gl_FragCoord.x / bandWidthPx) * bandWidthPx + bandWidthPx * 0.5;
        uv.x = (bandCenterPx * 2.0 - resolution.x) / min(resolution.x, resolution.y);

        float t = time*0.06+random(uv.x)*0.4;
        float lineWidth = 0.0015; // slightly thicker base for visibility when fine

        vec3 colorIntensity = vec3(0.0);
        float d = length(uv * 0.4); // Scale down distance to let waves move further towards the screen edges
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            colorIntensity[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01) - d);        
          }
        }

        vec3 finalColor;
        float finalAlpha;

        if (colorMode < 0.5) {
          finalColor = colorIntensity * color.rgb;
          finalAlpha = color.a;
        } else {
          finalColor = vec3(0.0);
          finalColor += colorIntensity.r * color1.rgb;
          finalColor += colorIntensity.g * color2.rgb;
          finalColor += colorIntensity.b * color3.rgb;
          finalAlpha = (color1.a + color2.a + color3.a) / 3.0;
        }

        float rayIntensity = max(max(finalColor.r, finalColor.g), finalColor.b);
        if (rayIntensity < 0.01) {
          finalColor = color.rgb * 0.1;
          rayIntensity = 0.1;
        }

        vec3 bgColor = backgroundColor.rgb;
        float bgAlpha = backgroundColor.a;
        vec3 blendedColor;
        float outputAlpha;

        if (blendMode < 0.5) {
          blendedColor = finalColor.rgb * rayIntensity + bgColor * bgAlpha * (1.0 - rayIntensity);
          outputAlpha = rayIntensity + bgAlpha * (1.0 - rayIntensity);
        } else {
          blendedColor = finalColor.rgb + bgColor * bgAlpha;
          outputAlpha = 1.0;
        }

        gl_FragColor = vec4(blendedColor, outputAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0, 0);

    const canvasEl = renderer.domElement;
    canvasEl.style.position = "absolute";
    canvasEl.style.inset = "0";
    canvasEl.style.width = "100%";
    canvasEl.style.height = "100%";
    canvasEl.style.display = "block";
    container.appendChild(canvasEl);

    sceneRef.current = { camera, scene, renderer, uniforms, animationId: null, onResize: null };

    const onWindowResize = () => {
      const w = container.clientWidth || container.offsetWidth || 1;
      const h = container.clientHeight || container.offsetHeight || 1;
      renderer.setSize(w, h);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    onWindowResize();
    sceneRef.current.onResize = onWindowResize;
    window.addEventListener("resize", onWindowResize, false);

    // Canvas resize detection
    let rafId = 0;
    const TICK_MS = 250;
    const EPSPECT = 0.001;
    const tick = (now) => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth || containerRef.current.offsetWidth || 1;
        const ch = containerRef.current.clientHeight || containerRef.current.offsetHeight || 1;
        const aspect = cw / ch;
        const timeOk = !lastRef.current.ts || (now || performance.now()) - lastRef.current.ts >= TICK_MS;
        const aspectChanged = Math.abs(aspect - lastRef.current.aspect) > EPSPECT;
        const sizeChanged = Math.abs(cw - lastRef.current.w) > 1 || Math.abs(ch - lastRef.current.h) > 1;
        if (timeOk && (aspectChanged || sizeChanged)) {
          lastRef.current = { w: cw, h: ch, aspect, ts: now || performance.now() };
          onWindowResize();
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    sceneRef.current.onResize = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWindowResize);
    };

    let lastTime = 0;
    const animate = (currentTime) => {
      sceneRef.current.animationId = requestAnimationFrame(animate);
      const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0.016;
      lastTime = currentTime;

      uniforms.time.value += deltaTime * speedRef.current * flowSignRef.current;

      const pixelRatio = (renderer.getPixelRatio ? renderer.getPixelRatio() : window.devicePixelRatio) || 1;
      uniforms.bandWidthPx.value = bandWidthRef.current * pixelRatio;

      uniforms.backgroundColor.value.set(...backgroundColorRef.current);
      uniforms.color.value.set(...colorRef.current);
      uniforms.color1.value.set(...color1Ref.current);
      uniforms.color2.value.set(...color2Ref.current);
      uniforms.color3.value.set(...color3Ref.current);
      uniforms.colorMode.value = colorModeRef.current === "single" ? 0 : 1;
      uniforms.blendMode.value = blendModeRef.current === "alpha" ? 0 : 1;

      renderer.render(scene, camera);
    };
    animate(0);
  };

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", margin: 0, padding: 0 }} />;
}
