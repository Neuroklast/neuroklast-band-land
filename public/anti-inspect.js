// Anti-inspection: block DevTools shortcuts and right-click to deter script-kiddies
document.addEventListener('keydown', function(e) {
  // Block F12
  if (e.key === 'F12') { e.preventDefault(); return false; }
  // Block Ctrl+Shift+I (DevTools)
  if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
  // Block Ctrl+Shift+J (Console)
  if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
  // Block Ctrl+U (View Source)
  if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
  // Block Ctrl+Shift+C (Element inspector)
  if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
});
