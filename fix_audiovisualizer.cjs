const fs = require('fs');

const file = 'src/components/AudioVisualizer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { useEffect, useRef, useState } from 'react'", "import React, { useEffect, useRef, useState } from 'react'");
content = content.replace("export default function AudioVisualizer() {", "const AudioVisualizer = React.memo(function AudioVisualizer() {");
content = content.replace("export default AudioVisualizer", "");
content = content.replace(/}\n$/, "})\n\nexport default AudioVisualizer\n");
fs.writeFileSync(file, content);
