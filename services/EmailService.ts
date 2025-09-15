/**
 * Service pour l'envoi d'emails des votes
 */

import { logger } from '../utils/logger';
import type { LockedClass, Vote } from './ManifestService';

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
  adminEmail: string; // email destinataire configurable
}

export class EmailService {
  private static readonly EMAIL_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

  /**
   * Envoie un email de notification de vote à l'administrateur
   */
  static async sendVoteNotification(data: VoteEmailData): Promise<boolean> {
    try {
      const emailContent = this.generateVoteEmailHTML(data);
      const subject = `Nouveau vote pour « ${data.lockedClass.name} » (${data.vote.vote === 'yes' ? 'Oui' : 'Non'})`;

      const {
        VITE_VOTE_WEBHOOK_URL,
        VITE_FORMSUBMIT_EMAIL,
        VITE_FORMSUBMIT_ENDPOINT,
        VITE_EMAILJS_SERVICE_ID,
        VITE_EMAILJS_TEMPLATE_ID,
        VITE_EMAILJS_PUBLIC_KEY,
      } = (import.meta as any).env || {};

      // 1) FormSubmit prioritaire: endpoint explicite > email cible > adminEmail fallback
      const formSubmitEndpoint =
        VITE_FORMSUBMIT_ENDPOINT ||
        (VITE_FORMSUBMIT_EMAIL ? `https://formsubmit.co/ajax/${encodeURIComponent(VITE_FORMSUBMIT_EMAIL)}` : (data.adminEmail ? `https://formsubmit.co/ajax/${encodeURIComponent(data.adminEmail)}` : ''));

      if (formSubmitEndpoint) {
        // Payload optimisé FormSubmit - suppression des champs inutiles admin_email et html
        const payload: Record<string, any> = {
          _subject: subject,
          _replyto: data.vote.voterEmail,
          _template: 'table',
          // Informations essentielles du vote
          class_name: data.lockedClass.name,
          class_subject: data.lockedClass.subject,
          class_cycle: data.lockedClass.cycle,
          vote_value: data.vote.vote === 'yes' ? 'POUR' : 'CONTRE',
          voter_name: data.vote.voterName,
          voter_email: data.vote.voterEmail,
          vote_date: new Date(data.vote.timestamp).toLocaleString('fr-FR'),
          // Statistiques actuelles
          total_votes: data.currentStats.totalVotes,
          yes_votes: data.currentStats.yesVotes,
          no_votes: data.currentStats.noVotes,
          progress_percentage: `${data.currentStats.progressPercentage.toFixed(1)}%`,
          remaining_votes: data.currentStats.remainingVotes,
          required_votes: data.lockedClass.requiredVotes,
          // Message résumé
          message: `Nouveau vote ${data.vote.vote === 'yes' ? 'POUR' : 'CONTRE'} la classe « ${data.lockedClass.name} » par ${data.vote.voterName}. Progression: ${data.currentStats.totalVotes}/${data.lockedClass.requiredVotes} votes (${data.currentStats.progressPercentage.toFixed(1)}%).`
        };

        const response = await fetch(formSubmitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          logger.info('Email de vote envoyé avec succès (FormSubmit)', { classId: data.lockedClass.id });
          return true;
        } else {
          const text = await response.text();
          logger.error('Erreur lors de l\'envoi de l\'email (FormSubmit)', { status: response.status, text });
        }
      }

      // 1bis) Webhook si configuré (fallback après FormSubmit)
      if (VITE_VOTE_WEBHOOK_URL) {
        const response = await fetch(VITE_VOTE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            adminEmail: data.adminEmail,
            html: emailContent,
            vote: data.vote,
            lockedClass: data.lockedClass,
            currentStats: data.currentStats,
            requiredVotes: data.lockedClass.requiredVotes,
          }),
        });

        if (response.ok) {
          logger.info('Email de vote envoyé avec succès (Webhook)', { classId: data.lockedClass.id });
          return true;
        } else {
          logger.error('Erreur lors de l\'envoi de l\'email (Webhook)', { status: response.status });
        }
      }

      // 2) Fallback EmailJS si configuré
      if (VITE_EMAILJS_SERVICE_ID && VITE_EMAILJS_TEMPLATE_ID && VITE_EMAILJS_PUBLIC_KEY) {
        const emailData = {
          service_id: VITE_EMAILJS_SERVICE_ID,
          template_id: VITE_EMAILJS_TEMPLATE_ID,
          user_id: VITE_EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: data.adminEmail,
            subject,
            html_content: emailContent,
            vote_value: data.vote.vote,
            voter_name: data.vote.voterName,
            voter_email: data.vote.voterEmail,
            class_name: data.lockedClass.name,
            required_votes: data.lockedClass.requiredVotes,
            current_votes: data.currentStats.totalVotes,
          },
        };

        const response = await fetch(this.EMAIL_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
        });

        if (response.ok) {
          logger.info('Email de vote envoyé avec succès (EmailJS)', { classId: data.lockedClass.id });
          return true;
        } else {
          logger.error('Erreur lors de l\'envoi de l\'email (EmailJS)', { status: response.status });
        }
      }

      // 3) Aucun mécanisme configuré
      logger.warn('Aucun mécanisme d\'envoi d\'email configuré. Définissez VITE_FORMSUBMIT_EMAIL (ou VITE_FORMSUBMIT_ENDPOINT) ou VITE_VOTE_WEBHOOK_URL, ou EmailJS (service/template/public key).');
      logger.info('CONTENU EMAIL (fallback log):', { to: data.adminEmail, subject });
      // Pour la démo, nous allons simplement logger les détails dans la console
      // Au lieu d'envoyer un véritable email
      // console.log('📧 EMAIL DE VOTE (LOG SEULEMENT) →', data.adminEmail, subject);
      // console.log('Sujet:', subject);
      // console.log('Contenu:', body);
      // console.log('------------------------------------------------');
      return false;
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
            <p style="margin-top: 5px;">📧 ${data.adminEmail}</p>
        </div>
    </div>
</body>
</html>`;
  }
}