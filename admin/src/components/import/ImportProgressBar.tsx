import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { io, Socket } from 'socket.io-client';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';

interface ImportProgressEvent {
  step: 'categories' | 'sizes' | 'modifierGroups' | 'modifiers' | 'items'; // from ImportSaveService
  done: number;
  total: number;
}

interface ImportProgressBarProps {
  userId: string;
}

function getSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1';
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch {
    return 'http://localhost:3001';
  }
}

export default function ImportProgressBar({ userId }: ImportProgressBarProps) {
  const { t } = useTranslation();
  const socketRef = useRef<Socket | null>(null);
  
  const [progress, setProgress] = useState<Record<string, { done: number; total: number }>>({
    categories: { done: 0, total: 0 },
    items: { done: 0, total: 0 },
    sizes: { done: 0, total: 0 },
    modifierGroups: { done: 0, total: 0 },
    modifiers: { done: 0, total: 0 },
  });

  const [activeStep, setActiveStep] = useState<string>('categories');

  useEffect(() => {
    const url = getSocketUrl();
    const socket = io(url, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Connect to the private user room
      socket.emit('join', userId);
    });

    socket.on('import:progress', (data: ImportProgressEvent) => {
      setActiveStep(data.step);
      setProgress((prev) => ({
        ...prev,
        [data.step]: { done: data.done, total: data.total },
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const steps = [
    { id: 'categories', label: t('common:text-categories') || 'Categories' },
    { id: 'sizes', label: t('common:text-sizes') || 'Sizes' },
    { id: 'modifierGroups', label: t('common:text-modifier-groups') || 'Modifier Groups' },
    { id: 'modifiers', label: t('common:text-modifiers') || 'Modifiers' },
    { id: 'items', label: t('common:text-items') || 'Items' },
  ];

  const getStepStatus = (stepId: string) => {
    const p = progress[stepId];
    if (activeStep === stepId) return 'active';
    if (p && p.done > 0 && p.done >= p.total) return 'completed';
    // If we are past this step in the typical sequence and it has 0 total, we can consider it skipped or pending
    const stepIdx = steps.findIndex(s => s.id === stepId);
    const activeIdx = steps.findIndex(s => s.id === activeStep);
    
    if (stepIdx < activeIdx) return 'completed'; // Passed it
    return 'pending';
  };

  return (
    <div className="w-full bg-white rounded-lg shadow mt-6 p-6">
      <h3 className="text-lg font-semibold text-heading mb-6">
        {t('common:text-saving-import') || 'Saving Import Data'}...
      </h3>

      <div className="space-y-4">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const p = progress[step.id];
          const hasData = p && p.total > 0;
          
          if (!hasData && status === 'pending') {
             // Not processing yet, or no data
          }

          return (
            <div key={step.id} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {status === 'completed' ? (
                    <CheckMarkFill className="w-5 h-5 text-accent" />
                  ) : status === 'active' ? (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      status === 'active'
                        ? 'text-accent'
                        : status === 'completed'
                        ? 'text-heading'
                        : 'text-body'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {hasData && (
                  <span className="text-sm font-medium text-body">
                    {p.done} / {p.total}
                  </span>
                )}
              </div>
              
              {/* Progress Bar Track */}
              {hasData && (
                <div className={`w-full h-2 rounded-full overflow-hidden ${status === 'active' ? 'bg-accent/20' : 'bg-gray-100'}`}>
                  <div
                    className={`h-full transition-all duration-300 ease-in-out ${status === 'completed' ? 'bg-accent' : 'bg-accent'}`}
                    style={{ width: `${Math.min(100, (p.done / p.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
