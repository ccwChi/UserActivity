'use client';

import React, { useEffect, useState } from 'react';
import { MonthlyCalendarView } from '../components/MonthlyCalendarView';
import { TimelineView } from '../components/TimelineView';
import { WorkloadMetrics } from '../components/WorkloadMetrics';
import { TeamComparison } from '../components/TeamComparison';
import { parseActionMarkdown } from '../lib/action-parser';
import { ChevronLeft, ChevronRight, Calendar, LayoutList } from 'lucide-react';

// User list - 6 people
const USERS = [
  { id: 'Brian', name: 'Brian', file: '/action-data/brian.md' },
  { id: 'Jeff', name: 'Jeff', file: '/action-data/jeff.md' },
  { id: 'Jerry', name: 'Jerry', file: '/action-data/jerry.md' },
  { id: 'Joey', name: 'Joey', file: '/action-data/joey.md' },
  { id: 'Kelvin', name: 'Kelvin', file: '/action-data/kelvin.md' },
  { id: 'Yammin', name: 'Yammin', file: '/action-data/yammin.md' },
];

export default function Home() {
  const [allUsersData, setAllUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'timeline'
  const [selectedPeople, setSelectedPeople] = useState(USERS.map(u => u.id)); // All selected by default

  // Month navigation (for monthly view)
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Fetch data for all users
  useEffect(() => {
    async function fetchAllUsers() {
      setLoading(true);
      try {
        const promises = USERS.map(async (user) => {
          try {
            const res = await fetch(user.file);
            if (!res.ok) return { name: user.name, tasks: [] };
            const text = await res.text();
            const parsed = parseActionMarkdown(text);
            return { name: user.name, tasks: parsed };
          } catch (e) {
            console.error(`Failed to load ${user.name}:`, e);
            return { name: user.name, tasks: [] };
          }
        });

        const results = await Promise.all(promises);
        setAllUsersData(results);
      } catch (e) {
        console.error(e);
        setAllUsersData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllUsers();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Person filter handlers
  const togglePerson = (personId) => {
    setSelectedPeople(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const toggleAll = () => {
    if (selectedPeople.length === USERS.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(USERS.map(u => u.id));
    }
  };

  // Filter data based on selected people
  const filteredData = allUsersData.filter(person =>
    selectedPeople.includes(USERS.find(u => u.name === person.name)?.id)
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Personnel Workload Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">Visual timeline showing work distribution across team</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white p-1 rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Calendar className="w-4 h-4" />
              Monthly Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <LayoutList className="w-4 h-4" />
              Full Timeline
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-600 animate-pulse">
            Loading data...
          </div>
        ) : (
          <>
            {/* Person Filter */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Filter by Person</h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedPeople.length === USERS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {USERS.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(user.id)}
                      onChange={() => togglePerson(user.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Month Navigation (only for monthly view) */}
            {viewMode === 'monthly' && (
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
                  {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}

            {/* View Content */}
            {viewMode === 'monthly' ? (
              <MonthlyCalendarView
                allPeopleData={filteredData}
                year={currentYear}
                month={currentMonth}
              />
            ) : (
              <TimelineView allPeopleData={filteredData} />
            )}

            {/* Team Comparison */}
            {allUsersData.length > 0 && (
              <div className="mt-6">
                <TeamComparison peopleData={allUsersData} />
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
