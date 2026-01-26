import type React from "react";
import { SPECIALIZATIONS } from "../../types";

interface SpecializationSelectorProps {
    selectedSpecialization: string;
    onSpecializationChange: (specialization: string) => void;
}

export const SpecializationSelector: React.FC<SpecializationSelectorProps> = ({
    selectedSpecialization,
    onSpecializationChange
}) => {
    return (
        <div className="flex items-center gap-3">
            <label htmlFor="specialization" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Specjalizacja:
            </label>
            <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => onSpecializationChange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
                {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                        {spec}
                    </option>
                ))}
            </select>
        </div>
    );
};
