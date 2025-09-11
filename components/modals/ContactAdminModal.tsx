import React, { useEffect, useMemo, useState } from 'react';

interface ContactAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPremium?: { name: string; subject: string } | null;
}

type Step = 1 | 2 | 3;

const SERVICE_OPTIONS = [
    { id: 'unlock', labelFr: 'Envoyez vos propres documents pour traitement', labelAr: 'أرسل دروسي لمعالجتها', price: 65, icon: 'fa-file-arrow-up' },
    { id: 'bundle', labelFr: 'Accédez à une classe complète prête à l\'emploi', labelAr: 'القسم المختار', price: 45, icon: 'fa-graduation-cap' },
] as const;

type Lang = 'fr' | 'ar';

const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose, selectedPremium }) => {
    const [step, setStep] = useState<Step>(1);
    // Définir 'unlock' (envoyer mes leçons) comme option par défaut
    const [service, setService] = useState<typeof SERVICE_OPTIONS[number]['id']>('unlock');
    const [lang, setLang] = useState<Lang>('fr');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        establishment: '',
        cycle: selectedPremium ? '' : '',
        className: selectedPremium?.name || '',
        subject: selectedPremium?.subject || '',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState<null | 'ok' | 'fail'>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const getServiceLabel = (id: typeof SERVICE_OPTIONS[number]['id']) => {
        const opt = SERVICE_OPTIONS.find(o => o.id === id);
        if (!opt) return id;
        
        return lang === 'ar' ? opt.labelAr : opt.labelFr;
    };

    // Mettre à jour automatiquement les données quand une classe premium est sélectionnée
    useEffect(() => {
        if (selectedPremium) {
            setService('bundle');
            setForm(prev => ({
                ...prev,
                className: selectedPremium.name,
                subject: selectedPremium.subject
            }));
        }
    }, [selectedPremium]);

    const t = useMemo(() => {
        const dict = {
            fr: {
                modalTitle: "Demande d'accès Premium",
                step1: 'Service',
                step2: 'Données',
                step3: 'Confirmation',
                selectService: 'Sélectionnez le type de service',
                next: 'Suivant',
                back: 'Retour',
                send: 'Envoyer',
                finish: 'Terminer',
                review: 'Vérifiez et envoyez',
                name: 'Nom complet',
                phone: 'Téléphone',
                establishment: 'Établissement',
                class: 'Classe',
                classes: 'Classes',
                classesPlaceholder: 'Entrez une ou plusieurs classes (séparées par une virgule ou une nouvelle ligne)…',
                subject: 'Matière',
                message: 'Message',
                pdfs: 'Documents PDF à traiter (optionnel)',
                addPdfs: 'Ajouter des fichiers PDF',
                pdfOnly: 'PDF uniquement (jusqu’à 10 fichiers, 5 Mo chacun, total 25 Mo)',
                selectedFiles: 'Fichiers sélectionnés',
                remove: 'Retirer',
                placeholderMessage: 'Écrivez votre demande ici…',
                sentOk: "Votre demande a été envoyée. Elle sera traitée au plus tard sous 24h et le fichier sera envoyé à l'adresse email que vous avez fournie.",
                sentFail: "Échec de l'envoi. Essayez à nouveau ou utilisez votre email.",
                help: 'Aide',
                sectionContact: 'Vos coordonnées',
                sectionClasses: 'Classes et matière',
                sectionPdfs: 'Documents PDF',
                sectionMessage: 'Message',
            },
            ar: {
                modalTitle: 'طلب الولوج إلى الأقسام المدفوعة',
                step1: 'نوع الخدمة',
                step2: 'البيانات',
                step3: 'تأكيد',
                selectService: 'حدد نوع الخدمة',
                next: 'التالي',
                back: 'رجوع',
                send: 'إرسال',
                finish: 'إنهاء',
                review: 'تحقق ثم أرسل',
                name: 'الاسم الكامل',
                phone: 'الهاتف',
                establishment: 'المؤسسة',
                class: 'القسم',
                classes: 'الأقسام',
                classesPlaceholder: 'أدخل قسماً أو عدة أقسام (افصل بينها بفواصل أو أسطر جديدة)…',
                subject: 'المادة',
                message: 'رسالة',
                pdfs: 'ملفات PDF للمعالجة (اختياري)',
                addPdfs: 'إضافة ملفات PDF',
                pdfOnly: 'PDF فقط (حتى 10 ملفات، 5 م.ب لكل ملف، المجموع 25 م.ب)',
                selectedFiles: 'الملفات المحددة',
                remove: 'إزالة',
                placeholderMessage: 'اكتب طلبك هنا…',
                sentOk: 'تم إرسال طلبك. سيتم معالجته في غضون 24 ساعة كحد أقصى وسيُرسل الملف إلى بريدك الإلكتروني المدخل.',
                sentFail: 'فشل الإرسال. أعد المحاولة أو استخدم بريدك الإلكتروني.',
                help: 'إيضاحات',
                sectionContact: 'معلومات الاتصال',
                sectionClasses: 'الأقسام والمادة',
                sectionPdfs: 'ملفات PDF',
                sectionMessage: 'رسالة',
            }
        } as const;
        return dict[lang];
    }, [lang]);

    const helpContent = useMemo(() => {
        const content = {
            fr: {
                step1: [
                    'Choisissez le service adapté : contenu prêt ou envoi de vos cours.',
                    'Vous pourrez détailler vos classes à l\'étape suivante.',
                ],
                step2: [
                    'Nom et Email sont requis pour pouvoir vous répondre.',
                    'Entrez plusieurs classes séparées par des virgules ou des lignes (ex: 3e–Maths, 3e–Français).',
                    'La matière et le message sont facultatifs mais utiles pour accélérer.',
                ],
                step3: [
                    'Relisez vos informations, surtout l\'Email.',
                    'Traitement sous 24h max; vous recevrez les fichiers par email.',
                ],
            },
            ar: {
                step1: [
                    'اختر الصيغة المناسبة: محتوى جاهز أو سأرسل دروسي للمعالجة.',
                    'التفاصيل (الأقسام) ستملؤها في الخطوة التالية.',
                ],
                step2: [
                    'الاسم والبريد الإلكتروني مطلوبان للمتابعة والتواصل.',
                    'أدخل عدة أقسام مفصولة بفواصل أو أسطر (مثال: الثالثة–رياضيات، الثالثة–فرنسية).',
                    'المادة والرسالة اختيارية لكنها تُسرّع الإنجاز.',
                ],
                step3: [
                    'راجع المعلومات خاصة البريد الإلكتروني.',
                    'المعالجة خلال 24 ساعة كحد أقصى وسيصلك الملف عبر البريد.',
                ],
            }
        } as const;
        
        const lang_key = lang === 'ar' ? 'ar' : 'fr';
        const step_key = step === 1 ? 'step1' : step === 2 ? 'step2' : 'step3';
        return content[lang_key][step_key];
    }, [lang, step]);

    const mailto = useMemo(() => {
        const to = 'bdh.malek@gmail.com';
        const subject = encodeURIComponent(lang === 'ar' ? 'طلب الولوج إلى الأقسام المدفوعة' : "Demande d'accès Premium");
        const lines = [
            `${lang === 'ar' ? 'الخدمة' : 'Service'}: ${getServiceLabel(service)}`,
            (() => {
                const list = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                if (!list.length) return `${t.classes}: —`;
                return `${t.classes}:\n- ${list.join('\n- ')}`;
            })(),
            `${t.subject}: ${form.subject}`,
            `${t.establishment}: ${form.establishment}`,
            `${t.name}: ${form.fullName}`,
            `Email: ${form.email}`,
            `${t.phone}: ${form.phone}`,
            '',
            `${t.message}:`,
            form.message,
        ];
        const body = encodeURIComponent(lines.join('\n'));
        return `mailto:${to}?subject=${subject}&body=${body}`;
    }, [service, form, lang, t]);

    const resetAndClose = () => {
        setStep(1);
        setService('unlock');
        setForm({ fullName: '', email: '', phone: '', establishment: '', cycle: '', className: selectedPremium?.name || '', subject: selectedPremium?.subject || '', message: '' });
        setLang('fr');
        setSending(false);
        setSent(null);
        setShowHelp(false);
        onClose();
    };

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isOpen]);

    if (!isOpen) return null;

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const arClass = lang === 'ar' ? 'font-ar' : '';
    const labelClass = lang === 'ar' ? 'block text-sm text-gray-700 mb-1' : 'block text-xs text-gray-600 mb-1';
    const bodyTextSize = lang === 'ar' ? 'text-[15px] leading-relaxed' : '';

    const handleSend = async () => {
        setSending(true);
        setSent(null);
        try {
            const formData = new FormData();
            formData.append('name', form.fullName);
            formData.append('email', form.email || 'no-reply@example.com');
            formData.append('subject', lang === 'ar' ? 'طلب الولوج إلى الأقسام المدفوعة' : "Demande d'accès Premium");
            const msg = [
                `${lang === 'ar' ? 'الخدمة' : 'Service'}: ${getServiceLabel(service)}`,
                (() => {
                    const list = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                    if (!list.length) return `${t.classes}: —`;
                    return `${t.classes}:\n- ${list.join('\n- ')}`;
                })(),
                `${t.subject}: ${form.subject}`,
                `${t.establishment}: ${form.establishment}`,
                `${t.name}: ${form.fullName}`,
                `Email: ${form.email}`,
                `${t.phone}: ${form.phone}`,
                files.length ? `${lang === 'ar' ? 'عدد الملفات' : 'Nombre de fichiers'}: ${files.length}` : '',
                '',
                `${t.message}:`,
                form.message || '-'
            ].filter(Boolean).join('\n');
            formData.append('message', msg);
            formData.append('_captcha', 'false');
            formData.append('_template', 'table');
            
            // Attach PDFs with individual field names instead of array notation
            if (files.length) {
                files.forEach((file, index) => {
                    formData.append(`attachment_${index}`, file, file.name);
                });
            }
            
            // Use non-AJAX endpoint so FormSubmit processes attachments
            const res = await fetch('https://formsubmit.co/bdh.malek@gmail.com', {
                method: 'POST',
                body: formData
            });
            
            // FormSubmit returns 200 for successful submissions
            if (res.ok) {
                setSent('ok');
            } else {
                console.error('FormSubmit error:', res.status, await res.text());
                setSent('fail');
            }
        } catch (error) {
            console.error('Send error:', error);
            setSent('fail');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4" onClick={resetAndClose}>
            <div className={`bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:w-auto sm:max-w-4xl flex flex-col max-h-[90vh] ${arClass} animate-slide-in-up ${bodyTextSize} elevation-3`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} dir={dir}>
                
                {/* Material Design Drag Handle (mobile) */}
                <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-8 h-1 rounded-full bg-gray-300"></div>
                </div>
                
                {/* Minimal Header */}
                 <div className="px-4 py-3 border-b border-gray-100 bg-white relative">
                     <div className="flex items-center justify-between gap-2">
                         <div className="flex items-center gap-2 text-gray-900 min-w-0">
                             <h2 className={`text-lg font-medium text-gray-900 truncate ${lang === 'ar' ? 'font-ar' : ''}`}>{t.modalTitle}</h2>
                         </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
                                <button aria-pressed={lang==='fr'} className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${lang === 'fr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setLang('fr')}>FR</button>
                                <button aria-pressed={lang==='ar'} className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${lang === 'ar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setLang('ar')}>AR</button>
                            </div>
                            <button onClick={resetAndClose} aria-label="Fermer" className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200 flex items-center justify-center">
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Minimal Progress Indicator */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                                    step >= stepNum 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {step > stepNum ? (
                                        <i className="fas fa-check text-xs"></i>
                                    ) : (
                                        stepNum
                                    )}
                                </div>
                                <span className={`text-xs mt-1 ${step===stepNum ? 'text-indigo-600 font-medium' : 'text-gray-500'} ${lang === 'ar' ? 'font-ar' : ''}`}>{stepNum === 1 ? t.step1 : stepNum === 2 ? t.step2 : t.step3}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                    <div className="p-4 flex flex-col h-full min-h-0 max-h-[72vh] sm:max-h-[75vh] leading-relaxed overscroll-contain">
                    
                    {/* Help Section */}
                    {showHelp && (
                        <div className="mb-3 flex-shrink-0">
                            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center mt-0.5">
                                        <i className="fas fa-lightbulb text-indigo-600 text-xs"></i>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-indigo-900 mb-1 text-sm">{t.help}</h4>
                                        <ul className="space-y-1 text-xs text-indigo-800">
                                            {helpContent.map((line, i) => (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="flex-shrink-0 w-1 h-1 bg-indigo-400 rounded-full mt-1.5"></span>
                                                    <span className="leading-tight">{line}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button 
                                        onClick={() => setShowHelp(false)}
                                        className="flex-shrink-0 w-5 h-5 text-indigo-400 hover:text-indigo-600 transition-colors"
                                        aria-label="Fermer l'aide"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4 min-h-0">
                                <p className={`text-sm text-slate-700 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>{t.selectService}</p>
                                <div className="grid grid-cols-1 gap-3">
                                {SERVICE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`${lang === 'ar' ? 'text-right' : 'text-left'} px-6 py-4 transition-all duration-200 ${service === opt.id ? 'bg-indigo-50 text-indigo-900' : 'bg-gray-50 hover:bg-gray-100' } flex justify-between items-center w-full`}
                                        onClick={() => setService(opt.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`text-base font-semibold ${lang === 'ar' ? 'font-ar' : ''}`}>{lang === 'fr' ? opt.labelFr : opt.labelAr}</div>
                                            <div className="bg-green-100 text-green-700 px-3 py-1 text-xs font-medium flex items-center">
                                                <i className="fas fa-tag mr-1"></i>
                                                -30% de réduction
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500 line-through">{Math.round(opt.price * 1.3)} DH</span>
                                                <span className="text-lg text-indigo-600 font-bold">{opt.price} DH</span>
                                            </div>
                                            {service === opt.id && <i className="fas fa-check-circle text-indigo-600 text-lg"></i>}
                                        </div>
                                    </button>
                                ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 sticky bottom-0 bg-white border-t border-gray-100 z-10 py-2 px-1">
                                <button 
                                    onClick={() => setShowHelp(v => !v)} 
                                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                >
                                    <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-500 text-sm`}></i>
                                </button>
                                <button onClick={() => setStep(2)} className="h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm flex items-center gap-1.5">{t.next} <i className="fas fa-arrow-right text-xs"></i></button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form className="flex flex-col h-full min-h-0" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                            {/* Scrollable content area */}
                            <div className="flex-1 overflow-y-auto space-y-5 px-1 pb-4 min-h-0">
                            
                            {/* Elegant Rectangular Class & Subject Section */}
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 mb-6">
                                {service === 'bundle' ? (
                                    <div className="flex items-center justify-center py-4 bg-orange-100 text-orange-800 font-medium text-lg">
                                        <i className="fas fa-star mr-3 text-orange-600"></i>
                                        Classe choisie : {selectedPremium?.name || 'Classe Premium'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{t.classes}</label>
                                            <input 
                                                type="text"
                                                className="w-full h-12 px-4 bg-white border-l-4 border-indigo-500 shadow-sm focus:outline-none focus:shadow-md transition-all duration-300" 
                                                placeholder={t.classesPlaceholder} 
                                                value={form.className} 
                                                onChange={(e) => setForm(f => ({ ...f, className: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{t.subject}</label>
                                            <input 
                                                className="w-full h-12 px-4 bg-white border-l-4 border-indigo-500 shadow-sm focus:outline-none focus:shadow-md transition-all duration-300" 
                                                value={form.subject} 
                                                onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} 
                                                placeholder="Ex: Mathématiques, Physique..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section: Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <h3 className={`text-lg font-bold text-slate-800 mb-1 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>{t.sectionContact}</h3>
                                    <p className={`text-sm text-slate-600 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>Vos informations de contact</p>
                                </div>
                                <div>
                                    <label className={labelClass}>{t.name}</label>
                                    <input className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className={labelClass}>{t.phone}</label>
                                    <input className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>{t.establishment}</label>
                                    <input className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200" value={form.establishment} onChange={(e) => setForm(f => ({ ...f, establishment: e.target.value }))} />
                                </div>
                            </div>

                            {/* Section: Message - Only for 'unlock' service */}
                            {service === 'unlock' && (
                                <div className="grid grid-cols-1 gap-3">
                                    <h3 className={`text-lg font-bold text-slate-800 mb-1 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>{t.sectionMessage}</h3>
                                    <p className={`text-sm text-slate-600 mb-3 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>Votre demande personnalisée</p>
                                    <div>
                                        <label className={labelClass}>{t.message}</label>
                                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200" placeholder={t.placeholderMessage} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Section: PDFs - Visual Modern Display */}
                            {service === 'unlock' && (
                                <div className="grid grid-cols-1 gap-5 w-full">
                                    <div className="col-span-1">
                                        <h3 className={`text-lg font-bold text-slate-800 mb-1 flex items-center gap-2 ${lang === 'ar' ? 'font-ar text-right flex-row-reverse' : ''}`}>
                                            <i className="fas fa-file-pdf text-rose-500"></i>
                                            {t.sectionPdfs}
                                        </h3>
                                        <p className={`text-sm text-slate-600 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>Joignez vos documents (optionnel)</p>
                                    </div>
                                    
                                    {/* Visual PDF Upload */}
                                    <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                                                    <i className="fas fa-file-upload text-rose-600"></i>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-800">Documents PDF</h4>
                                                    <p className="text-xs text-slate-500">Envoyez vos propres chapitres</p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-md font-medium">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                Max 25 Mo
                                            </span>
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-indigo-300 transition-colors">
                                                <div className="mb-2">
                                                    <i className="fas fa-cloud-upload-alt text-2xl text-indigo-400"></i>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">Glissez-déposez vos fichiers PDF ici ou</p>
                                                <label className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                                                    <i className="fas fa-folder-open mr-2"></i>
                                                    <span className="text-sm font-medium">Parcourir les fichiers</span>
                                                    <input
                                                        type="file"
                                                        name="attachment"
                                                        accept="application/pdf"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const list: File[] = e.target.files ? Array.from(e.target.files) : [];
                                                            const onlyPdf = list.filter(f => f.type === 'application/pdf');
                                                            const limited = onlyPdf.slice(0, 10);
                                                            // limits aligned with send-time validation (5MB each, 25MB total)
                                                            const perFileLimit = 5 * 1024 * 1024;
                                                            const totalLimit = 25 * 1024 * 1024;
                                                            const filtered = limited.filter(f => f.size <= perFileLimit);
                                                            const total = filtered.reduce((acc, f) => acc + f.size, 0);
                                                            if (limited.length !== filtered.length) {
                                                                setFileError(lang === 'ar' ? 'أقصى حجم للملف 5 م.ب' : 'Taille max par fichier: 5 Mo');
                                                            } else if (total > totalLimit) {
                                                                setFileError(lang === 'ar' ? 'إجمالي الحجم يتجاوز 25 م.ب' : 'Taille totale dépasse 25 Mo');
                                                            } else {
                                                                setFileError(null);
                                                            }
                                                            setFiles(total > totalLimit ? [] : filtered);
                                                        }}
                                                    />
                                                </label>
                                                <p className="text-xs text-slate-500 mt-3">{t.pdfOnly}</p>
                                            </div>
                                            
                                            {fileError && (
                                                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    <span>{fileError}</span>
                                                </div>
                                            )}
                                            
                                            {!!files.length && (
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                                            <i className="fas fa-paperclip text-indigo-500"></i>
                                                            {t.selectedFiles} ({files.length})
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                                            onClick={() => setFiles([])}
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                            Tout supprimer
                                                        </button>
                                                    </div>
                                                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                        {files.map((f, i) => (
                                                            <li key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <i className="fas fa-file-pdf text-rose-500"></i>
                                                                    <span className="truncate">{f.name}</span>
                                                                    <span className="text-slate-400 whitespace-nowrap">({(f.size/1024/1024).toFixed(1)} Mo)</span>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    className="text-slate-500 hover:text-rose-600 ml-2" 
                                                                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                                >
                                                                    <i className="fas fa-times-circle"></i>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            </div>

                            {/* Footer: Step 2 - More compact for bundle service */}
                            <div className="flex justify-between items-center pt-1 sticky bottom-0 bg-white border-t border-gray-100 z-10 py-2 px-1">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)} 
                                    className="h-9 px-3 rounded-md border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1"
                                >
                                    <i className="fas fa-arrow-left text-slate-500 text-xs"></i>
                                    <span>{t.back}</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    {service === 'unlock' && (
                                        <button 
                                            type="button"
                                            onClick={() => setShowHelp(v => !v)} 
                                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                        >
                                            <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-500 text-sm`}></i>
                                        </button>
                                    )}
                                    <button type="submit" className="h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm flex items-center gap-1.5">{t.next} <i className="fas fa-arrow-right text-xs"></i></button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
                                <h3 className={`text-xs font-semibold uppercase tracking-wide text-slate-500 ${lang === 'ar' ? 'font-ar text-right' : ''}`}>{t.review}</h3>
                                <div className={`space-y-2 text-sm ${lang === 'ar' ? 'font-ar text-right' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div><span className="text-gray-500">Service:</span> {getServiceLabel(service)}</div>
                                        {service === 'unlock' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-[11px] text-rose-700">
                                                <i className="fas fa-file-pdf"></i> PDF
                                            </span>
                                        )}
                                    </div>
                                    {(() => {
                                        const list = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                                        if (!list.length) return <div><span className="text-gray-500">{t.classes}:</span> —</div>;
                                        return (
                                            <div>
                                                <div className="text-gray-500">{t.classes}:</div>
                                                <ul className="list-disc pl-5 mt-1">
                                                    {list.map((c, i) => <li key={`${c}-${i}`}>{c}</li>)}
                                                </ul>
                                            </div>
                                        );
                                    })()}
                                    <div><span className="text-gray-500">{t.subject}:</span> {form.subject || '—'}</div>
                                    <div><span className="text-gray-500">{t.establishment}:</span> {form.establishment || '—'}</div>
                                    <div><span className="text-gray-500">{t.name}:</span> {form.fullName || '—'}</div>
                                    <div><span className="text-gray-500">Email:</span> {form.email || '—'}</div>
                                    <div><span className="text-gray-500">{t.phone}:</span> {form.phone || '—'}</div>
                                    {service === 'unlock' && (
                                        <div><span className="text-gray-500">PDF:</span> {files.length ? `${files.length} fichier(s)` : '—'}</div>
                                    )}
                                    {form.message && (
                                        <div className="pt-2">
                                            <div className="text-gray-500">{t.message}:</div>
                                            <div className="whitespace-pre-line">{form.message}</div>
                                        </div>
                                    )}
                                </div>

                                {sent === 'ok' && (
                                    <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">{t.sentOk}</div>
                                )}
                                {sent === 'fail' && (
                                    <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">{t.sentFail}</div>
                                )}
                            </div>

                            {/* Footer: Step 3 - Minimal */}
                            <div className="flex justify-between items-center pt-1 sticky bottom-0 bg-white border-t border-gray-100 z-10 py-2 px-1">
                                <button 
                                    onClick={() => setStep(2)} 
                                    className="h-9 px-3 rounded-md border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1"
                                >
                                    <i className="fas fa-arrow-left text-slate-500 text-xs"></i>
                                    <span>{t.back}</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowHelp(v => !v)} 
                                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-500 text-sm`}></i>
                                    </button>
                                    <button 
                                        disabled={sending} 
                                        onClick={sent === 'ok' ? resetAndClose : handleSend} 
                                        className={`h-9 px-4 rounded-md ${sent === 'ok' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm flex items-center gap-1.5 ${sending ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        <i className={`fas ${sent === 'ok' ? 'fa-check' : (sending ? 'fa-circle-notch fa-spin' : 'fa-paper-plane')} text-xs`}></i>
                                        {sent === 'ok' ? t.finish : t.send}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ContactAdminModal;
