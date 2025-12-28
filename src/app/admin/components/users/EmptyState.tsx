import { memo } from "react";

export const EmptyState = memo(() => (
    <div className="py-12 text-center">
        <i className="fa-duotone fa-users-slash text-gray-300 text-4xl mb-3" />
        <p className="text-gray-500">Nenhum utilizador encontrado</p>
    </div>
));

EmptyState.displayName = 'EmptyState';
