
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface UserProfileProps {
    userName: string;
    onOpenSettings: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, onOpenSettings }) => {
  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-8 z-30">
      <button onClick={onOpenSettings} className="flex items-center gap-3 p-1.5 pr-3 rounded-full glass-panel hover:bg-white/20 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)]">
            {/* Placeholder for user avatar image */}
        </div>
        <span className="font-medium text-sm text-text-primary">{userName}</span>
        <ChevronDown size={16} className="text-text-secondary" />
      </button>
    </div>
  );
};

export default UserProfile;
