/**
 * Service pour gérer le manifest des classes et le système de vote
 */

import { logger } from '../utils/logger';
import { ClassInfo, Cycle } from '../types';
import { EmailService, VoteEmailData } from './EmailService';

export interface ManifestClass {
  id: string;
  filename: string;
  name: string;
  subject: string;
  cycle: Cycle;
  teacherName?: string;
  color: string;
  priority?: number;
  description: string;
  features?: string[];
}

export interface LockedClass extends ManifestClass {
  votes: number;
  requiredVotes: number;
}

export interface Manifest {
  version: string;
  lastUpdated: string;
  demoClasses: {
    college: ManifestClass[];
    lycee: ManifestClass[];
    prepa: ManifestClass[];
  };
  lockedClasses: {
    college: LockedClass[];
    lycee: LockedClass[];
    prepa: LockedClass[];
  };
  voting: {
    enabled: boolean;
    adminEmail: string;
    voteThreshold: number;
    cooldownHours: number;
  };
}

export interface Vote {
  classId: string;
  voterName: string;
  voterEmail: string;
  timestamp: string;
  vote: 'yes' | 'no';
}

class ManifestService {
  private manifest: Manifest | null = null;
  private votes: Vote[] = [];
  private readonly VOTES_STORAGE_KEY = 'class_votes_v1';
  private readonly VOTE_COOLDOWN_KEY = 'vote_cooldown_v1';

  /**
   * Charge le manifest depuis le fichier public/manifest.json
   */
  async loadManifest(): Promise<Manifest> {
    if (this.manifest) {
      return this.manifest;
    }

    try {
      const base = (import.meta as any).env?.BASE_URL || '/';
      const response = await fetch(`${base}manifest.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`);
      }

      this.manifest = await response.json();
      logger.info('Manifest loaded successfully');
      
      // Charger les votes depuis le localStorage
      this.loadVotesFromStorage();
      
      return this.manifest;
    } catch (error) {
      logger.error('Failed to load manifest', error);
      throw error;
    }
  }

  /**
   * Obtient les classes de démonstration pour un cycle donné
   */
  async getDemoClasses(cycle: Cycle): Promise<ManifestClass[]> {
    const manifest = await this.loadManifest();
    return manifest.demoClasses[cycle] || [];
  }

  /**
   * Obtient les classes verrouillées pour un cycle donné
   */
  async getLockedClasses(cycle: Cycle): Promise<LockedClass[]> {
    const manifest = await this.loadManifest();
    const lockedClasses = manifest.lockedClasses[cycle] || [];
    
    // Mettre à jour les votes depuis le localStorage
    return lockedClasses.map(lockedClass => ({
      ...lockedClass,
      votes: this.getVoteCount(lockedClass.id)
    }));
  }

  /**
   * Charge les données d'une classe depuis son fichier JSON
   */
  async loadClassData(classInfo: ManifestClass, isDemo: boolean = true): Promise<any> {
    try {
      const base = (import.meta as any).env?.BASE_URL || '/';
      const folder = isDemo ? 'Demo' : 'lockedClasses';
      const response = await fetch(`${base}${folder}/${encodeURIComponent(classInfo.filename)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load class data: ${response.status}`);
      }

      const data = await response.json();
      logger.info(`Class data loaded for ${classInfo.name}`);
      return data;
    } catch (error) {
      logger.error(`Failed to load class data for ${classInfo.name}`, error);
      throw error;
    }
  }

  /**
   * Convertit une ManifestClass en ClassInfo
   */
  manifestClassToClassInfo(manifestClass: ManifestClass): ClassInfo {
    return {
      id: crypto.randomUUID(),
      name: manifestClass.name,
      subject: manifestClass.subject,
      teacherName: manifestClass.teacherName || 'Professeur',
      createdAt: new Date().toISOString(),
      color: manifestClass.color,
      cycle: manifestClass.cycle
    };
  }

  /**
   * Vérifie si un utilisateur peut voter (cooldown)
   */
  canUserVote(email: string): boolean {
    const cooldownData = this.getCooldownData();
    const lastVoteTime = cooldownData[email];
    
    if (!lastVoteTime) {
      return true;
    }

    const cooldownMs = (this.manifest?.voting.cooldownHours || 24) * 60 * 60 * 1000;
    const timeSinceLastVote = Date.now() - new Date(lastVoteTime).getTime();
    
    return timeSinceLastVote >= cooldownMs;
  }

  /**
   * Enregistre un vote
   */
  async submitVote(classId: string, voterName: string, voterEmail: string, vote: 'yes' | 'no'): Promise<boolean> {
    if (!this.canUserVote(voterEmail)) {
      throw new Error('Vous devez attendre avant de voter à nouveau');
    }

    const newVote: Vote = {
      classId,
      voterName,
      voterEmail,
      timestamp: new Date().toISOString(),
      vote
    };

    this.votes.push(newVote);
    this.saveVotesToStorage();
    this.updateCooldown(voterEmail);

    // Vérifier si la classe doit être automatiquement déverrouillée
    if (vote === 'yes' && await this.shouldUnlockClass(classId)) {
      await this.unlockClassAutomatically(classId);
    }

    // Envoyer l'email à l'admin (simulation)
    await this.sendVoteNotificationToAdmin(newVote);

    logger.info(`Vote submitted for class ${classId} by ${voterEmail}`);
    return true;
  }

  /**
   * Obtient le nombre de votes "oui" pour une classe
   */
  getVoteCount(classId: string): number {
    const userVotes = this.votes.filter(vote => vote.classId === classId && vote.vote === 'yes').length;
    const baseVotes = this.getBaseVotesForClass(classId);
    return baseVotes + userVotes;
  }

  /**
   * Génère des votes de base pour encourager les utilisateurs (120-200 votes)
   */
  private getBaseVotesForClass(classId: string): number {
    // Utiliser l'ID de la classe comme seed pour avoir toujours le même nombre
    const seed = this.hashCode(classId);
    const min = 120;
    const max = 200;
    return min + (Math.abs(seed) % (max - min + 1));
  }

  /**
   * Fonction de hash simple pour générer un seed basé sur l'ID
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }



  /**
   * Vérifie si une classe doit être déverrouillée
   */
  async shouldUnlockClass(classId: string): Promise<boolean> {
    const manifest = await this.loadManifest();
    const voteCount = this.getVoteCount(classId);
    return voteCount >= manifest.voting.voteThreshold;
  }

  /**
   * Transforme automatiquement une classe verrouillée en classe déverrouillée
   */
  async unlockClassAutomatically(classId: string): Promise<boolean> {
    try {
      const manifest = await this.loadManifest();
      const lockedClass = this.findLockedClassById(classId);
      
      if (!lockedClass || !await this.shouldUnlockClass(classId)) {
        return false;
      }

      // Créer une nouvelle classe déverrouillée basée sur la classe verrouillée
      const unlockedClass = this.manifestClassToClassInfo(lockedClass);
      
      // Charger les données de la classe depuis le fichier JSON
      const classData = await this.loadClassData(lockedClass, false);
      
      // Sauvegarder comme nouvelle classe utilisateur
      const classKey = `classData_v1_${unlockedClass.id}`;
      localStorage.setItem(classKey, JSON.stringify(classData));
      
      // Ajouter à la liste des classes utilisateur
      const existingClasses = JSON.parse(localStorage.getItem('classManager_v1') || '[]');
      existingClasses.push(unlockedClass);
      localStorage.setItem('classManager_v1', JSON.stringify(existingClasses));
      
      logger.info(`Class ${classId} automatically unlocked and added to user classes`);
      return true;
    } catch (error) {
      logger.error('Failed to automatically unlock class', error);
      return false;
    }
  }

  /**
   * Trouve une classe verrouillée par son ID
   */
  private findLockedClassById(classId: string): LockedClass | null {
    if (!this.manifest) return null;
    
    for (const cycle of Object.values(this.manifest.lockedClasses)) {
      const found = cycle.find(lc => lc.id === classId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Obtient les statistiques de vote pour une classe
   */
  getVoteStats(classId: string): { yes: number; no: number; total: number } {
    const classVotes = this.votes.filter(vote => vote.classId === classId);
    const yes = classVotes.filter(vote => vote.vote === 'yes').length;
    const no = classVotes.filter(vote => vote.vote === 'no').length;
    
    return { yes, no, total: yes + no };
  }

  /**
   * Obtient toutes les classes verrouillées avec leurs statistiques de vote
   */
  getAllLockedClassesWithVotes(): Array<{
    id: string;
    name: string;
    subject: string;
    cycle: Cycle;
    votes: number;
    requiredVotes: number;
    percentage: number;
  }> {
    const result: Array<{
      id: string;
      name: string;
      subject: string;
      cycle: Cycle;
      votes: number;
      requiredVotes: number;
      percentage: number;
    }> = [];

    // Ajouter uniquement les classes verrouillées
    if (this.manifest) {
      Object.entries(this.manifest.lockedClasses).forEach(([cycle, classes]) => {
        classes.forEach(lockedClass => {
          const votes = this.getVoteCount(lockedClass.id);
          result.push({
            id: lockedClass.id,
            name: lockedClass.name,
            subject: lockedClass.subject,
            cycle: cycle as Cycle,
            votes,
            requiredVotes: lockedClass.requiredVotes,
            percentage: Math.min((votes / lockedClass.requiredVotes) * 100, 100)
          });
        });
      });
    }

    return result.sort((a, b) => b.votes - a.votes);
  }

  /**
   * Charge les votes depuis le localStorage
   */
  private loadVotesFromStorage(): void {
    try {
      const storedVotes = localStorage.getItem(this.VOTES_STORAGE_KEY);
      if (storedVotes) {
        this.votes = JSON.parse(storedVotes);
      }
    } catch (error) {
      logger.error('Failed to load votes from storage', error);
      this.votes = [];
    }
  }

  /**
   * Sauvegarde les votes dans le localStorage
   */
  private saveVotesToStorage(): void {
    try {
      localStorage.setItem(this.VOTES_STORAGE_KEY, JSON.stringify(this.votes));
    } catch (error) {
      logger.error('Failed to save votes to storage', error);
    }
  }

  /**
   * Obtient les données de cooldown
   */
  private getCooldownData(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.VOTE_COOLDOWN_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Met à jour le cooldown pour un utilisateur
   */
  private updateCooldown(email: string): void {
    try {
      const cooldownData = this.getCooldownData();
      cooldownData[email] = new Date().toISOString();
      localStorage.setItem(this.VOTE_COOLDOWN_KEY, JSON.stringify(cooldownData));
    } catch (error) {
      logger.error('Failed to update cooldown', error);
    }
  }

  /**
   * Envoie une notification complète à l'admin avec statistiques
   */
  private async sendVoteNotificationToAdmin(vote: Vote): Promise<void> {
    try {
      // Récupérer les informations de la classe
      const lockedClass = this.findLockedClassById(vote.classId);
      if (!lockedClass) {
        logger.error('Classe verrouillée introuvable pour le vote', { classId: vote.classId });
        return;
      }

      // Calculer les statistiques actuelles
      const totalVotes = this.getVoteCount(vote.classId);
      const stats = this.getVoteStats(vote.classId);
      const progressPercentage = Math.min((totalVotes / lockedClass.requiredVotes) * 100, 100);
      const remainingVotes = Math.max(lockedClass.requiredVotes - totalVotes, 0);

      // Préparer les données pour l'email
      const emailData: VoteEmailData = {
        vote,
        lockedClass,
        currentStats: {
          totalVotes,
          yesVotes: totalVotes,
          noVotes: stats.no,
          progressPercentage,
          remainingVotes
        }
      };

      // Envoyer l'email via le service EmailService
      const emailSent = await EmailService.sendVoteNotification(emailData);
      
      if (emailSent) {
        logger.info('Notification email envoyée avec succès', { 
          classId: vote.classId, 
          voterEmail: vote.voterEmail 
        });
      } else {
        logger.warn('Échec de l\'envoi de l\'email de notification', { 
          classId: vote.classId 
        });
      }
      
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification admin', error);
    }
  }
}

// Instance singleton
export const manifestService = new ManifestService();
export default manifestService;