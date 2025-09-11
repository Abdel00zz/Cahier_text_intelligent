import React, { useEffect, useMemo, useState } from 'react';

interface ContactAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPremium?: { name: string; subject: string } | null;
}

type Step = 1 | 2 | 3;

const SERVICE_OPTIONS = [
    { id: 'unlock', labelFr: 'Envoyez vos propres leçons en format PDF pour être traitées', labelAr: 'أرسل دروسك بصيغة PDF للمعالجة', price: 65, icon: 'fa-file-arrow-up' },
    { id: 'bundle', labelFr: 'Accédez à une classe complète prête à l\'emploi', labelAr: 'احصل على فصل دراسي كامل جاهز للاستخدام', price: 45, icon: 'fa-graduation-cap' },
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
                modalTitle: 'طلب الوصول إلى الخدمات المتميزة',
                step1: 'نوع الخدمة',
                step2: 'البيانات',
                step3: 'التأكيد',
                selectService: 'اختر نوع الخدمة المطلوبة',
                next: 'التالي',
                back: 'العودة',
                send: 'إرسال',
                finish: 'إنهاء',
                review: 'مراجعة وإرسال',
                name: 'الاسم الكامل',
                phone: 'رقم الهاتف',
                establishment: 'المؤسسة التعليمية',
                class: 'المستوى الدراسي',
                classes: 'المستويات الدراسية',
                classesPlaceholder: 'أدخل مستوى أو عدة مستويات دراسية (افصل بينها بفواصل أو أسطر جديدة)…',
                subject: 'المادة الدراسية',
                message: 'رسالة إضافية',
                pdfs: 'المستندات للمعالجة (اختياري)',
                addPdfs: 'إضافة ملفات PDF',
                pdfOnly: 'ملفات PDF فقط (حتى 10 ملفات، 5 ميجابايت لكل ملف، المجموع 25 ميجابايت)',
                selectedFiles: 'الملفات المختارة',
                remove: 'حذف',
                placeholderMessage: 'اكتب طلبك أو ملاحظاتك هنا…',
                sentOk: 'تم إرسال طلبك بنجاح. سيتم معالجته خلال 24 ساعة كحد أقصى وسيُرسل الملف إلى عنوان بريدك الإلكتروني.',
                sentFail: 'فشل في الإرسال. يرجى المحاولة مرة أخرى أو التواصل عبر البريد الإلكتروني.',
                help: 'مساعدة',
                sectionContact: 'بيانات التواصل',
                sectionClasses: 'المستويات والمواد الدراسية',
                sectionPdfs: 'المستندات',
                sectionMessage: 'رسالة إضافية',
            }
        } as const;
        return dict[lang];
    }, [lang]);

    const helpContent = useMemo(() => {
        const content = {
            fr: {
                step1: [
                    'Choisissez le service adapté : contenu prêt ou envoi de vos leçons en PDF.',
                    'Vous pourrez détailler vos informations à l\'étape suivante.',
                ],
                step2: [
                    'Nom et Email sont requis pour pouvoir vous répondre.',
                    'Les PDF doivent être tapés et clairement lisibles (pas manuscrits).',
                    'Assurez-vous que le texte dans vos PDF est visible et net pour un traitement optimal.',
                ],
                step3: [
                    'Relisez vos informations, surtout l\'Email.',
                    'Traitement sous 24h max; vous recevrez les fichiers par email.',
                ],
            },
            ar: {
                step1: [
                    'اختر نوع الخدمة المناسبة: محتوى جاهز للاستخدام أو معالجة دروسك بصيغة PDF.',
                    'ستقوم بإدخال تفاصيل المستويات الدراسية في الخطوة التالية.',
                ],
                step2: [
                    'الاسم الكامل والبريد الإلكتروني مطلوبان للتواصل وإرسال النتائج.',
                    'ملفات PDF يجب أن تكون مكتوبة بوضوح وقابلة للقراءة (ليس مكتوبة بخط اليد).',
                    'تأكد من أن النصوص في ملفات PDF واضحة ومرئية للحصول على أفضل نتائج المعالجة.',
                ],
                step3: [
                    'راجع جميع المعلومات المدخلة، خاصة عنوان البريد الإلكتروني.',
                    'ستتم المعالجة خلال 24 ساعة كحد أقصى وسيتم إرسال الملفات إلى بريدك الإلكتروني.',
                ],
            }
        } as const;
        
        const lang_key = lang === 'ar' ? 'ar' : 'fr';
        const step_key = step === 1 ? 'step1' : step === 2 ? 'step2' : 'step3';
        return content[lang_key][step_key];
    }, [lang, step]);

    const mailto = useMemo(() => {
        const to = 'bdh.malek@gmail.com';
        const subject = encodeURIComponent(lang === 'ar' ? 'طلب الوصول إلى الخدمات المتميزة' : "Demande d'accès Premium");
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
            formData.append('subject', lang === 'ar' ? 'طلب الوصول إلى الخدمات المتميزة' : "Demande d'accès Premium");
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
            <div className={`bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:w-auto sm:max-w-2xl lg:max-w-3xl flex flex-col max-h-[95vh] sm:max-h-[90vh] ${arClass} animate-slide-in-up ${bodyTextSize} elevation-3`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} dir={dir}>
                
                {/* Material Design Drag Handle (mobile) */}
                <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-8 h-1 rounded-full bg-gray-300"></div>
                </div>
                
                {/* Mobile-Optimized Header */}
                 <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 bg-white relative">
                     <div className="flex items-center justify-between gap-2">
                         <div className="flex items-center gap-2 text-gray-900 min-w-0">
                             <h2 className={`text-base sm:text-lg font-medium text-gray-900 truncate ${lang === 'ar' ? 'font-ar' : ''}`}>{t.modalTitle}</h2>
                         </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5 sm:p-1 shadow-sm">
                                <button aria-pressed={lang==='fr'} className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${lang === 'fr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setLang('fr')}>FR</button>
                                <button aria-pressed={lang==='ar'} className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${lang === 'ar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setLang('ar')}>AR</button>
                            </div>
                            <button onClick={resetAndClose} aria-label="Fermer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors duration-200 flex items-center justify-center">
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile-Optimized Progress Indicator */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex flex-col items-center">
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
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
                                <span className={`text-xs mt-1 text-center ${step===stepNum ? 'text-indigo-600 font-medium' : 'text-gray-500'} ${lang === 'ar' ? 'font-ar' : ''}`}>{stepNum === 1 ? t.step1 : stepNum === 2 ? t.step2 : t.step3}</span>
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
                                <div className="grid grid-cols-1 gap-4">
                                {SERVICE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`${lang === 'ar' ? 'text-right' : 'text-left'} p-5 rounded-xl border-2 transition-all duration-200 ${service === opt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm' } w-full`}
                                        onClick={() => setService(opt.id)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                            <div className="flex flex-col gap-2">
                                                <div className={`text-lg font-bold ${lang === 'ar' ? 'font-ar' : ''} ${service === opt.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                    {lang === 'fr' ? opt.labelFr : opt.labelAr}
                                                </div>
                                                <div className="bg-green-100 text-green-700 px-3 py-1.5 text-xs font-medium rounded-full flex items-center w-fit">
                                                    <i className="fas fa-tag mr-1"></i>
                                                    -30% de réduction
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-sm text-gray-500 line-through">{Math.round(opt.price * 1.3)} DH</span>
                                                     <span className="text-xl font-bold text-indigo-600">{opt.price} DH</span>
                                                 </div>
                                                 {service === opt.id && <i className="fas fa-check-circle text-indigo-600 text-lg"></i>}
                                             </div>
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
                            {/* Mobile-Optimized Scrollable content area */}
                            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-5 px-2 sm:px-1 pb-3 sm:pb-4 min-h-0">
                            
                            {/* Combined Section: Classes & Documents */}
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 mb-6">
                                {service === 'bundle' ? (
                                    <div className="flex items-center justify-center py-4 bg-orange-100 text-orange-800 font-medium text-lg">
                                        <i className="fas fa-star mr-3 text-orange-600"></i>
                                        Classe choisie : <span className="text-orange-600 font-bold">{selectedPremium?.name || 'Classe Premium'}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">

                                        
                                        {/* Minimal Class Info Display */}
                                         {(form.className || form.subject) && (
                                             <div className="bg-orange-50 p-3 text-orange-700">
                                                 {form.className && (
                                                     <div className="text-sm">
                                                         <span className="font-medium">Classe :</span> <span className="font-semibold">{form.className}</span>
                                                     </div>
                                                 )}
                                                 {form.subject && (
                                                     <div className="text-sm">
                                                         <span className="font-medium">Matière :</span> <span className="font-semibold">{form.subject}</span>
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                        
                                        {/* Mobile-Optimized Documents PDF Section */}
                                         <div className="space-y-2 sm:space-y-3">
                                             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                 <h4 className="text-base sm:text-lg font-bold text-slate-800">Documents PDF *</h4>
                                                 <span className="text-xs sm:text-sm text-orange-600 font-medium">(obligatoire)</span>
                                             </div>
                                             
                                             <label className="block w-full p-3 sm:p-4 bg-white border-2 border-dashed border-orange-300 hover:border-orange-400 cursor-pointer transition-colors rounded-lg">
                                                <div className="text-center">
                                                    <i className="fas fa-cloud-upload-alt text-2xl text-orange-500 mb-2"></i>
                                                    <p className="text-sm text-slate-700 font-medium">Cliquez pour sélectionner vos fichiers PDF</p>
                                                    <p className="text-xs text-slate-500 mt-1">Maximum 10 fichiers, 5 Mo chacun</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    name="attachment"
                                                    accept="application/pdf"
                                                    multiple
                                                    required
                                                    className="hidden"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const list: File[] = e.target.files ? Array.from(e.target.files) : [];
                                                        const onlyPdf = list.filter(f => f.type === 'application/pdf');
                                                        const limited = onlyPdf.slice(0, 10);
                                                        const perFileLimit = 5 * 1024 * 1024;
                                                        const totalLimit = 25 * 1024 * 1024;
                                                        const filtered = limited.filter(f => f.size <= perFileLimit);
                                                        const total = filtered.reduce((acc, f) => acc + f.size, 0);
                                                        if (limited.length !== filtered.length) {
                                                            setFileError(lang === 'ar' ? 'الحد الأقصى لحجم الملف 5 ميجابايت' : 'Taille max par fichier: 5 Mo');
                                                        } else if (total > totalLimit) {
                                                            setFileError(lang === 'ar' ? 'إجمالي الحجم يتجاوز 25 ميجابايت' : 'Taille totale dépasse 25 Mo');
                                                        } else {
                                                            setFileError(null);
                                                        }
                                                        setFiles(total > totalLimit ? [] : filtered);
                                                    }}
                                                />
                                            </label>
                                            
                                            {fileError && (
                                                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    <span>{fileError}</span>
                                                </div>
                                            )}
                                            
                                            {!!files.length && (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-slate-700">
                                                        Fichiers sélectionnés ({files.length})
                                                    </div>
                                                    <div className="space-y-1">
                                                        {files.map((f, i) => (
                                                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                                                                <div className="flex items-center gap-2">
                                                                    <i className="fas fa-file-pdf text-red-500"></i>
                                                                    <span className="text-sm">{f.name}</span>
                                                                    <span className="text-xs text-slate-500">({(f.size/1024/1024).toFixed(1)} Mo)</span>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    className="text-red-500 hover:text-red-700" 
                                                                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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





                            </div>

                            {/* Mobile-Optimized Footer */}
                            <div className="flex justify-between items-center pt-1 sticky bottom-0 bg-white border-t border-gray-100 z-10 py-2 sm:py-2 px-2 sm:px-1">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)} 
                                    className="h-10 sm:h-9 px-3 sm:px-3 rounded-md border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1"
                                >
                                    <i className="fas fa-arrow-left text-slate-500 text-xs"></i>
                                    <span className="hidden sm:inline">{t.back}</span>
                                </button>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {service === 'unlock' && (
                                        <button 
                                            type="button"
                                            onClick={() => setShowHelp(v => !v)} 
                                            className="inline-flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                                        >
                                            <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-500 text-sm`}></i>
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={service === 'unlock' && files.length === 0}
                                        className={`h-10 sm:h-9 px-4 sm:px-4 rounded-md text-white text-sm flex items-center gap-1.5 ${
                                            service === 'unlock' && files.length === 0 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                    >
                                        <span className="sm:hidden">Suivant</span>
                                        <span className="hidden sm:inline">{t.next}</span>
                                        <i className="fas fa-arrow-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-4">
                                {/* Modern Header */}
                                <div className="text-center py-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-check-circle text-2xl text-indigo-600"></i>
                                    </div>
                                    <h3 className={`text-lg font-bold text-slate-800 mb-1 ${lang === 'ar' ? 'font-ar' : ''}`}>{t.review}</h3>
                                    <p className={`text-sm text-slate-600 ${lang === 'ar' ? 'font-ar' : ''}`}>Vérifiez vos informations avant l'envoi</p>
                                </div>

                                {/* Service Card */}
                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <i className={`fas ${service === 'unlock' ? 'fa-file-upload' : 'fa-graduation-cap'} text-indigo-600`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Service sélectionné</h4>
                                                <p className="text-sm text-slate-600">{getServiceLabel(service)}</p>
                                            </div>
                                        </div>
                                        {service === 'unlock' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">
                                                <i className="fas fa-file-pdf"></i> Documents PDF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Academic Info Card */}
                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <i className="fas fa-graduation-cap text-indigo-600"></i>
                                        <h4 className="font-semibold text-slate-800">Informations académiques</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{t.classes}</div>
                                            {(() => {
                                                const list = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                                                if (!list.length) return <div className="text-slate-400">Non spécifié</div>;
                                                return (
                                                    <div className="flex flex-wrap gap-1">
                                                        {list.map((c, i) => (
                                                            <span key={`${c}-${i}`} className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{t.subject}</div>
                                            <div className="text-sm text-slate-800">{form.subject || 'Non spécifié'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info Card */}
                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <i className="fas fa-user text-indigo-600"></i>
                                        <h4 className="font-semibold text-slate-800">Informations de contact</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-user-circle text-slate-400 text-sm"></i>
                                                <span className="text-sm text-slate-800">{form.fullName || 'Non spécifié'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-envelope text-slate-400 text-sm"></i>
                                                <span className="text-sm text-slate-800">{form.email || 'Non spécifié'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-phone text-slate-400 text-sm"></i>
                                                <span className="text-sm text-slate-800">{form.phone || 'Non spécifié'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-building text-slate-400 text-sm"></i>
                                                <span className="text-sm text-slate-800">{form.establishment || 'Non spécifié'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Cards */}
                                {service === 'unlock' && files.length > 0 && (
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="fas fa-file-pdf text-rose-600"></i>
                                            <h4 className="font-semibold text-slate-800">Documents joints</h4>
                                        </div>
                                        <div className="bg-rose-50 rounded-lg p-3">
                                            <div className="text-sm text-rose-800">{files.length} fichier(s) PDF sélectionné(s)</div>
                                        </div>
                                    </div>
                                )}

                                {form.message && (
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="fas fa-comment text-indigo-600"></i>
                                            <h4 className="font-semibold text-slate-800">{t.message}</h4>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <div className="text-sm text-slate-800 whitespace-pre-line">{form.message}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Status Messages */}
                                {sent === 'ok' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-check text-emerald-600"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-emerald-800">Demande envoyée avec succès</h4>
                                                <p className="text-sm text-emerald-700">{t.sentOk}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {sent === 'fail' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-exclamation-triangle text-amber-600"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-amber-800">Erreur d'envoi</h4>
                                                <p className="text-sm text-amber-700">{t.sentFail}</p>
                                            </div>
                                        </div>
                                    </div>
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
