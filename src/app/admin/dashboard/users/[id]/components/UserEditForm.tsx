import React from "react";
import { UserData } from "../types";
import NewButton from "@/app/components/newButton";
import { AvatarUpload } from "@/components/AvatarUpload";
import { FinancialSummary } from "./userEdit/FinancialSummary";
import { PersonalInfoSection } from "./userEdit/PersonalInfoSection";
import { FinancialSection } from "./userEdit/FinancialSection";
import { NotesSection } from "./userEdit/NotesSection";

interface UserEditFormProps {
    user: UserData;
    setUser: (user: UserData) => void;
    onSave: () => void;
    saving: boolean;
}

// Inline spinner component matching LoadingSpinner style
const InlineSpinner: React.FC = () => (
    <div className="w-4 h-4 relative">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
    </div>
);

export const UserEditForm: React.FC<UserEditFormProps> = React.memo(({
    user,
    setUser,
    onSave,
    saving
}) => {
    const handleChange = (field: keyof UserData, value: any) => {
        setUser({ ...user, [field]: value });
    };

    return (
        <div className="space-y-5">
            {/* Avatar Section */}
            <div className="flex flex-col items-center pb-4 border-b border-gray-100">
                <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={user.avatarUrl}
                    userName={user.name}
                    userSurname={user.surname}
                    size={120}
                    onUploadSuccess={(url) => handleChange('avatarUrl', url)}
                    extraInfo={<FinancialSummary user={user} />}
                />
            </div>

            {/* Personal Info Section */}
            <PersonalInfoSection user={user} onChange={handleChange} />

            {/* Financial Section */}
            <FinancialSection user={user} onChange={handleChange} />

            {/* Notes Section */}
            <NotesSection user={user} onChange={handleChange} />

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <NewButton
                    onClick={onSave}
                    disabled={saving}
                    variant="new_primary_rounded"
                    icon={saving ? <InlineSpinner /> : <i className="fa-duotone fa-save"></i>}
                >
                    {saving ? 'A Guardar...' : 'Guardar Alterações'}
                </NewButton>
            </div>
        </div>
    );
});

UserEditForm.displayName = 'UserEditForm';
