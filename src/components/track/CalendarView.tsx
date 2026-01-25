'use client';

import { useState, useEffect } from 'react';

interface WorkoutLog {
  id: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  calorieEstimate: number | null;
}

interface CalendarViewProps {
  refreshKey: number;
}

export function CalendarView({ refreshKey }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch logs for the current month
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const response = await fetch(`/api/track/logs?startDate=${startDate}&endDate=${endDate}&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data.logs);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [year, month, refreshKey]);

  // Create a map of date -> logs
  const logsByDate = logs.reduce((acc, log) => {
    const dateStr = log.workoutDate.split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(log);
    return acc;
  }, {} as Record<string, WorkoutLog[]>);

  // Calendar helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      reformer: 'Reformer',
      mat: 'Mat',
      tower: 'Tower',
      other: 'Other'
    };
    return types[type] || type;
  };

  const getRpeColor = (rpe: number) => {
    if (rpe <= 3) return 'rgba(34, 197, 94, 0.8)';
    if (rpe <= 5) return 'rgba(234, 179, 8, 0.8)';
    if (rpe <= 7) return 'rgba(249, 115, 22, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={goToPrevMonth}
          style={{
            background: 'rgba(246, 237, 221, 0.1)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            color: '#f6eddd'
          }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={goToNextMonth}
          style={{
            background: 'rgba(246, 237, 221, 0.1)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            color: '#f6eddd'
          }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>Loading...</div>
      ) : (
        <>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'rgba(246, 237, 221, 0.5)',
                  padding: '0.25rem'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} style={{ padding: '0.5rem' }} />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayLogs = logsByDate[dateStr] || [];
              const hasWorkout = dayLogs.length > 0;
              const isToday = dateStr === todayStr;
              const isSelected = selectedDate === dateStr;
              const isFuture = new Date(dateStr) > today;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    background: isSelected
                      ? 'rgba(246, 237, 221, 0.2)'
                      : hasWorkout
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'transparent',
                    border: isToday ? '2px solid rgba(246, 237, 221, 0.5)' : '2px solid transparent',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: isFuture ? 'rgba(246, 237, 221, 0.3)' : '#f6eddd',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9375rem', fontWeight: isToday ? 600 : 400 }}>{day}</div>
                  {hasWorkout && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '2px'
                    }}>
                      {dayLogs.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.8)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected date details */}
          {selectedDate && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(246, 237, 221, 0.1)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>

              {logsByDate[selectedDate]?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {logsByDate[selectedDate].map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(246, 237, 221, 0.05)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {log.durationMinutes} min {getTypeLabel(log.workoutType)}
                        </div>
                        {log.calorieEstimate && (
                          <div style={{ fontSize: '0.8125rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                            ~{log.calorieEstimate} calories
                          </div>
                        )}
                      </div>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        background: getRpeColor(log.rpe),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#fff'
                      }}>
                        {log.rpe}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem' }}>
                  No workouts logged on this day
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
