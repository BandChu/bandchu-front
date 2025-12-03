import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
  description?: string;
}

const EmptyState = ({ icon: Icon, message, description }: EmptyStateProps) => {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
      {description && (
        <p className="text-muted-foreground text-xs mt-1">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
