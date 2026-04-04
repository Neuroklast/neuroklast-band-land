import { type LoadingScreenSlotProps } from '@/lib/types';
import { useEffect, useState } from 'react';

export function CyberpunkLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    'INIT_SYSTEM_KERNEL...',
    'LOADING_MODULES...',
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setLogs(prev => [...prev, 'SYSTEM_READY.', 'EXECUTING_HANDSHAKE...']);
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }

    if (progress > 30 && logs.length === 2) setLogs(prev => [...prev, 'MOUNTING_VIRTUAL_DRIVES...']);
    if (progress > 60 && logs.length === 3) setLogs(prev => [...prev, 'BYPASSING_SECURITY_PROTOCOLS...']);
    if (progress > 85 && logs.length === 4) setLogs(prev => [...prev, 'DECRYPTING_PAYLOAD...']);
  }, [progress, onComplete, logs.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-start justify-end p-8 font-mono text-[var(--primary)] uppercase tracking-widest text-sm sm:text-base">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-2 opacity-80">
          {logs.map((log, i) => (
            <div key={i}>{'>'} {log}</div>
          ))}
          {progress < 100 && <div className="animate-pulse">{'>'} _</div>}
        </div>

        <div className="w-full border border-[var(--primary)] p-1">
          <div
            className="h-4 bg-[var(--primary)] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-right text-xs">
          MEM_ALLOC: {Math.min(progress, 100)}%
        </div>
      </div>
    </div>
  );
}
