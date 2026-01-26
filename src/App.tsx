import { useState, useEffect } from "react";
import { CalendarView } from "./components/calendar/CalendarView";
import { PatientCalendarView } from "./components/calendar/PatientCalendarView";
import { consultationService } from "./services/consultationServices";
import type { Appointment, Absence } from "./types";

import { Auth } from "./components/auth/Auth";
import { LogOut } from "lucide-react";

function App() {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('profile') || 'null'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorId = user?.result?.role === 'DOCTOR' ? user.result._id : undefined;
        const loadedAppointments = await consultationService.getAllAppointments(doctorId);
        const loadedAbsences = await consultationService.getAllAbsences(doctorId);
        setAppointments(loadedAppointments);
        setAbsences(loadedAbsences);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('profile');
    setUser(null);
  };

  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="relative">
      {/* User Info & Logout */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-indigo-100">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
          {user.result.name.charAt(0)}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-gray-900 leading-tight">{user.result.name}</p>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-500">
            {user.result.role === 'DOCTOR' ? `Lekarz - ${user.result.specialization}` : 'Pacjent'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Wyloguj się"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Conditional View Rendering */}
      {user.result.role === 'DOCTOR' ? (
        <CalendarView
          appointments={appointments}
          setAppointments={setAppointments}
          absences={absences}
          setAbsences={setAbsences}
          doctorId={user.result._id}
        />
      ) : (
        <PatientCalendarView
          appointments={appointments}
          setAppointments={setAppointments}
          absences={absences}
          userResult={user.result}
        />
      )}
    </div>
  );
}

export default App;
