import { TopLevelItem } from './types';

export const TYPE_MAP: { [key: string]: string } = {
  'definition': 'définition', 'définition': 'définition',
  'theorem': 'théorème', 'théorème': 'théorème', 'theoreme': 'théorème',
  'proposition': 'proposition', 'prop': 'proposition',
  'lemma': 'lemme', 'lemme': 'lemme',
  'corollary': 'corollaire', 'corollaire': 'corollaire', 'corol': 'corollaire',
  'remark': 'remarque', 'remarque': 'remarque', 'rem': 'remarque',
  'proof': 'preuve', 'preuve': 'preuve',
  'example': 'exemple', 'exemple': 'exemple', 'ex': 'exemple',
  'exercise': 'exercice', 'exercice': 'exercice', 'exo': 'exercice',
  'activity': 'activité', 'activité': 'activité', 'activite': 'activité', 'act': 'activité',
  'application': 'application', 'app': 'application'
};

export const BADGE_TEXT_MAP: { [key: string]: string } = {
  'définition': 'Déf.',
  'théorème': 'Th.',
  'proposition': 'Prop.',
  'lemme': 'Lem.',
  'corollaire': 'Cor.',
  'remarque': 'Rem.',
  'preuve': 'Prv.',
  'exemple': 'Ex.',
  'exercice': 'Exo.',
  'activité': 'Act.',
  'application': 'Appli.'
};

export const BADGE_COLOR_MAP: { [key: string]: string } = {
    'activité': 'bg-sky-200 text-sky-800', 
    'définition': 'bg-emerald-100 text-emerald-800', 
    'théorème': 'bg-amber-100 text-amber-800',
    'proposition': 'bg-indigo-100 text-indigo-800', 
    'lemme': 'bg-purple-100 text-purple-800', 
    'corollaire': 'bg-yellow-100 text-yellow-800',
    'remarque': 'bg-slate-200 text-slate-800', 
    'preuve': 'bg-slate-200 text-slate-700', 
    'exemple': 'bg-teal-100 text-teal-800',
    'exercice': 'bg-orange-100 text-orange-800', 
    'application': 'bg-cyan-100 text-cyan-800',
};

export const BADGE_TOOLTIP_MAP: { [key: string]: string } = {
  'activité': 'Activité',
  'définition': 'Définition',
  'théorème': 'Théorème',
  'proposition': 'Proposition',
  'lemme': 'Lemme',
  'corollaire': 'Corollaire',
  'remarque': 'Remarque',
  'preuve': 'Preuve',
  'exemple': 'Exemple',
  'exercice': 'Exercice',
  'application': "Exercice d'application",
};

// Mapping for subject names to concise badge text
export const SUBJECT_ABBREV_MAP: Record<string, string> = {
  'Mathématiques': 'Maths',
  'Physique': 'Phys.',
  'Économie': 'Écon.',
  'Français': 'Fr.',
  'SVT': 'SVT',
  'Sciences de la Vie': 'SVT',
  'Sciences de la Vie et de la Terre': 'SVT',
};

// Unified band color per subject (used to color the card border/ring)
// Note: use lowercase normalized keys without accents for robust matching
export const SUBJECT_BAND_CLASS_MAP: Record<string, string> = {
  // FR subjects
  'mathematiques': 'border-teal-500 ring-2 ring-inset ring-teal-100',
  'maths': 'border-teal-500 ring-2 ring-inset ring-teal-100',
  'physique': 'border-indigo-500 ring-2 ring-inset ring-indigo-100',
  'physique-chimie': 'border-blue-500 ring-2 ring-inset ring-blue-100',
  'francais': 'border-rose-500 ring-2 ring-inset ring-rose-100',
  'economie': 'border-amber-500 ring-2 ring-inset ring-amber-100',
  'svt': 'border-emerald-500 ring-2 ring-inset ring-emerald-100',
  'sciences de la vie': 'border-emerald-500 ring-2 ring-inset ring-emerald-100',
  'sciences de la vie et de la terre': 'border-emerald-500 ring-2 ring-inset ring-emerald-100',
  'informatique': 'border-cyan-500 ring-2 ring-inset ring-cyan-100',
  'lettres': 'border-fuchsia-500 ring-2 ring-inset ring-fuchsia-100',
  // AR subjects
  'الرياضيات': 'border-teal-500 ring-2 ring-inset ring-teal-100',
  'علوم فيزيائية': 'border-indigo-500 ring-2 ring-inset ring-indigo-100',
  'اللغة العربية': 'border-rose-500 ring-2 ring-inset ring-rose-100',
  'علوم الحياة والأرض': 'border-emerald-500 ring-2 ring-inset ring-emerald-100',
};

export function getSubjectBandClass(subject: string | undefined | null): string {
  if (!subject) return 'border-slate-300 ring-2 ring-inset ring-slate-100';
  const norm = subject
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .trim();
  if (SUBJECT_BAND_CLASS_MAP[norm]) return SUBJECT_BAND_CLASS_MAP[norm];
  const abbr = SUBJECT_ABBREV_MAP[subject];
  if (abbr) {
    const abbrKey = abbr.toLowerCase();
    if (SUBJECT_BAND_CLASS_MAP[abbrKey]) return SUBJECT_BAND_CLASS_MAP[abbrKey];
  }
  return 'border-slate-300 ring-2 ring-inset ring-slate-100';
}

// FIX: Changed type from `{[key: string]: ...}` to `Record<TopLevelItem['type'], ...>`.
// The previous weak key type (`string`) caused `keyof typeof` to resolve to `string | number`,
// which broke type narrowing for discriminated unions in `App.tsx`. This change ensures
// the keys are correctly typed, fixing errors related to `NewContentContext`.
export const TOP_LEVEL_TYPE_CONFIG: Record<TopLevelItem['type'], { name: string; icon: string; color: string; badgeColor?: string; }> = {
    'chapter': { name: 'Chapitre', icon: 'fas fa-book', color: 'text-red-700' },
    'evaluation_diagnostic': { name: 'Évaluation diagnostique', icon: 'fas fa-vial', color: 'text-purple-700', badgeColor: 'bg-purple-100 text-purple-800' },
    'devoir_maison': { name: 'Devoir maison', icon: 'fas fa-home', color: 'text-blue-700', badgeColor: 'bg-blue-100 text-blue-800' },
    'controle_continu': { name: 'Contrôle continu', icon: 'fas fa-file-signature', color: 'text-green-700', badgeColor: 'bg-green-100 text-green-800' },
    'correction_devoir_maison': { name: 'Correction Devoir maison', icon: 'fas fa-check-double', color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-800' },
    'correction_controle_continu': { name: 'Correction Contrôle continu', icon: 'fas fa-check-square', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-800' },
};


export const GUIDE_MARKDOWN = `# Aide - Cahier de Textes Interactif

Bienvenue dans le guide du Cahier de Textes Interactif ! Voici un aperçu des fonctionnalités clés pour vous aider à démarrer.

Voir l'aide complète bilingue dans la fenêtre: Aide | مساعدة.
`;

// Aide complète en Français
export const GUIDE_FR = `# Aide complète – Cahier de Textes Interactif

Bienvenue ! Ce guide pratique explique chaque bouton, badge, menu et écran de l'application.

## Vos avantages en bref
✅ Gestion flexible et moderne de votre cahier de textes.
✅ Interface intelligente et fluide pour une expérience utilisateur optimale.
✅ Organisation fine par chapitres, sections et éléments pédagogiques.
✅ Ajout rapide des activités, exercices, exemples et évaluations.
✅ Rendu d'impression de haute qualité.
✅ Recherche instantanée dans tout le contenu (par mot, date ou numéro).
✅ Sauvegarde automatique fiable + sauvegarde manuelle à la demande.
✅ Impression soignée, prête pour le format papier.
💡 Astuces et notifications pour rester efficace au quotidien.

## Démarrage rapide (checklist)
☐ Créer une classe depuis le Tableau de bord ➜ renseignez Nom, Matière et validez.
☐ Ouvrir la classe et configurer vos informations (nom d’enseignant, établissement).
☐ Créer un premier Chapitre, puis ajouter une Section (A, B…).
☐ Insérer des Éléments pédagogiques: Définition, Théorème, Exemple, Exercice, Activité…
☐ Utiliser la Recherche pour retrouver vite un item (mot-clé, date 2025-09-06, numéro).
☐ Laisser la Sauvegarde automatique faire son travail ou cliquer sur « Sauvegarder ».
☐ Exporter la classe (fichier de sauvegarde) pour conserver une copie; Importer un fichier pour restaurer.
☐ Imprimer quand tout est prêt pour un rendu propre et lisible.

## Conseils productivité
⚡ Travaillez par blocs: créez d’abord les chapitres, puis les sections, puis les éléments.
🔎 Utilisez la recherche contextuelle pour filtrer instantanément le tableau.
⌨️ Mémorisez 3 raccourcis: Annuler (Ctrl+Z), Rechercher (/), Enregistrer (clic icône).
🖨️ Avant d’imprimer, jetez un œil aux Options d’impression dans la Configuration.
💾 Pensez à sauvegarder régulièrement votre classe ou toute l’application (fichier).
🛡️ Lors d’une restauration, utilisez un fichier exporté depuis l’application pour éviter les erreurs.

## Aperçu de l'interface

### En-tête (page Éditeur)
- <i class="fas fa-arrow-left"></i> Retour: revient au Tableau de bord.
- Nom de la classe: éditable en cliquant dessus (Entrez pour valider, Échap pour annuler).
- Enseignant: mis à jour via la configuration ou directement.

### Barre d'outils (haut de l'Éditeur)
- <i class="fas fa-undo"></i> Annuler (Ctrl+Z): annule votre dernière action.
- <i class="fas fa-redo"></i> Rétablir (Ctrl+Y): rétablit l'action annulée.
- <i class="fas fa-save"></i> Sauvegarder: force l'enregistrement immédiat. L’application sauvegarde aussi automatiquement après une pause de frappe.
- <i class="fas fa-search"></i> Rechercher (/ ou Ctrl+K/Ctrl+F): ouvre une barre de recherche. Tapez un mot, une date (ex: 2025-09-06) ou un numéro; l’affichage se filtre en temps réel. Échap pour fermer.
- <i class="fas fa-question-circle"></i> Aide: accessible via le menu … (élément « Aide »).
- <i class="fas fa-ellipsis-v"></i> Plus d’actions:
  - <i class="fas fa-file-import"></i> Importer un fichier (restaurer) : choisissez un fichier de sauvegarde pour l’ajouter (ajouter à la suite) ou remplacer.
  - <i class="fas fa-file-export"></i> Exporter la classe (sauvegarder) : télécharge un fichier de sauvegarde de la classe.
  - <i class="fas fa-edit"></i> Gérer mes leçons: réorganise/supprime les contenus principaux (chapitres, devoirs, évaluations) par glisser-déposer.
  - <i class="fas fa-print"></i> Imprimer: active un rendu prêt à l’impression; utilisez l’aperçu avant impression de votre navigateur.
  - <i class="fas fa-question-circle"></i> Aide: ouvre ce guide.

## Tableau de bord
- Carte de classe: affiche le nom de la classe et la dernière date modifiée. Clic pour ouvrir.
- <i class="fas fa-times"></i> Supprimer (survol de la carte): supprime la classe après confirmation.
- Créer une classe: grand cadre “+”; renseignez Nom et Matière. Le nom de l’enseignant par défaut vient de la Configuration.
- <i class="fas fa-cog"></i> Configuration:
  - Informations Générales: Nom de l’établissement, Nom de l’enseignant par défaut.
  - Descriptions affichées: interface moderne et intelligente avec deux contextes distincts
    - Application (écran): mode (Tout / Aucune / Sélection) + sélection par badges authentiques
    - Impression (PDF): mode (Tout / Aucune / Sélection) + sélection par badges authentiques
    - Actions rapides: Tout sélectionner / Tout désélectionner par contexte
    - Sections repliables pour une navigation fluide; design responsive mobile/desktop
  - Gestion des données: Exporter tout / Importer une sauvegarde (toutes les classes + réglages).
- <i class="fas fa-question-circle"></i> Aide: bouton en haut à droite à côté de Configuration.

## Édition du cahier de textes

### Structure et types
- Contenus principaux: Chapitre, Évaluation diagnostique, Devoir maison, Contrôle continu, Correction DM/CC.
- Niveaux: Section (A, B, …), Sous-section (1, 2, …), Sous-sous-section (i, ii, …), Éléments (définition, théorème, ex., exo., …).

### Colonnes du tableau (mode écran)
- Date: cliquez pour éditer; actions rapides sur survol: <i class="fas fa-calendar-day"></i> Aujourd’hui, <i class="fas fa-times-circle"></i> Effacer.
- Contenu: affichage structuré; double-clic pour renommer titres; double-clic sur cellules pour éditer textes.
- Remarque: zone libre éditable (double-clic).

### Actions par ligne (survol à droite)
- <i class="fas fa-plus"></i> Ajouter après: ouvre “Ajouter du contenu”.
- <i class="fas fa-pencil-alt"></i> Modifier: édition rapide en ligne (affiché pour les éléments).
- <i class="fas fa-trash-alt"></i> Supprimer: supprime la ligne et son contenu.

### Ajouter du contenu (fenêtre)
Sélectionnez le type:
- Contenus principaux: Chapitre / Évaluations / Devoirs / Corrections.
- Section: active si vous avez sélectionné un chapitre/évaluation.
- Élément: activé dans une section/chapitre; champs Type, Numéro, Titre, Description.
- Séparateur: insère une ligne de séparation juste après l’élément sélectionné, avec texte et date optionnelle.

Règles d’insertion utiles:
- Depuis une ligne “chapitre/évaluation”: “Chapitre” crée un nouveau chapitre après; les autres types peuvent s’intégrer comme blocs ou être ajoutés au niveau principal selon le type.
- Depuis une section/sous-section: “Élément” s’ajoute à l’intérieur; “Séparateur” s’insère après l’élément ciblé.

### Badges des éléments (types et couleurs)
- Déf. (Définition): vert clair
- Th. (Théorème): ambre
- Prop. (Proposition): indigo
- Lem. (Lemme): violet
- Cor. (Corollaire): jaune
- Rem. (Remarque): gris
- Prv. (Preuve): gris
- Ex. (Exemple): sarcelle
- Exo. (Exercice): orange
- Act. (Activité): bleu ciel
- Appli. (Application): cyan

Astuce: certains types (exemple, exercice, application) affichent le titre en ligne avec la description pour une lecture compacte.

### Séparateurs
- Ligne horizontale avec texte centré; date modifiable; <i class="fas fa-trash-alt"></i> pour supprimer.

### Impression
- Via “Imprimer” dans le menu; les chapitres et évaluations sont centrés, formules MathJax rendues; activez/masquez les descriptions via la Configuration.

### Descriptions visuelles (écran et impression)
- Écran (Application): l’affichage des descriptions suit votre réglage « Descriptions affichées ».
  - Mode « Tout »: toutes les descriptions sont visibles sous leurs titres, avec badges de type.
  - Mode « Aucune »: seules les en-têtes/titres s’affichent; les descriptions sont masquées.
  - Mode « Sélection »: seules les descriptions des types choisis (via badges authentiques) sont visibles.
- Impression (PDF): même principe via le contexte “Impression” dans la Configuration.
- Lisibilité: style compact et aéré, compatible MathJax; badges colorés pour repérer rapidement les types.
- Séparateurs: apportent une respiration visuelle entre blocs et dates.

## Recherche et raccourcis
- Ouvrir/fermer recherche: /, Ctrl+K, Ctrl+F / Échap.
- Annuler/Rétablir: Ctrl+Z / Ctrl+Y.
- Sauvegarde: auto après 1,5 s d’inactivité; bouton “<i class="fas fa-save"></i>” pour forcer.

## Données et sauvegardes
- Stockage local: vos classes et contenus sont enregistrés dans le navigateur (localStorage).
- Exporter la classe (sauvegarde de la classe courante): via Plus d’actions.
- Importer une classe (depuis un fichier): ouvrez une sauvegarde; choisissez Remplacer ou Ajouter à la suite.
- Sauvegarder/Restaurer toute l’application (toutes classes + réglages): depuis la Configuration.

## Notifications
Des bulles colorées confirment les actions: succès, info, erreur, etc.

## Dépannage
- Rien ne s’affiche: vérifiez que la classe contient des éléments; utilisez “Créer un chapitre” si vide.
- Icônes d’aide/infobulles absentes: recharger la page peut réinitialiser l’initialisation des infobulles.
- Fichier non valide à l’import: vérifiez que le fichier provient de l’application (non modifié).

## À propos
Créé par Boudouh Abdelmalek (Maroc). Contact: [bdh.malek@gmail.com](mailto:bdh.malek@gmail.com).
`;

// دليل كامل بالعربية
export const GUIDE_AR = `# مساعدة شاملة – دفتر النصوص التفاعلي

أهلاً بك! هذا الدليل يشرح باختصار ووضوح كل زر وشارة وقائمة وواجهة في التطبيق.
يوفّر "دفتر النصوص" الرقمي بيئة متكاملة لإعداد الدروس، تنظيم الفصول والأقسام، إضافة الأنشطة والتمارين، البحث السريع، الحفظ التلقائي، والطباعة الجاهزة. حلول ذكية تساعد الأستاذ على تنظيم العمل وتوفير الوقت وتحسين المردودية.

## المزايا باختصار
✅ إدارة مرنة وحديثة لدفتر النصوص.
✅ واجهة ذكية وسلسة لتجربة مستخدم مثالية.
✅ تنظيم هرمي واضح: فصول، أقسام، عناصر تعليمية.
✅ إضافة سريعة للأنشطة، التمارين، الأمثلة والتقييمات.
✅ طباعة عالية الجودة (جاهزة لـ PDF).
✅ بحث فوري في كل المحتوى (كلمة، تاريخ، رقم).
✅ حفظ تلقائي موثوق + حفظ يدوي عند الحاجة.
💡 تنبيهات ونصائح عملية لرفع الإنتاجية.

## بداية سريعة (قائمة تحقق)
☐ أنشئ فصلاً/قسماً جديداً من لوحة التحكم ➜ أدخل الاسم والمادة ثم أكد.
☐ افتح الفصل واضبط المعلومات (اسم الأستاذ، المؤسسة) من الإعدادات.
☐ أنشئ فصلاً رئيسياً ثم أضف أقساماً (A، B…) بحسب حاجتك.
☐ أضف عناصر تعليمية: تعريف، نظرية، مثال، تمرين، نشاط…
☐ استخدم البحث للوصول السريع (كلمة مفتاحية، تاريخ 2025-09-06، رقم).
☐ اترك الحفظ التلقائي يعمل، أو اضغط حفظ للحفظ الفوري.
☐ صدّر JSON للاحتفاظ بنسخة؛ واستورد عند الحاجة للاسترجاع.
☐ اطبع عند اكتمال المحتوى للحصول على نسخة ورقية أنيقة.

## نصائح لرفع الإنتاجية
⚡ اعمل على مراحل: فصول ➜ أقسام ➜ عناصر، لتحكم أوضح وتدفق أسرع.
🔎 استفد من البحث الفوري لتصفية الجدول فوراً أثناء الكتابة.
⌨️ ثلاثة اختصارات مهمّة: تراجع (Ctrl+Z)، بحث (/)، حفظ (زر الحفظ).
🖨️ قبل الطباعة، راجع "الأوصاف المعروضة" في الإعدادات.
💾 احرص على التصدير المنتظم لنسخ احتياطية.
🛡️ عند الاستيراد، تأكد من صحة صيغة JSON لتفادي الأخطاء.

## نظرة عامة على الواجهة

### الرأس (في محرر الدفتر)
- <i class="fas fa-arrow-left"></i> رجوع: العودة إلى لوحة التحكم.
- اسم الفصل/القسم: قابل للتحرير بالنقر عليه (إدخال للحفظ، هروب للإلغاء).
- اسم الأستاذ: يتم تحديثه من الإعدادات أو يدوياً.

### شريط الأدوات
- <i class="fas fa-undo"></i> تراجع (Ctrl+Z).
- <i class="fas fa-redo"></i> إعادة (Ctrl+Y).
- <i class="fas fa-save"></i> حفظ: حفظ فوري؛ كما يتم الحفظ تلقائياً بعد التوقف القصير عن الكتابة.
- <i class="fas fa-search"></i> بحث (/ أو Ctrl+K/Ctrl+F): اكتب كلمة أو تاريخاً (مثال: 2025-09-06) أو رقماً لتصفية المحتوى فورياً. هروب لإغلاق.
- <i class="fas fa-question-circle"></i> مساعدة: من قائمة … داخل الشريط (عنصر « مساعدة »).
- <i class="fas fa-ellipsis-v"></i> المزيد:
  - <i class="fas fa-file-import"></i> استيراد JSON: اختر ملفاً أو ألصق المحتوى، ثم اختر الاستبدال أو الإضافة.
  - <i class="fas fa-file-export"></i> تصدير JSON: تنزيل ملف .json للفصل الحالي.
  - <i class="fas fa-edit"></i> إدارة الدروس: إعادة ترتيب/حذف المحتويات الرئيسية بالسحب والإفلات.
  - <i class="fas fa-print"></i> طباعة: عرض خاص للطباعة عبر المتصفح.

## لوحة التحكم
- بطاقة الفصل: اسم الفصل وتاريخ آخر تعديل؛ انقر للفتح.
- <i class="fas fa-times"></i> حذف (يظهر عند المرور): حذف الفصل بعد التأكيد.
- إنشاء فصل جديد: بطاقة كبيرة بعلامة +؛ أدخل الاسم والمادة. اسم الأستاذ الافتراضي من الإعدادات.
- <i class="fas fa-cog"></i> الإعدادات:
  - معلومات عامة: اسم المؤسسة، اسم الأستاذ الافتراضي.
  - الأوصاف المعروضة (واجهة جديدة وذكية):
    - الشاشة (التطبيق): الوضع (الكل / لا شيء / تحديد) + اختيار حسب النوع عبر الشارات الأصلية.
    - الطباعة (PDF): الوضع (الكل / لا شيء / تحديد) + اختيار حسب النوع عبر الشارات الأصلية.
    - إجراءات سريعة: تحديد الكل / إلغاء التحديد لكل سياق.
    - أقسام قابلة للطي وتصميم متجاوب للشاشات المختلفة.
  - إدارة البيانات: تصدير الكل / استيراد نسخة احتياطية (جميع الفصول + الإعدادات).
- <i class="fas fa-question-circle"></i> مساعدة: زر ظاهر أعلى اليمين بجوار الإعدادات.

## تحرير دفتر النصوص

### البنية والأنواع
- المحتويات الرئيسية: فصل، تقييم تشخيصي، فرض منزلي، مراقبة مستمرة، تصحيح الفرض/المراقبة.
- المستويات: قسم (A، B…) ثم فرع (1، 2…) ثم فرع فرعي (i، ii…) ثم العناصر (تعريف، نظرية، مثال، تمرين…).

### أعمدة الجدول (وضع الشاشة)
- التاريخ: انقر للتحرير؛ عند المرور تظهر أيقونات سريعة: <i class="fas fa-calendar-day"></i> اليوم، <i class="fas fa-times-circle"></i> مسح.
- المحتوى: عناوين قابلة للتحرير بالنقر المزدوج؛ خلايا النص قابلة للتحرير كذلك.
- الملاحظة: حقل حر قابل للتحرير.

### أزرار كل سطر (عند المرور يميناً)
- <i class="fas fa-plus"></i> إضافة بعد: يفتح نافذة إضافة المحتوى.
- <i class="fas fa-pencil-alt"></i> تعديل: تحرير سريع للعناصر.
- <i class="fas fa-trash-alt"></i> حذف: حذف السطر ومحتواه.

### إضافة المحتوى
اختر النوع:
- محتوى رئيسي: فصل / تقييمات / فروض / تصحيحات.
- قسم: متاح إذا كان السطر المحدد فصلًا/تقييماً.
- عنصر: متاح داخل قسم/فصل؛ يحتوي على النوع، الرقم، العنوان، الوصف.
- فاصل: خط فاصل مع نص وتاريخ اختياري يوضع بعد السطر المحدد.

قواعد مفيدة:
- من سطر فصل/تقييم: اختيار "فصل" ينشئ فصلاً بعده مباشرة. الأنواع الأخرى قد تُدمج ككتل داخلية أو كعناصر رئيسية حسب السياق.
- من داخل قسم/فرع: "عنصر" يُضاف داخلياً؛ "فاصل" يُدرج بعد العنصر.

### الشارات (أنواع العناصر وألوانها)
- تعريف: أخضر فاتح (Def.)
- نظرية: كهرماني (Th.)
- مقترح: نيلي (Prop.)
- لمّة: بنفسجي (Lem.)
- نتيجة تابعة: أصفر (Cor.)
- ملاحظة: رمادي (Rem.)
- برهان: رمادي (Prv.)
- مثال: فيروزي (Ex.)
- تمرين: برتقالي (Exo.)
- نشاط: أزرق سماوي (Act.)
- تطبيق: سماوي (Appli.)

معلومة: بعض الأنواع (مثال/تمرين/تطبيق) تعرض العنوان والخلاصة في سطر واحد لتسهيل القراءة.

### الفواصل
- خط أفقي بنص متوسط؛ يمكن تعديل التاريخ؛ حذف عبر <i class="fas fa-trash-alt"></i>.

### الطباعة
- افتح "طباعة": معاينة جاهزة لـ A4.
- إن احتجت تفاصيل أكثر، استخدم "الأوصاف المعروضة" في الإعدادات لضبط ظهور الوصف عند الطباعة (الكل / لا شيء / تحديد حسب النوع).
- في نافذة المتصفح: الوجهة = حفظ كـ PDF؛ الحجم = A4؛ الرؤوس/التذييلات = معطلة؛ المقياس = 100%.

### الأوصاف المرئية (الشاشة والطباعة)
- الشاشة (التطبيق): يتبع عرض الأوصاف إعدادك في "الأوصاف المعروضة".
  - وضع "الكل": كل الأوصاف مرئية تحت عناوينها مع شارات النوع.
  - وضع "لا شيء": تظهر العناوين فقط بدون الأوصاف.
  - وضع "تحديد": تظهر أوصاف الأنواع المختارة فقط (عبر الشارات الأصلية).
- الطباعة (PDF): نفس المبدأ عبر سياق "الطباعة" داخل الإعدادات.
- القابلية للقراءة: أسلوب مدمج ومتوازن متوافق مع MathJax؛ شارات ملوّنة لتحديد الأنواع سريعاً.
- الفواصل: تمنح فواصل بصرية بين الكتل والتواريخ.

## البحث والاختصارات
- فتح/إغلاق البحث: /، Ctrl+K، Ctrl+F / هروب.
- تراجع/إعادة: Ctrl+Z / Ctrl+Y.
- الحفظ: تلقائي بعد 1.5 ثانية؛ زر الحفظ للحفظ الفوري.

## البيانات والنسخ الاحتياطي
- التخزين محلياً في المتصفح (localStorage).
- تصدير/استيراد JSON للفصل الحالي من قائمة المزيد.
- تصدير/استيراد المنصة (كل الفصول + الإعدادات) من "الإعدادات".

## التنبيهات
رسائل صغيرة ملوّنة تؤكد عملياتك: نجاح، معلومات، خطأ، إلخ.

## حل المشاكل
- لا يظهر شيء: أضف فصلاً جديداً عبر "إنشاء فصل" إن كان فارغاً.
- غياب التلميحات: أعد تحميل الصفحة.
- خطأ في JSON: تحقق من صحة الصياغة قبل الاستيراد.

## عن التطبيق
تم التطوير بواسطة بودوح عبد المالك (المغرب). تواصل: [bdh.malek@gmail.com](mailto:bdh.malek@gmail.com).
`;