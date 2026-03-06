@keyframes glitch-noir-scanline {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(100vh);
  }
}

@keyframes glitch-noir-flicker {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes glitch-noir-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

@keyframes glitch-noir-glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(2px, -2px);
  }
  60% {
    transform: translate(-2px, -2px);
  }
  80% {
    transform: translate(2px, 2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes glitch-noir-grain-anim {
  0%, 100% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-5%, -5%);
  }
  20% {
    transform: translate(-10%, 5%);
  }
  30% {
    transform: translate(5%, -10%);
  }
  40% {
    transform: translate(-5%, 15%);
  }
  50% {
    transform: translate(-10%, 5%);
  }
  60% {
    transform: translate(15%, 0);
  }
  70% {
    transform: translate(0, 10%);
  }
  80% {
    transform: translate(-15%, 0);
  }
  90% {
    transform: translate(10%, 5%);
  }
}

@keyframes glitch-noir-signal-scan {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes glitch-noir-static {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.08;
  }
}

@keyframes glitch-noir-interference {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  20% {
    transform: translateX(-5px);
  }
  30% {
    transform: translateX(5px);
  }
  40% {
    transform: translateX(-3px);
  }
  50% {
    transform: translateX(3px);
  }
  60% {
    transform: translateX(-2px);
  }
  70% {
    transform: translateX(2px);
  }
  80% {
    transform: translateX(-1px);
  }
  90% {
    transform: translateX(1px);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 0;
  }
}

.glitch-noir-scanline-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}

.glitch-noir-scanline-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02) 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  animation: glitch-noir-scanline 8s linear infinite;
  height: 20%;
}

.glitch-noir-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 3px
  );
  opacity: 0.5;
  z-index: 2;
}

.glitch-noir-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.glitch-noir-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
  animation: glitch-noir-grain-anim 8s steps(10) infinite;
}

.glitch-noir-noise-texture {
  image-rendering: pixelated;
  mix-blend-mode: overlay;
}

.glitch-noir-signal-interference {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.02) 10px,
    rgba(255, 255, 255, 0.02) 11px
  );
  opacity: 0;
  transition: opacity 0.1s;
}

.glitch-noir-signal-active {
  animation: glitch-noir-interference 0.3s ease-in-out;
}

.glitch-noir-static-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0;
  animation: glitch-noir-static 4s ease-in-out infinite;
}

.glitch-noir-noise-subtle {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

.glitch-noir-flicker {
  animation: glitch-noir-flicker 2s ease-in-out infinite;
}

.glitch-noir-pulse {
  animation: glitch-noir-pulse 2s ease-in-out infinite;
}

.glitch-noir-glitch-text {
  animation: glitch-noir-glitch 0.3s ease-in-out;
}

.glitch-noir-nav-underline {
  opacity: 0;
  transition: opacity 0.2s;
}

a:hover .glitch-noir-nav-underline {
  opacity: 1;
}

.glitch-noir-signal-line::before {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: glitch-noir-signal-scan 3s linear infinite;
}
