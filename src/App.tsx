import { useState, useEffect } from "react";
import { CalendarView } from "./components/calendar/CalendarView";
import { PatientCalendarView } from "./components/calendar/PatientCalendarView";
import { Users, Stethoscope } from "lucide-react";
import { consultationService } from "./services/consultationServices";
import type { Appointment, Absence } from "./types";

function App() {
  const [viewMode, setViewMode] = useState<'doctor' | 'patient'>('doctor');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [currentPatientId, setCurrentPatientId] = useState<string>('');

  // Initial Load
  useEffect(() => {
    const loadedAppointments = consultationService.getAllAppointments();
    const loadedAbsences = consultationService.getAllAbsences();

    setAppointments(loadedAppointments);
    setAbsences(loadedAbsences);

    // Persist Patient ID so it doesn't change on refresh
    let patientId = localStorage.getItem('current_patient_id');
    if (!patientId) {
      patientId = 'patient_' + Math.random().toString(36).substr(2, 5);
      localStorage.setItem('current_patient_id', patientId);
    }
    setCurrentPatientId(patientId);
  }, []);

  // Sync Appointments
  useEffect(() => {
    if (appointments.length > 0) {
      consultationService.saveAppointments(appointments);
    }
  }, [appointments]);

  // Sync Absences
  useEffect(() => {
    consultationService.saveAbsences(absences);
  }, [absences]);

  return (
    <div className="relative">
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
          <button
            onClick={() => setViewMode('doctor')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'doctor'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Stethoscope size={16} />
            Widok lekarza
          </button>
          <button
            onClick={() => setViewMode('patient')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'patient'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Users size={16} />
            Widok pacjenta
          </button>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'doctor' ? (
        <CalendarView
          appointments={appointments}
          setAppointments={setAppointments}
          absences={absences}
          setAbsences={setAbsences}
        />
      ) : (
        <PatientCalendarView
          appointments={appointments}
          setAppointments={setAppointments}
          absences={absences}
          currentPatientId={currentPatientId}
        />
      )}
    </div>
  );
}

export default App;
