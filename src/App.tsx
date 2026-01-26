import { useState, useEffect } from "react";
import { CalendarView } from "./components/calendar/CalendarView";
import { PatientCalendarView } from "./components/calendar/PatientCalendarView";
import { consultationService } from "./services/consultationServices";
import type { Appointment, Absence, Notification } from "./types";

import { Auth } from "./components/auth/Auth";
import { LogOut, Bell } from "lucide-react";
import { NotificationCenter } from "./components/notifications/NotificationCenter";

function App() {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('profile') || 'null'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorId = user?.result?.role === 'DOCTOR' ? user.result._id : undefined;
        const loadedAppointments = await consultationService.getAllAppointments(doctorId);
        const loadedAbsences = await consultationService.getAllAbsences(doctorId);
        setAppointments(loadedAppointments);
        setAbsences(loadedAbsences);

        // Fetch notifications for the logged in user
        if (user?.result?._id) {
          const loadedNotifications = await consultationService.getNotifications(user.result._id);
          setNotifications(loadedNotifications);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Check session validity when window gains focus (detects logout from other browser)
  useEffect(() => {
    const checkSession = async () => {
      if (!user) return;

      const profile = localStorage.getItem('profile');
      if (!profile) return;

      const { refreshToken } = JSON.parse(profile);
      if (!refreshToken) return;

      try {
        const isValid = await consultationService.checkSession(refreshToken);

        if (!isValid) {
          localStorage.removeItem('profile');
          setUser(null);
          window.location.href = '/';
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    const handleFocus = () => {
      checkSession();
    };

    const intervalId = setInterval(checkSession, 30000);

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('profile');
    setUser(null);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await consultationService.markNotificationRead(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const unreadCount = notifications.length;

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

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          title="Powiadomienia"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Wyloguj się"
        >
          <LogOut size={20} />
        </button>
      </div>

      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

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
