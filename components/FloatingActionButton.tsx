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
						className="flex items-center gap-1.5 text-black hover:bg-black hover:text-white border-b border-black px-2.5 py-1.5 transition-colors duration-150"
						onClick={() => { a.onClick(); setOpen(false); }}
					>
						<i className={`${a.icon} text-xs`}></i>
						<span className="text-xs font-medium">{a.label}</span>
					</button>
				))}
			</div>
			<button
				aria-label="Actions rapides"
				className="w-11 h-11 border-2 border-black text-black hover:bg-black hover:text-white flex items-center justify-center focus:outline-none transition-all duration-150 active:scale-95"
				onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
			>
				<i className={`${open ? 'fas fa-times' : 'fas fa-bars'} text-sm transition-transform duration-150 ${open ? 'rotate-90' : ''}`}></i>
			</button>
		</div>
	);
};

export default FloatingActionButton;
