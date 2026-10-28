document.addEventListener('DOMContentLoaded', () => {
  const customTextInput = document.getElementById('custom-text');
  const animationSelect = document.getElementById('animation-select');
  const fontFamilySelect = document.getElementById('font-family-select');
  const colorPicker = document.getElementById('color-picker');
  const colorHex = document.getElementById('color-hex');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeVal = document.getElementById('font-size-val');
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  const previewWidthInput = document.getElementById('preview-width-input');
  const previewHeightInput = document.getElementById('preview-height-input');
  const previewSizeStatus = document.getElementById('preview-size-status');
  const stageCanvas = document.getElementById('stage-canvas');
  const currentEffectName = document.getElementById('current-effect-name');
  const textContainer = document.getElementById('animated-text-container');
  const replayBtn = document.getElementById('replay-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const downloadVideoBtn = document.getElementById('download-video-btn');
  const videoStatus = document.getElementById('video-status');
  const codeModal = document.getElementById('code-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const codeOutput = document.getElementById('code-output');
  const modalCopyBtn = document.getElementById('modal-copy-btn');
  const presetCards = document.querySelectorAll('.preset-card');

  // Emoji controls
  const toggleEmojiPanelBtn = document.getElementById('toggle-emoji-panel-btn');
  const emojiPalette = document.getElementById('emoji-palette');
  const quickEmojiChips = document.querySelectorAll('.quick-emoji-chip');
  const paletteEmojiSpans = document.querySelectorAll('.cat-emojis span');

  // Background controls
  const canvasBgLayer = document.getElementById('canvas-bg-layer');
  const bgPresetBtns = document.querySelectorAll('.bg-preset-btn');
  const bgFileInput = document.getElementById('bg-file-input');
  const uploadBgBtn = document.getElementById('upload-bg-btn');
  const resetBgBtn = document.getElementById('reset-bg-btn');
  const bgDarknessSlider = document.getElementById('bg-darkness-slider');
  const bgDarknessVal = document.getElementById('bg-darkness-val');
  const bgBlurSlider = document.getElementById('bg-blur-slider');
  const bgBlurVal = document.getElementById('bg-blur-val');
  const textMaskToggle = document.getElementById('text-mask-toggle');

  function applyPreviewSize(input, property) {
    const value = input.value.trim();
    if (!value || !CSS.supports(property, value)) {
      input.setAttribute('aria-invalid', 'true');
      previewSizeStatus.textContent = 'Enter a valid CSS size, such as 50%, 320px, or 40vw.';
      return;
    }

    input.removeAttribute('aria-invalid');
    stageCanvas.style.setProperty(property, value);
    previewSizeStatus.textContent = '';
  }

  previewWidthInput.addEventListener('input', () => applyPreviewSize(previewWidthInput, 'width'));
  previewHeightInput.addEventListener('input', () => applyPreviewSize(previewHeightInput, 'height'));

  let typewriterTimeout = null;
  let currentBgUrl = '';

  // Background Presets Map
  const bgPresets = {
    'default': '',
    'galaxy': 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80',
    'cybercity': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=80',
    'neonfluid': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&q=80',
    'ocean': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80',
    'matrix': 'linear-gradient(135deg, #020b05 0%, #052e16 50%, #020b05 100%)'
  };

  // Animation names mapping
  const effectNames = {
    'neon': '⚡ Neon Glow Effect',
    'fire': '🔥 Burning Fire & Flames',
    'electric': '⚡ Electric Plasma Zap',
    'gold': '✨ Golden Shimmer / Luxury',
    'glitch': '👾 Cyberpunk RGB Glitch',
    'scanline': '📺 Retro CRT TV Scanlines',
    'pixel': '🕹️ 8-Bit Arcade Jump',
    'typewriter': '⌨️ Typewriter Effect',
    'wave': '🌊 3D Bouncing Wave',
    'fall': '🪂 Staggered Gravity Drop',
    'flip': '🔄 3D Card Flip Rotate',
    'heartbeat': '💓 Bass Pulse Heartbeat',
    'gradient': '🌈 Liquid Gradient Flow',
    'smoke': '💨 Cinematic Smoke Reveal',
    'mirror': '🪞 Wet Floor Water Mirror'
  };

  // Safe Unicode Grapheme Splitter (Handles emojis & combined characters cleanly)
  function splitIntoGraphemes(str) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(str), s => s.segment);
    }
    return str.match(/[\p{Extended_Pictographic}\uFE0F\u200D]+|[^\p{Extended_Pictographic}\uFE0F\u200D]/gu) || Array.from(str);
  }

  function isEmojiChar(char) {
    return /\p{Extended_Pictographic}/u.test(char);
  }

  function insertEmoji(emoji) {
    const input = customTextInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const currentVal = input.value;

    input.value = currentVal.substring(0, start) + emoji + currentVal.substring(end);
    const newCursor = start + emoji.length;
    input.focus();
    input.setSelectionRange(newCursor, newCursor);

    renderAnimation();
  }

  // Quick Emoji Chips
  quickEmojiChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const emoji = chip.getAttribute('data-emoji') || chip.textContent.trim();
      insertEmoji(emoji);
    });
  });

  // Full Palette Emojis
  paletteEmojiSpans.forEach(span => {
    span.addEventListener('click', (e) => {
      e.preventDefault();
      const emoji = span.textContent.trim();
      insertEmoji(emoji);
    });
  });

  // Toggle emoji palette
  toggleEmojiPanelBtn.addEventListener('click', () => {
    const isOpen = emojiPalette.classList.toggle('open');
    toggleEmojiPanelBtn.textContent = isOpen ? '✖ Close Emojis' : '😀 All Emojis';
  });

  // Background Management Functions
  function setBackground(source, isGradient = false) {
    currentBgUrl = source;

    if (!source) {
      // Default dark stage
      canvasBgLayer.style.backgroundImage = 'none';
      canvasBgLayer.style.background = '#080a12';
      document.documentElement.style.removeProperty('--stage-bg-image');
    } else if (isGradient) {
      canvasBgLayer.style.backgroundImage = source;
      document.documentElement.style.setProperty('--stage-bg-image', source);
    } else {
      canvasBgLayer.style.backgroundImage = `url("${source}")`;
      document.documentElement.style.setProperty('--stage-bg-image', `url("${source}")`);
    }
  }

  // Presets selection
  bgPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bgPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-bg');
      if (presetKey === 'matrix') {
        setBackground(bgPresets['matrix'], true);
      } else {
        setBackground(bgPresets[presetKey], false);
      }
    });
  });

  // Upload custom background image
  uploadBgBtn.addEventListener('click', () => {
    bgFileInput.click();
  });

  bgFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        bgPresetBtns.forEach(b => b.classList.remove('active'));
        setBackground(event.target.result, false);
        uploadBgBtn.textContent = `📁 ${file.name.slice(0, 10)}...`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset background
  resetBgBtn.addEventListener('click', () => {
    bgPresetBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.bg-preset-btn[data-bg="default"]').classList.add('active');
    bgFileInput.value = '';
    uploadBgBtn.textContent = '📁 Upload My Image';
    setBackground('');
  });

  // Background Darkness Slider
  bgDarknessSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    bgDarknessVal.textContent = `${val}%`;
    document.documentElement.style.setProperty('--bg-darkness', val / 100);
  });

  // Background Blur Slider
  bgBlurSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    bgBlurVal.textContent = `${val}px`;
    document.documentElement.style.setProperty('--bg-blur', `${val}px`);
  });

  // Text Mask Mode Toggle
  textMaskToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      textContainer.classList.add('text-mask-mode');
    } else {
      textContainer.classList.remove('text-mask-mode');
    }
  });

  function renderAnimation() {
    if (typewriterTimeout) {
      clearTimeout(typewriterTimeout);
      typewriterTimeout = null;
    }

    const text = customTextInput.value || 'Text & Emojis 🔥✨';
    const effect = animationSelect.value;
    const color = colorPicker.value;
    const fontFamily = fontFamilySelect.value;
    const fontSize = fontSizeSlider.value;
    const speed = speedSlider.value;

    // Update root and container styles
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--anim-speed-factor', speed);
    textContainer.style.fontFamily = `${fontFamily}, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif`;
    textContainer.style.fontSize = `${fontSize}px`;
    
    // Retain text-mask-mode class if toggled
    const isMaskMode = textMaskToggle.checked;
    textContainer.className = `anim-${effect}${isMaskMode ? ' text-mask-mode' : ''}`;

    if (currentEffectName) {
      currentEffectName.textContent = effectNames[effect] || effect;
    }

    textContainer.innerHTML = '';
    const graphemes = splitIntoGraphemes(text);

    if (effect === 'typewriter') {
      let charIndex = 0;
      const baseDelay = Math.max(35, Math.floor(100 / speed));

      function typeChar() {
        if (charIndex <= graphemes.length) {
          textContainer.innerHTML = '';
          const currentSlice = graphemes.slice(0, charIndex);
          currentSlice.forEach(g => {
            if (isEmojiChar(g)) {
              const span = document.createElement('span');
              span.className = 'is-emoji';
              span.textContent = g;
              textContainer.appendChild(span);
            } else {
              textContainer.appendChild(document.createTextNode(g));
            }
          });
          charIndex++;
          typewriterTimeout = setTimeout(typeChar, baseDelay);
        } else {
          typewriterTimeout = setTimeout(() => {
            charIndex = 0;
            typeChar();
          }, 1800);
        }
      }
      typeChar();
    } else if (effect === 'glitch') {
      textContainer.setAttribute('data-text', text);
      graphemes.forEach(g => {
        if (isEmojiChar(g)) {
          const span = document.createElement('span');
          span.className = 'is-emoji';
          span.textContent = g;
          textContainer.appendChild(span);
        } else {
          textContainer.appendChild(document.createTextNode(g));
        }
      });
    } else if (['wave', 'smoke', 'flip', 'fall', 'pixel'].includes(effect)) {
      graphemes.forEach((g, index) => {
        const span = document.createElement('span');
        span.textContent = g === ' ' ? '\u00A0' : g;
        span.style.setProperty('--char-index', index);
        if (isEmojiChar(g)) {
          span.classList.add('is-emoji');
        }
        textContainer.appendChild(span);
      });
    } else {
      graphemes.forEach(g => {
        if (isEmojiChar(g)) {
          const span = document.createElement('span');
          span.className = 'is-emoji';
          span.textContent = g;
          textContainer.appendChild(span);
        } else {
          textContainer.appendChild(document.createTextNode(g));
        }
      });
    }
  }

  // Inputs event listeners
  customTextInput.addEventListener('input', renderAnimation);
  animationSelect.addEventListener('change', renderAnimation);
  fontFamilySelect.addEventListener('change', renderAnimation);

  colorPicker.addEventListener('input', (e) => {
    colorHex.textContent = e.target.value;
    renderAnimation();
  });

  fontSizeSlider.addEventListener('input', (e) => {
    fontSizeVal.textContent = `${e.target.value}px`;
    renderAnimation();
  });

  speedSlider.addEventListener('input', (e) => {
    speedVal.textContent = `${e.target.value}x`;
    renderAnimation();
  });

  replayBtn.addEventListener('click', () => {
    const currentClass = textContainer.className;
    textContainer.className = '';
    void textContainer.offsetWidth; // Force reflow
    textContainer.className = currentClass;
    renderAnimation();
  });

  // Preset cards click handler
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      const effect = card.getAttribute('data-effect');
      if (effect) {
        animationSelect.value = effect;
        renderAnimation();
        textContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Export code generator
  function generateExportCode() {
    const text = customTextInput.value || 'Text & Emojis 🔥✨';
    const effect = animationSelect.value;
    const color = colorPicker.value;
    const fontFamily = fontFamilySelect.value;
    const fontSize = fontSizeSlider.value;
    const graphemes = splitIntoGraphemes(text);

    let htmlSnippet = '';
    let cssSnippet = '';

    const needsSpans = ['wave', 'smoke', 'flip', 'fall', 'pixel'].includes(effect);

    if (needsSpans) {
      const spans = graphemes.map((g, i) => {
        const isEm = isEmojiChar(g) ? ' class="is-emoji"' : '';
        const char = g === ' ' ? '&nbsp;' : g;
        return `<span style="--i: ${i}"${isEm}>${char}</span>`;
      }).join('');
      htmlSnippet = `<div class="${effect}-animated-text">\n  ${spans}\n</div>`;
    } else if (effect === 'glitch') {
      htmlSnippet = `<h1 class="glitch-animated-text" data-text="${text}">${text}</h1>`;
    } else {
      htmlSnippet = `<h1 class="${effect}-animated-text">${text}</h1>`;
    }

    const emojiCssHelper = `
/* Emoji helper: keeps emojis colorful in all animations */
.is-emoji {
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif !important;
  -webkit-text-fill-color: initial !important;
  display: inline-block;
}`;

    if (effect === 'neon') {
      cssSnippet = `
.neon-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px ${color},
    0 0 40px ${color},
    0 0 80px ${color};
  animation: neon-pulse 1.8s ease-in-out infinite alternate;
}
@keyframes neon-pulse {
  0% { opacity: 0.85; text-shadow: 0 0 4px #fff, 0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}; }
  100% { opacity: 1; text-shadow: 0 0 8px #fff, 0 0 18px #fff, 0 0 30px ${color}, 0 0 60px ${color}, 0 0 100px ${color}; }
}
${emojiCssHelper}`;
    } else if (effect === 'fire') {
      cssSnippet = `
.fire-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: #fff;
  animation: fire-flicker 1.5s ease-in-out infinite alternate;
}
@keyframes fire-flicker {
  0% {
    text-shadow: 0 0 4px #fff, 0 -3px 7px #ffeb3b, 0 -7px 12px #ff9800, 0 -11px 18px #ff5722, 0 -16px 26px #d32f2f;
    transform: skewX(-1deg);
  }
  50% {
    text-shadow: 0 0 5px #fff, 0 -5px 10px #ffff00, 0 -10px 17px #ff7700, 0 -15px 24px #ff3300, 0 -22px 35px #b71c1c;
    transform: skewX(1.5deg) scaleY(1.02);
  }
  100% {
    text-shadow: 0 0 3px #fff, 0 -4px 8px #ffd54f, 0 -8px 15px #ff9800, 0 -13px 21px #ff5722, 0 -19px 28px #e53935;
    transform: skewX(-0.5deg);
  }
}
${emojiCssHelper}`;
    } else if (effect === 'electric') {
      cssSnippet = `
.electric-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: #fff;
  text-shadow: 0 0 5px #fff, 0 0 10px ${color}, 0 0 20px ${color}, 0 0 35px #9900ff;
  animation: electric-zap 0.35s steps(2, start) infinite;
}
@keyframes electric-zap {
  0%, 100% { transform: translate(0, 0); filter: drop-shadow(0 0 6px ${color}); }
  25% { transform: translate(-2px, 1px) skewX(2deg); filter: drop-shadow(0 0 16px #9900ff) drop-shadow(-3px 0 0 #00ffff); }
  50% { transform: translate(2px, -1px) skewX(-2deg); filter: drop-shadow(0 0 12px ${color}); }
  75% { transform: translate(-1px, -1px); filter: drop-shadow(0 0 20px #00ffff) drop-shadow(3px 0 0 #ff00ff); }
}
${emojiCssHelper}`;
    } else if (effect === 'gold') {
      cssSnippet = `
.gold-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  background: linear-gradient(110deg, #996515 0%, #d4af37 25%, #fff7c2 50%, #d4af37 75%, #996515 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gold-shine 3s linear infinite;
  filter: drop-shadow(0 4px 15px rgba(212, 175, 55, 0.4));
}
@keyframes gold-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
${emojiCssHelper}`;
    } else if (effect === 'glitch') {
      cssSnippet = `
.glitch-animated-text {
  position: relative;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: #fff;
}
.glitch-animated-text::before,
.glitch-animated-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
}
.glitch-animated-text::before {
  left: 3px;
  text-shadow: -2px 0 #ff2a85;
  clip: rect(24px, 600px, 90px, 0);
  animation: glitch-anim-1 2.4s infinite linear alternate-reverse;
}
.glitch-animated-text::after {
  left: -3px;
  text-shadow: -2px 0 ${color};
  clip: rect(85px, 600px, 140px, 0);
  animation: glitch-anim-2 2s infinite linear alternate-reverse;
}
@keyframes glitch-anim-1 {
  0% { clip: rect(20px, 9999px, 35px, 0); }
  50% { clip: rect(10px, 9999px, 85px, 0); }
  100% { clip: rect(30px, 9999px, 60px, 0); }
}
@keyframes glitch-anim-2 {
  0% { clip: rect(70px, 9999px, 95px, 0); }
  50% { clip: rect(80px, 9999px, 120px, 0); }
  100% { clip: rect(5px, 9999px, 40px, 0); }
}
${emojiCssHelper}`;
    } else if (effect === 'scanline') {
      cssSnippet = `
.scanline-animated-text {
  position: relative;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  text-shadow: 0 0 10px ${color};
  letter-spacing: 2px;
  animation: crt-flicker 0.15s infinite;
}
.scanline-animated-text::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%);
  background-size: 100% 4px;
  pointer-events: none;
}
@keyframes crt-flicker {
  0% { opacity: 0.98; } 50% { opacity: 0.92; } 100% { opacity: 1; }
}
${emojiCssHelper}`;
    } else if (effect === 'pixel') {
      cssSnippet = `
.pixel-animated-text span {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  text-shadow: 3px 3px 0px #ff2a85, 6px 6px 0px #000;
  animation: arcade-step 1.2s steps(4, end) infinite;
  animation-delay: calc(0.1s * var(--i));
}
@keyframes arcade-step {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
${emojiCssHelper}`;
    } else if (effect === 'typewriter') {
      cssSnippet = `
.typewriter-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  border-right: 3px solid ${color};
  white-space: nowrap;
  overflow: hidden;
  animation: blink-caret 0.75s step-end infinite;
}
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: ${color}; }
}
${emojiCssHelper}`;
    } else if (effect === 'wave') {
      cssSnippet = `
.wave-animated-text span {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  font-weight: 700;
  color: ${color};
  animation: wave-bounce 1.4s ease-in-out infinite;
  animation-delay: calc(0.08s * var(--i));
}
@keyframes wave-bounce {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-24px); color: #ff2a85; }
  60% { transform: translateY(0); }
}
${emojiCssHelper}`;
    } else if (effect === 'fall') {
      cssSnippet = `
.fall-animated-text span {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  animation: gravity-drop 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
  animation-delay: calc(0.09s * var(--i));
}
@keyframes gravity-drop {
  0% { opacity: 0; transform: translateY(-80px) rotate(-15deg); }
  30%, 75% { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(30px) scale(0.9); }
}
${emojiCssHelper}`;
    } else if (effect === 'flip') {
      cssSnippet = `
.flip-animated-text {
  perspective: 1000px;
}
.flip-animated-text span {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  animation: flip-3d 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: calc(0.09s * var(--i));
}
@keyframes flip-3d {
  0% { transform: rotateX(0deg); }
  50% { transform: rotateX(360deg); color: #ff2a85; }
  100% { transform: rotateX(360deg); }
}
${emojiCssHelper}`;
    } else if (effect === 'heartbeat') {
      cssSnippet = `
.heartbeat-animated-text {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  animation: heart-pulse 1.3s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(0, 242, 254, 0.4));
}
@keyframes heart-pulse {
  0% { transform: scale(1); }
  14% { transform: scale(1.18); color: #ff2a85; }
  28% { transform: scale(1); }
  42% { transform: scale(1.12); color: #ff2a85; }
  70% { transform: scale(1); }
}
${emojiCssHelper}`;
    } else if (effect === 'gradient') {
      cssSnippet = `
.gradient-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  background: linear-gradient(90deg, ${color}, #ff2a85, #ffd000, #7928ca, ${color});
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-flow 4s ease infinite;
}
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
${emojiCssHelper}`;
    } else if (effect === 'smoke') {
      cssSnippet = `
.smoke-animated-text span {
  display: inline-block;
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  animation: smoke-reveal 2.4s ease-in-out infinite alternate;
  animation-delay: calc(0.12s * var(--i));
}
@keyframes smoke-reveal {
  0% { filter: blur(14px); opacity: 0; transform: translateY(20px) scale(1.4); }
  50%, 100% { filter: blur(0); opacity: 1; transform: translateY(0) scale(1); text-shadow: 0 0 20px ${color}; }
}
${emojiCssHelper}`;
    } else if (effect === 'mirror') {
      cssSnippet = `
.mirror-animated-text {
  font-family: ${fontFamily};
  font-size: ${fontSize}px;
  color: ${color};
  -webkit-box-reflect: below 2px linear-gradient(transparent, transparent 55%, rgba(255, 255, 255, 0.35));
  animation: mirror-float 2.5s ease-in-out infinite alternate;
}
@keyframes mirror-float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); filter: drop-shadow(0 15px 20px rgba(0, 242, 254, 0.3)); }
}
${emojiCssHelper}`;
    }

    return `<!-- HTML -->\n${htmlSnippet}\n\n/* CSS */\n${cssSnippet}`;
  }

  // Open modal with code
  copyCodeBtn.addEventListener('click', () => {
    codeOutput.textContent = generateExportCode();
    codeModal.classList.add('active');
  });

  async function downloadPreviewVideo() {
    if (typeof window.html2canvas !== 'function' || typeof MediaRecorder === 'undefined') {
      videoStatus.textContent = 'Video recording is not supported in this browser.';
      return;
    }

    let recordingStream;
    let recorder;

    downloadVideoBtn.disabled = true;
    videoStatus.textContent = 'Preparing preview video...';

    try {
      const bounds = stageCanvas.getBoundingClientRect();
      const outputScale = Math.min(1.5, 1920 / bounds.width, 1600 / bounds.height);
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = Math.max(1, Math.round(bounds.width * outputScale));
      outputCanvas.height = Math.max(1, Math.round(bounds.height * outputScale));
      const context = outputCanvas.getContext('2d');
      if (!context) throw new Error('Could not prepare the video canvas.');

      const renderPreviewFrame = async () => {
        const snapshot = await window.html2canvas(stageCanvas, {
          backgroundColor: null,
          logging: false,
          scale: outputScale,
          useCORS: true
        });
        context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        context.drawImage(snapshot, 0, 0, outputCanvas.width, outputCanvas.height);
      };

      await renderPreviewFrame();
      const frameRate = 4;
      recordingStream = outputCanvas.captureStream(frameRate);
      const mimeType = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm', 'video/mp4']
        .find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('No supported video format is available.');

      recorder = new MediaRecorder(recordingStream, { mimeType });
      const chunks = [];
      recorder.addEventListener('dataavailable', event => {
        if (event.data.size) chunks.push(event.data);
      });

      const recordingStopped = new Promise((resolve, reject) => {
        recorder.addEventListener('stop', resolve, { once: true });
        recorder.addEventListener('error', event => reject(event.error), { once: true });
      });

      recorder.start(250);
      videoStatus.textContent = `Recording preview at ${outputCanvas.width} × ${outputCanvas.height}...`;
      const frameDuration = 1000 / frameRate;
      const recordingEndsAt = performance.now() + 5000;
      while (performance.now() < recordingEndsAt && recorder.state === 'recording') {
        const frameStartedAt = performance.now();
        await renderPreviewFrame();
        const waitTime = frameDuration - (performance.now() - frameStartedAt);
        if (waitTime > 0) {
          await new Promise(resolve => window.setTimeout(resolve, waitTime));
        }
      }

      if (recorder.state !== 'inactive') recorder.stop();

      await recordingStopped;
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
      if (!blob.size) throw new Error('The recording was empty. Please try again.');

      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `text-animation-${Date.now()}.${extension}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
      videoStatus.textContent = 'Video downloaded.';
    } catch (error) {
      videoStatus.textContent = error?.message || 'Video recording was cancelled.';
    } finally {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      recordingStream?.getTracks().forEach(track => track.stop());
      downloadVideoBtn.disabled = false;
    }
  }

  downloadVideoBtn.addEventListener('click', downloadPreviewVideo);

  closeModalBtn.addEventListener('click', () => {
    codeModal.classList.remove('active');
  });

  window.addEventListener('click', (e) => {
    if (e.target === codeModal) {
      codeModal.classList.remove('active');
    }
  });

  modalCopyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeOutput.textContent);
      modalCopyBtn.textContent = 'Copied!';
      setTimeout(() => {
        modalCopyBtn.textContent = 'Copy to Clipboard';
      }, 2000);
    } catch (err) {
      modalCopyBtn.textContent = 'Selected';
    }
  });

  // Initial render
  renderAnimation();
});
