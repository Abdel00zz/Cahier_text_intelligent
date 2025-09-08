## Formation vidéo – CAHIER_txt (grand public)

Public visé: enseignants et formateurs souhaitant organiser un cahier de textes numérique, sans prérequis techniques.

Objectifs d’apprentissage
- Comprendre l’interface (Tableau de bord, Éditeur, Impression)
- Créer une classe et configurer l’application
- Ajouter et structurer des contenus (chapitres, sections, items)
- Gérer les dates, remarques et séparateurs
- Rechercher, réorganiser, imprimer et sauvegarder (export/import)

Durée estimée: 25–35 min (découpée en chapitres courts)


## Plan détaillé de la vidéo

### 1) Introduction (1–2 min)
- Qu’est-ce que CAHIER_txt et à quoi ça sert.
- Aperçu rapide: organisation hiérarchique, dates, impression PDF, sauvegarde locale.
- Démonstration express du résultat final (aperçu impression propre et lisible).

Narration clé: « En quelques minutes, vous créez votre classe, saisissez vos séances, puis imprimez un cahier clair et professionnel. »


### 2) Premiers pas et configuration (2–3 min)
- Ouverture de l’application: présentation du Tableau de bord (liste des classes, bouton de création, bouton Configuration). 
- Ouvrir la Configuration: 
	- Établissement (nom affiché sur les impressions)
	- Nom de l’enseignant par défaut
	- Option d’impression: « Afficher les descriptions »
- Sauvegarde automatique locale: vos données restent sur votre appareil (LocalStorage).

Astuce: si vous êtes sur mobile en mode portrait, un petit rappel peut suggérer de passer en paysage pour plus de confort (fermez l’alerte si besoin; elle se réaffiche si vous restez en portrait).


### 3) Créer sa première classe (2–3 min)
- Cliquer « Créer une classe »: saisir Nom de la classe et Matière.
- La classe apparaît en carte; un dernier rappel montre la date de dernière modification si disponible.
- Cliquer sur la classe pour entrer dans l’Éditeur.

Scénario suggéré: « 3e – Mathématiques »


### 4) Découverte de l’Éditeur (3–4 min)
- En-tête: 
	- Nom d’établissement (si défini), Nom de classe (modifiable en cliquant dessus), Nom enseignant.
	- Bouton retour vers le Tableau de bord.
- Barre d’outils (haut):
	- Annuler/Rétablir (Ctrl+Z / Ctrl+Y)
	- Sauvegarder (manuel, en plus de l’auto)
	- Recherche (touche « / » ou Ctrl+K)
	- Menu: Importer un fichier (restaurer), Exporter la classe (sauvegarder), Gérer mes leçons, Imprimer, Aide
- Zone principale (tableau): colonnes Date, Contenu, Remarque.

Note: Le rendu des formules mathématiques est supporté (MathJax) – utile en sciences.


### 5) Ajouter du contenu (5–6 min)
- Cliquer « Ajouter » (bouton +/actions disponibles dans l’interface) pour insérer un élément.
- Types de contenus: 
	- Chapitre/Devoir (top-level), Sections et Items (éléments de séance)
	- Champs: type, numéro, page, titre, description (contenu), remarque
- Saisie de la date: 
	- Ouvrir l’éditeur de date (modal compact et centré)
	- Options rapides: Aujourd’hui, Demain, Effacer
	- Saisie au clavier au format JJ/MM/AAAA
	- Agenda natif (icône calendrier)
	- Les dates sont gérées de manière fiable (pas de décalage de jour)
- Enregistrer l’élément: l’élément apparaît dans le tableau.

Démonstration proposée:
- Créer « Chapitre 1 – Nombres et calculs », puis un item « Exercice d’application » daté du 08/09/2025 avec une remarque courte.


### 6) Réorganiser et structurer (2–3 min)
- « Gérer mes leçons »: réordonner les éléments principaux par glisser-déposer; supprimer si besoin.
- Séparateurs manuels: insérer un séparateur (titre + date) pour segmenter visuellement.
- Astuce: regroupez par date; le tableau affiche automatiquement une ligne de séparation entre dates différentes.


### 7) Rechercher rapidement (1–2 min)
- Ouvrir la recherche (bouton loupe, « / » ou Ctrl+K).
- Filtrer instantanément: titres, descriptions, remarques.
- Refermer la recherche (Échap) et remettre à zéro.


### 8) Impression et export PDF (2–3 min)
- Menu « Imprimer »: aperçu des colonnes (Date, Contenu, Remarque) formatées pour A4.
- Option d’impression « Afficher les descriptions » (depuis Configuration) pour un rendu plus détaillé ou compact.
- Export PDF via le dialogue d’impression du navigateur.


### 9) Sauvegarde, export et import (2–3 min)
- Exporter la classe (fichier de sauvegarde): enregistre les données de la classe en cours sur votre ordinateur.
- Importer une classe depuis un fichier: recharge une sauvegarde dans la classe ouverte.
- Sauvegarder/Restaurer toute l’application (depuis le Tableau de bord):
	- Sauvegarde/restaure la configuration et toutes vos classes dans un seul fichier.
	- Idéal pour transférer vers un autre appareil ou faire une sauvegarde complète.

Conseil: conservez vos sauvegardes dans un dossier « Sauvegardes CAHIER_txt » daté.


### 10) Astuces productivité (1–2 min)
- Raccourcis: Ctrl+Z / Ctrl+Y, « / » ou Ctrl+K pour la recherche.
- Édition inline: certains éléments se modifient directement dans le tableau.
- Mathématiques: entourez vos formules de $...$ pour l’inline ou $$...$$ pour l’affichage.
- Mobile: en portrait, l’alerte d’orientation peut réapparaître si vous restez en portrait; basculez en paysage pour un confort optimal.


### 11) Dépannage rapide (1–2 min)
- La date ne s’applique pas: rouvrez la date, vérifiez le format JJ/MM/AAAA ou utilisez l’agenda.
- Vous voyez un jour de décalage: les dates sont normalisées; ressaisissez au format JJ/MM/AAAA si le fichier importé venait d’une autre source.
- L’alerte d’orientation revient: passez en paysage; elle sert de rappel.
- Import échoue: vérifiez que le JSON correspond au format exporté par l’application.
- Données absentes après rechargement: l’application utilise le stockage local; ne nettoyez pas les données du navigateur si vous voulez les conserver.


## Storyboard (grandes lignes)

1) Ouverture & Pitch (écran Tableau de bord) – 20s
2) Configuration rapide – 60s
3) Création de classe – 60s
4) Tour de l’Éditeur – 2 min
5) Ajout d’un chapitre et d’un item daté – 3 min
6) Réorganisation & séparateurs – 90s
7) Recherche – 60s
8) Impression – 90s
9) Export/Import – 2 min
10) Astuces & Dépannage – 90s


## Script de narration (extraits)

- « Bienvenue dans CAHIER_txt, votre cahier de textes numérique simple et puissant. »
- « Depuis la configuration, définissez votre établissement et votre nom d’enseignant; ces informations apparaîtront sur vos impressions. »
- « Créons notre première classe, puis ajoutons un chapitre et une séance datée. »
- « La recherche intégrée vous permet de retrouver instantanément un contenu. »
- « En un clic, imprimez un document propre et lisible; vous pouvez l’enregistrer en PDF. »
- « Pensez à exporter régulièrement vos données pour une sauvegarde sereine. »


## Annexes pour la vidéo

Rappels visuels à préparer
- Vignettes de touches: Ctrl+Z, Ctrl+Y, /, Ctrl+K, Échap
- Icônes: Config (⚙️), Rechercher (🔎), Imprimer (🖨️), Import/Export (⬇️/⬆️)
- Écran mobile: bascule portrait → paysage

Cas de démonstration
- Classe: « 3e – Mathématiques »
- Chapitre: « Chapitre 1 – Nombres et calculs »
- Item: « Exercice d’application », Date: 08/09/2025, Remarque: « Prévoir calculatrice »

Conseils de tournage
- Zoom UI à 125–150% pour lisibilité
- Découper en chapitres YouTube (timestamps) correspondant au plan
- Terminer par un récapitulatif et un call-to-action (s’abonner, consulter l’aide)

