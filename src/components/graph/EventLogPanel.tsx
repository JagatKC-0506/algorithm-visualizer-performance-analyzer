import { useEffect, useRef } from 'react';
import PanelWrapper from './PanelWrapper';

interface Props {
  logEntries: string[];
  currentStep: number;
}

export default function EventLogPanel({ logEntries, currentStep }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logEntries.length, currentStep]);

  return (
    <PanelWrapper title="Event Log" accent="#6366f1">
      <div
        ref={scrollRef}
        style={{
          maxHeight: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}
      >
        {logEntries.length > 0 ? (
          logEntries.map((entry, i) => {
            const isLast = i === currentStep && i < logEntries.length - 1;
            const isCurrent = i === currentStep;
            return (
              <div
                key={i}
                style={{
                  padding: '0.2rem 0.4rem',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  color: isCurrent ? 'var(--text)' : 'var(--text-secondary)',
                  background: isCurrent ? 'var(--accent-alpha)' : 'transparent',
                  borderLeft: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {entry}
              </div>
            );
          })
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
            waiting for execution...
          </span>
        )}
      </div>
    </PanelWrapper>
  );
}
