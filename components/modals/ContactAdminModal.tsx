import React, { useEffect, useMemo, useState } from 'react';

interface ContactAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPremium?: { name: string; subject: string } | null;
}

type Step = 1 | 2 | 3;

const SERVICE_OPTIONS = [
    { id: 'unlock', labelFr: 'Envoyer mes cours pour traitement', labelAr: 'أرسل دروسي لمعالجتها' },
    { id: 'bundle', labelFr: 'Accès à plusieurs classes (pack)', labelAr: 'ولوج عدة أقسام (باقة)' },
] as const;

type Lang = 'fr' | 'ar';

const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose, selectedPremium }) => {
    const [step, setStep] = useState<Step>(1);
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
                placeholderMessage: 'Écrivez votre demande ici…',
                sentOk: "Votre demande a été envoyée. Elle sera traitée au plus tard sous 24h et le fichier sera envoyé à l'adresse email que vous avez fournie.",
                sentFail: "Échec de l'envoi. Essayez à nouveau ou utilisez votre email.",
                help: 'Aide',
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
                placeholderMessage: 'اكتب طلبك هنا…',
                sentOk: 'تم إرسال طلبك. سيتم معالجته في غضون 24 ساعة كحد أقصى وسيُرسل الملف إلى بريدك الإلكتروني المدخل.',
                sentFail: 'فشل الإرسال. أعد المحاولة أو استخدم بريدك الإلكتروني.',
                help: 'إيضاحات',
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
            `${lang === 'ar' ? 'الخدمة' : 'Service'}: ${service}`,
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
            const res = await fetch('https://formsubmit.co/ajax/bdh.malek@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: form.fullName,
                    email: form.email || 'no-reply@example.com',
                    subject: lang === 'ar' ? 'طلب الولوج إلى الأقسام المدفوعة' : "Demande d'accès Premium",
                    message: [
                        `${lang === 'ar' ? 'الخدمة' : 'Service'}: ${service}`,
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
                        form.message || '-'
                    ].join('\n')
                })
            });
            if (res.ok) {
                setSent('ok');
            } else {
                setSent('fail');
            }
        } catch {
            setSent('fail');
        } finally {
            setSending(false);
        }
    };

    return (
            <div className="fixed inset-0 bg-slate-900/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-6 touch-manipulation" onClick={resetAndClose}>
                <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-slate-900/5 w-full sm:w-auto sm:max-w-2xl lg:max-w-3xl overflow-hidden ${arClass} animate-slide-in-up ${bodyTextSize}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} dir={dir}>
                {/* Drag handle (mobile) */}
                <div className="sm:hidden w-full flex justify-center pt-2">
                    <div className="w-12 h-1.5 rounded-full bg-slate-300"></div>
                </div>
                {/* Header */}
                    <div className="px-6 py-4 sm:py-5 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-gray-800 min-w-0">
                            <i className="fas fa-unlock text-teal-600 text-lg"></i>
                            <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">{t.modalTitle}</h2>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 p-0.5">
                                <button aria-pressed={lang==='fr'} className={`px-3 h-9 text-xs rounded-full transition-colors ${lang === 'fr' ? 'bg-white text-slate-900 shadow' : 'text-slate-700 hover:text-slate-900'}`} onClick={() => setLang('fr')}>FR</button>
                                <button aria-pressed={lang==='ar'} className={`px-3 h-9 text-xs rounded-full transition-colors ${lang === 'ar' ? 'bg-white text-slate-900 shadow' : 'text-slate-700 hover:text-slate-900'}`} onClick={() => setLang('ar')}>AR</button>
                            </div>
                            <button onClick={resetAndClose} aria-label="Fermer" className="w-10 h-10 rounded-md hover:bg-gray-100 text-gray-500 text-lg">×</button>
                        </div>
                    </div>
                </div>

                {/* Progress indicator */}
                    <div className="px-6 pt-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(step/3)*100}%` }}></div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                        <span className={step===1 ? 'text-indigo-600 font-medium' : ''}>1. {t.step1}</span>
                        <span className={step===2 ? 'text-indigo-600 font-medium' : ''}>2. {t.step2}</span>
                        <span className={step===3 ? 'text-indigo-600 font-medium' : ''}>3. {t.step3}</span>
                    </div>
                </div>

                {/* Body */}
                    <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 max-h-[72vh] sm:max-h-[75vh] overflow-y-auto leading-relaxed overscroll-contain">
                    
                    {/* Help Section */}
                    {showHelp && (
                        <div className="mb-5">
                            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                                        <i className="fas fa-lightbulb text-indigo-600 text-base"></i>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-indigo-900 mb-3 text-base">{t.help}</h4>
                                        <ul className="space-y-3 text-sm sm:text-base text-indigo-800">
                                            {helpContent.map((line, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5"></span>
                                                    <span className="leading-relaxed">{line}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button 
                                        onClick={() => setShowHelp(false)}
                                        className="flex-shrink-0 w-6 h-6 text-indigo-400 hover:text-indigo-600 transition-colors"
                                        aria-label="Fermer l'aide"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                            <div className="space-y-4">
                            <p className="text-base text-slate-700">{t.selectService}</p>
                                <div className="grid grid-cols-1 gap-4">
                                {SERVICE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                            className={`text-left px-5 py-4 rounded-xl border transition-colors ${service === opt.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300' } flex items-center justify-between`}
                                        onClick={() => setService(opt.id)}
                                    >
                                            <div className="text-base font-semibold">{lang === 'fr' ? opt.labelFr : opt.labelAr}</div>
                                            {service === opt.id && <i className="fas fa-check text-indigo-600"></i>}
                                    </button>
                                ))}
                            </div>
                <div className="flex justify-between items-center pt-2 sticky bottom-0 bg-white/95 backdrop-blur safe-bottom pb-4 px-1">
                    <button 
                        onClick={() => setShowHelp(v => !v)} 
                        className="inline-flex items-center gap-2 h-11 sm:h-12 px-4 sm:px-5 rounded-lg border border-slate-300 text-sm sm:text-base text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-600`}></i>
                        <span className="hidden sm:inline">{t.help}</span>
                    </button>
                    <button onClick={() => setStep(2)} className="h-11 sm:h-12 px-5 sm:px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-base shadow-sm">{t.next}</button>
                </div>
                        </div>
                    )}

                    {step === 2 && (
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                                <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className={labelClass}>{t.name}</label>
                                        <input className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                                </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Email</label>
                                            <input type="email" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t.phone}</label>
                                            <input className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>{t.establishment}</label>
                                        <input className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.establishment} onChange={(e) => setForm(f => ({ ...f, establishment: e.target.value }))} />
                                </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>{t.classes}</label>
                                        <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.classesPlaceholder} value={form.className} onChange={(e) => setForm(f => ({ ...f, className: e.target.value }))}></textarea>
                                        {(() => {
                                            const chips = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                                            if (!chips.length) return null;
                                            return (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {chips.map((c, i) => (
                                                        <span key={`${c}-${i}`} className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">{c}</span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t.subject}</label>
                                            <input className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>{t.message}</label>
                                        <textarea rows={5} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.placeholderMessage} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}></textarea>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sticky bottom-0 bg-white/95 backdrop-blur safe-bottom py-3 px-1">
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setStep(1)} className="h-10 px-4 rounded-lg border border-slate-300 text-sm hover:bg-slate-50">{t.back}</button>
                                    <button 
                                        onClick={() => setShowHelp(v => !v)} 
                                        className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-slate-300 text-[12px] text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-600`}></i>
                                        <span className="hidden sm:inline">{t.help}</span>
                                    </button>
                                </div>
                                <button type="submit" className="h-10 sm:h-11 px-4 sm:px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm shadow-sm">{t.next}</button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-700">{t.review}</p>
                            <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                                <div><span className="text-gray-500">{lang === 'ar' ? 'الخدمة' : 'Service'}:</span> {service}</div>
                                <div>
                                    <span className="text-gray-500">{t.classes}:</span>
                                    {(() => {
                                        const list = (form.className || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                                        if (!list.length) return <span> —</span>;
                                        return (
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {list.map((c, i) => (
                                                    <span key={`${c}-${i}`} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">{c}</span>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div><span className="text-gray-500">{t.subject}:</span> {form.subject || '—'}</div>
                                <div><span className="text-gray-500">{t.establishment}:</span> {form.establishment || '—'}</div>
                                <div><span className="text-gray-500">{t.name}:</span> {form.fullName || '—'}</div>
                                <div><span className="text-gray-500">Email:</span> {form.email || '—'}</div>
                                <div><span className="text-gray-500">{t.phone}:</span> {form.phone || '—'}</div>
                                {form.message && <div className="pt-2"><span className="text-gray-500">{t.message}:</span><div className="whitespace-pre-line">{form.message}</div></div>}
                            </div>
                                {sent === 'ok' && (
                                    <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">{t.sentOk}</div>
                                )}
                                {sent === 'fail' && (
                                    <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">{t.sentFail}</div>
                                )}
                                <div className="flex items-center justify-between gap-2 sticky bottom-0 bg-white/95 backdrop-blur safe-bottom py-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setStep(2)} className="h-10 px-4 rounded-lg border border-slate-300 text-sm hover:bg-slate-50">{t.back}</button>
                                        <button 
                                            onClick={() => setShowHelp(v => !v)} 
                                            className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-slate-300 text-[12px] text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                        >
                                            <i className={`fas ${showHelp ? 'fa-eye-slash' : 'fa-circle-info'} text-indigo-600`}></i>
                                            <span className="hidden sm:inline">{t.help}</span>
                                        </button>
                                    </div>
                                    <button disabled={sending} onClick={sent === 'ok' ? resetAndClose : handleSend} className={`h-10 sm:h-11 px-4 sm:px-5 rounded-lg text-white text-sm inline-flex items-center gap-2 ${sent === 'ok' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}`}>
                                        <i className={`fas ${sent === 'ok' ? 'fa-check' : (sending ? 'fa-circle-notch fa-spin' : 'fa-paper-plane')}`}></i>
                                        {sent === 'ok' ? t.finish : t.send}
                                    </button>
                                </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ContactAdminModal;
