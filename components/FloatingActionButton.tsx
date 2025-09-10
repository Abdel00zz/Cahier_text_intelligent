import React, { useState, useEffect } from 'react';

interface FabAction {
	icon: string; // font-awesome class
	label: string;
	onClick: () => void;
}

interface FloatingActionButtonProps {
	actions: FabAction[];
}

const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions }) => {
	const [open, setOpen] = useState(false);
	const [touch, setTouch] = useState(false);

	useEffect(() => { setTouch(isTouchDevice()); }, []);

	useEffect(() => {
		const close = (e: MouseEvent | TouchEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest?.('[data-fab-root]')) setOpen(false);
		};
		if (open) {
			document.addEventListener('click', close);
			document.addEventListener('touchstart', close);
		}
		return () => {
			document.removeEventListener('click', close);
			document.removeEventListener('touchstart', close);
		};
	}, [open]);

	// Always show the FAB, but adjust behavior based on device type

	return (
		<div data-fab-root className="fixed right-4 fab-safe z-40">
			<div className={`flex flex-col items-end gap-2 mb-2 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
				{actions.map((a, idx) => (
					<button
						key={idx}
						className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 shadow-md px-3 py-2 rounded-full"
						onClick={() => { a.onClick(); setOpen(false); }}
					>
						<i className={`${a.icon} text-base`}></i>
						<span className="text-sm font-medium">{a.label}</span>
					</button>
				))}
			</div>
			<button
				aria-label="Actions rapides"
				className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 active:scale-95"
				onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
			>
				<i className={`fas ${open ? 'fa-times' : 'fa-ellipsis-h'} text-xl transition-transform duration-200 ${open ? 'rotate-90' : ''}`}></i>
			</button>
		</div>
	);
};

export default FloatingActionButton;
