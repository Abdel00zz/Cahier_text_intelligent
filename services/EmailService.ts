/**
 * Service pour l'envoi d'emails des votes
 */

import { logger } from '../utils/logger';
import { LockedClass, Vote } from './ManifestService';

export interface VoteEmailData {
  vote: Vote;
  lockedClass: LockedClass;
  currentStats: {
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    progressPercentage: number;
    remainingVotes: number;
  };
}

export class EmailService {
  private static readonly ADMIN_EMAIL = 'bdh.malek@gmail.com';
  private static readonly EMAIL_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';
  
  /**
   * Envoie un email de notification de vote à l'administrateur
   */
  static async sendVoteNotification(data: VoteEmailData): Promise<boolean> {
    try {
      const emailContent = this.generateVoteEmailHTML(data);
      
      // Utilisation d'EmailJS pour l'envoi (service gratuit)
      const emailData = {
        service_id: 'default_service',
        template_id: 'vote_notification',
        user_id: 'your_emailjs_user_id',
        template_params: {
          to_email: this.ADMIN_EMAIL,
          subject: `🗳️ Nouveau vote pour "${data.lockedClass.name}"`,
          html_content: emailContent,
          from_name: 'Système de Vote CAHIER_txt',
          reply_to: 'noreply@cahier-txt.com'
        }
      };

      // Pour le développement, on log le contenu au lieu d'envoyer
      if (process.env.NODE_ENV === 'development') {
        logger.info('Email de vote (mode développement):', {
          to: this.ADMIN_EMAIL,
          subject: emailData.template_params.subject,
          content: emailContent
        });
        
        // Simuler l'envoi avec une notification console
        console.log('📧 EMAIL DE VOTE SIMULÉ:');
        console.log('À:', this.ADMIN_EMAIL);
        console.log('Sujet:', emailData.template_params.subject);
        console.log('Contenu HTML généré avec succès');
        
        return true;
      }

      // En production, utiliser un vrai service d'email
      const response = await fetch(this.EMAIL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        logger.info('Email de vote envoyé avec succès', { classId: data.lockedClass.id });
        return true;
      } else {
        logger.error('Erreur lors de l\'envoi de l\'email', { status: response.status });
        return false;
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de vote', error);
      return false;
    }
  }

  /**
   * Génère le contenu HTML moderne pour l'email de vote
   */
  private static generateVoteEmailHTML(data: VoteEmailData): string {
    const { vote, lockedClass, currentStats } = data;
    const voteIcon = vote.vote === 'yes' ? '✅' : '❌';
    const voteText = vote.vote === 'yes' ? 'POUR' : 'CONTRE';
    const voteColor = vote.vote === 'yes' ? '#10B981' : '#EF4444';
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification de Vote</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .vote-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stats-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; color: #334155; }
        .stats-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: ${lockedClass.color}; transition: width 0.3s ease; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗳️ Nouveau Vote Reçu</h1>
            <p style="margin-top: 10px; opacity: 0.9;">Système de Vote CAHIER_txt</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <div class="vote-badge" style="background: ${voteColor}; color: white;">
                    ${voteIcon} Vote ${voteText}
                </div>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 20px;">Détails du Vote</h2>
            
            <table class="stats-table">
                <tr>
                    <th>Classe</th>
                    <td><strong>${lockedClass.name}</strong></td>
                </tr>
                <tr>
                    <th>Matière</th>
                    <td>${lockedClass.subject}</td>
                </tr>
                <tr>
                    <th>Cycle</th>
                    <td style="text-transform: capitalize;">${lockedClass.cycle}</td>
                </tr>
                <tr>
                    <th>Votant</th>
                    <td>${vote.voterName}</td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>${vote.voterEmail}</td>
                </tr>
                <tr>
                    <th>Date & Heure</th>
                    <td>${new Date(vote.timestamp).toLocaleString('fr-FR')}</td>
                </tr>
                <tr>
                    <th>Vote</th>
                    <td style="color: ${voteColor}; font-weight: bold;">${voteText}</td>
                </tr>
            </table>
            
            <h3 style="color: #1e293b; margin: 30px 0 15px 0;">📊 Statistiques Actuelles</h3>
            
            <table class="stats-table">
                <tr>
                    <th>Votes Totaux</th>
                    <td><strong>${currentStats.totalVotes}</strong></td>
                </tr>
                <tr>
                    <th>Votes Pour</th>
                    <td style="color: #10B981;"><strong>${currentStats.yesVotes}</strong></td>
                </tr>
                <tr>
                    <th>Votes Contre</th>
                    <td style="color: #EF4444;"><strong>${currentStats.noVotes}</strong></td>
                </tr>
                <tr>
                    <th>Objectif</th>
                    <td><strong>${lockedClass.requiredVotes} votes</strong></td>
                </tr>
                <tr>
                    <th>Progression</th>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="progress-bar" style="flex: 1;">
                                <div class="progress-fill" style="width: ${currentStats.progressPercentage}%;"></div>
                            </div>
                            <span><strong>${currentStats.progressPercentage.toFixed(1)}%</strong></span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th>Votes Restants</th>
                    <td>
                        ${currentStats.remainingVotes > 0 
                          ? `<span class="highlight">${currentStats.remainingVotes} votes</span>` 
                          : '<span style="color: #10B981; font-weight: bold;">🎉 Objectif Atteint!</span>'
                        }
                    </td>
                </tr>
            </table>
            
            ${currentStats.remainingVotes === 0 
              ? '<div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;"><strong style="color: #15803d;">🎉 Cette classe peut maintenant être déverrouillée!</strong></div>' 
              : ''
            }
        </div>
        
        <div class="footer">
            <p>Cet email a été généré automatiquement par le système CAHIER_txt</p>
            <p style="margin-top: 5px;">📧 ${this.ADMIN_EMAIL}</p>
        </div>
    </div>
</body>
</html>`;
  }
}