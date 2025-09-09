import React from 'react';

interface ContactAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden" role="dialog" aria-modal="true">
                {/* Header minimaliste */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-800">
                        <i className="fas fa-lock text-gray-700"></i>
                        <h2 className="text-sm font-semibold">Classe premium verrouillée</h2>
                    </div>
                    <button onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500">×</button>
                </div>

                {/* Corps compact */}
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-700">
                        Cette classe est réservée. Veuillez contacter l'administrateur pour l'activer.
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                        <a href="mailto:bdh.malek@gmail.com" className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300">
                            <i className="fas fa-envelope text-blue-600"></i>
                            bdh.malek@gmail.com
                        </a>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200">
                            <i className="fas fa-phone text-green-600"></i>
                            <span>+212 6XX XX XX XX</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button onClick={onClose} className="flex-1 h-9 text-sm rounded-md border border-gray-200 hover:border-gray-300">Fermer</button>
                        <a
                            href="mailto:bdh.malek@gmail.com?subject=Demande%20acc%C3%A8s%20classe%20premium"
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 h-9 text-sm rounded-md bg-gray-900 text-white hover:bg-black inline-flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-paper-plane"></i>
                            Contacter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactAdminModal;
