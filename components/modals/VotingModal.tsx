import React, { useState, useEffect } from 'react';
import { manifestService, LockedClass } from '../../services/ManifestService';
import { logger } from '../../utils/logger';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedClass: LockedClass | null;
}

const VotingModal: React.FC<VotingModalProps> = ({ isOpen, onClose, lockedClass }) => {
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState({ yes: 0, no: 0, total: 0 });
  const [canVote, setCanVote] = useState(true);
  const [cooldownMessage, setCooldownMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const loadVoteData = () => {
    if (!lockedClass) return;

    // Utiliser getVoteCount qui inclut les votes de base + votes utilisateur
    const totalVotes = manifestService.getVoteCount(lockedClass.id);
    const stats = manifestService.getVoteStats(lockedClass.id);
    
    // Synchroniser avec les votes totaux (base + utilisateur)
    setVoteStats({
      yes: totalVotes,
      no: stats.no,
      total: totalVotes + stats.no
    });
  };

  useEffect(() => {
    if (isOpen && lockedClass) {
      // Charger les statistiques de vote avec les votes de base inclus
      loadVoteData();
      
      // Réinitialiser le formulaire
      setVoterName('');
      setVoterEmail('');
      setHasVoted(false);
      setShowSuccess(false);
    }
  }, [isOpen, lockedClass]);

  // Synchronisation en temps réel de la progression
  useEffect(() => {
    if (isOpen && lockedClass) {
      const interval = setInterval(() => {
        loadVoteData();
      }, 2000); // Actualise toutes les 2 secondes
      
      return () => clearInterval(interval);
    }
  }, [isOpen, lockedClass]);

  useEffect(() => {
    if (voterEmail) {
      const canUserVote = manifestService.canUserVote(voterEmail);
      setCanVote(canUserVote);
      
      if (!canUserVote) {
        setCooldownMessage('Vous avez déjà voté récemment. Veuillez attendre 24h avant de voter à nouveau.');
      } else {
        setCooldownMessage('');
      }
    }
  }, [voterEmail]);

  const handleSubmitVote = async (vote: 'yes' | 'no') => {
    if (!lockedClass || !voterName.trim() || !voterEmail.trim()) {
      return;
    }

    if (!canVote) {
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(voterEmail)) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsSubmitting(true);

    try {
      await manifestService.submitVote(lockedClass.id, voterName.trim(), voterEmail.trim(), vote);
      
      // Mettre à jour les statistiques avec les votes de base inclus
      loadVoteData();
      
      setHasVoted(true);
      setShowSuccess(true);
      
      // Actualisation immédiate de la progression
      setTimeout(() => {
        loadVoteData();
      }, 500);
      
      // Vérifier si la classe est maintenant déverrouillée
      const totalVotes = manifestService.getVoteCount(lockedClass.id);
      if (totalVotes >= lockedClass.requiredVotes) {
        setTimeout(() => {
          alert('🎉 Félicitations ! Cette classe vient d\'être déverrouillée grâce à votre vote !');
        }, 1000);
      }
      
      // Fermer automatiquement après 3 secondes
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      logger.error('Failed to submit vote', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = lockedClass ? Math.min((voteStats.yes / lockedClass.requiredVotes) * 100, 100) : 0;
  const remainingVotes = lockedClass ? Math.max(lockedClass.requiredVotes - voteStats.yes, 0) : 0;

  if (!isOpen || !lockedClass) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: lockedClass.color + '20' }}>
              <i className="fas fa-vote-yea text-2xl" style={{ color: lockedClass.color }}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Votez pour débloquer
            </h2>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              {lockedClass.name}
            </h3>
            <p className="text-sm text-gray-500">
              {lockedClass.subject}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-6 pb-3">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progression</span>
              <span className="text-sm font-bold text-gray-800">
                {voteStats.yes} / {lockedClass.requiredVotes} votes
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: lockedClass.color
                }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              {remainingVotes > 0 
                ? `Plus que ${remainingVotes} votes pour débloquer cette classe !`
                : '🎉 Cette classe peut maintenant être débloquée !'
              }
            </p>
          </div>
        </div>



        {/* Success Message */}
        {showSuccess && (
          <div className="px-6 pb-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <i className="fas fa-check-circle text-green-500 text-xl mb-1"></i>
              <p className="text-green-700 font-medium text-sm">Merci pour votre vote !</p>
              <p className="text-green-600 text-xs">Votre vote a été enregistré avec succès.</p>
            </div>
          </div>
        )}

        {/* Voting Form */}
        {!hasVoted && (
          <div className="px-6 pb-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Entrez votre nom"
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre email *
                  </label>
                  <input
                    type="email"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                </div>
              </div>

              {cooldownMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-yellow-700 text-sm">
                    <i className="fas fa-clock mr-2"></i>
                    {cooldownMessage}
                  </p>
                </div>
              )}

              <div className="text-center pt-1">
                <p className="text-sm text-gray-600 mb-3">
                  Souhaitez-vous que cette classe soit débloquée ?
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleSubmitVote('yes')}
                    disabled={isSubmitting || !voterName.trim() || !voterEmail.trim() || !canVote}
                    className="flex-1 max-w-[120px] bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-thumbs-up mr-2"></i>
                        Oui
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleSubmitVote('no')}
                    disabled={isSubmitting || !voterName.trim() || !voterEmail.trim() || !canVote}
                    className="flex-1 max-w-[120px] bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-thumbs-down mr-2"></i>
                        Non
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Vos informations seront utilisées uniquement pour le système de vote et ne seront pas partagées.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VotingModal;