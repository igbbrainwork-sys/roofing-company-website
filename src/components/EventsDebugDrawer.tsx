import React, { useEffect, useState } from 'react';
import { Terminal, X, Trash2, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { subscribeToTrackedEvents, TrackedEventRecord } from '../lib/track.js';

export const EventsDebugDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TrackedEventRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for ?debug=1 or dev mode
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('debug') === '1' || import.meta.env.DEV) {
      setIsVisible(true);
      if (searchParams.get('debug') === '1') {
        setIsOpen(true);
      }
    }

    const unsubscribe = subscribeToTrackedEvents((updated) => {
      setEvents(updated);
    });

    return unsubscribe;
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating launcher badge */}
      {!isOpen && (
        <aside aria-label="Whop Events Inspector" className="fixed bottom-16 right-4 sm:bottom-4 sm:right-4 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-xl hover:bg-slate-800 transition-colors text-xs font-mono"
            title="Inspect Whop Pixel Events"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Whop Events</span>
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold text-[10px]">
              {events.length}
            </span>
          </button>
        </aside>
      )}

      {/* Drawer */}
      {isOpen && (
        <aside aria-label="Whop Events Debug Drawer" className="fixed bottom-0 right-0 z-50 w-full sm:w-96 max-h-[85vh] bg-slate-950 text-slate-100 border-l border-t border-slate-800 shadow-2xl flex flex-col font-mono text-xs rounded-tl-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Whop Events Audit</span>
              <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                {events.length} logged
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEvents([])}
                className="p-1 text-slate-400 hover:text-white"
                title="Clear events"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitle / notice */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400">
            Fired on-page pixel &amp; SDK events. Deduplicated with <code className="text-amber-300">event_id</code>.
          </div>

          {/* Event List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh]">
            {events.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No events recorded yet. Scroll through services or submit an estimate to view real-time events.
              </div>
            ) : (
              events.map((evt) => {
                const isExpanded = expandedId === evt.id;
                return (
                  <div
                    key={evt.id}
                    className="bg-slate-900/90 rounded border border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                      className="w-full text-left p-2.5 flex items-center justify-between hover:bg-slate-850"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-bold text-amber-300 truncate">{evt.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
                        <span>{evt.timestamp}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">event_id: </span>
                          <span className="text-emerald-300 break-all select-all">{evt.eventId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">source: </span>
                          <span className="text-slate-200">{evt.source}</span>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">payload:</p>
                          <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-200 overflow-x-auto">
                            {JSON.stringify(evt.properties, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </>
  );
};
