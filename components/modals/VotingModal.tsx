import React, { useState, useEffect } from 'react';
import { LockedClass } from '../../services/ManifestService';
import { manifestService } from '../../services/ManifestService';
import { useConfigManager } from '../../hooks/useConfigManager';
import { logger } from '../../utils/logger';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedClass: LockedClass | null;
}

const VotingModal: React.FC<VotingModalProps> = ({ isOpen, onClose, lockedClass }) => {
  const { config } = useConfigManager();
  // Pré-remplir automatiquement le nom avec celui saisi dans WelcomeModal
  const [voterName, setVoterName] = useState(config?.defaultTeacherName || '');
  const [voterEmail, setVoterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [voteStats, setVoteStats] = useState({ yes: 0, no: 0 });
  const [totalVotes, setTotalVotes] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Mettre à jour le nom automatiquement quand la config change
  useEffect(() => {
    if (config?.defaultTeacherName && !voterName.trim()) {
      setVoterName(config.defaultTeacherName);
    }
  }, [config?.defaultTeacherName, voterName]);

  const canVote = manifestService.canUserVote(voterEmail);

  const loadVoteData = () => {
    if (!lockedClass) return;
    
    const votes = manifestService.getVoteCount(lockedClass.id);
    const stats = manifestService.getVoteStats(lockedClass.id);
    const progress = Math.min((votes / lockedClass.requiredVotes) * 100, 100);
    
    setTotalVotes(votes);
    setVoteStats(stats);
    setProgressPercentage(progress);
  };

  useEffect(() => {
    if (isOpen && lockedClass) {
      loadVoteData();
      setHasVoted(false);
      setShowSuccess(false);
      setIsSubmitting(false);
      // Garder le nom pré-rempli mais vider l'email
      setVoterEmail('');
    }
  }, [isOpen, lockedClass]);

  useEffect(() => {
    if (isOpen && lockedClass) {
      const interval = setInterval(loadVoteData, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, lockedClass]);

  const handleSubmitVote = async (vote: 'yes' | 'no') => {
    if (!lockedClass) {
      return;
    }

    const enforcedName = (config?.defaultTeacherName || '').trim() || voterName.trim();

    if (!enforcedName || !voterEmail.trim()) {
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
      await manifestService.submitVote(lockedClass.id, enforcedName, voterEmail.trim(), vote);
      
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

  const getRemainingTime = () => {
    const cooldownTime = manifestService.getRemainingCooldownTime(voterEmail);
    if (cooldownTime <= 0) return null;
    
    const hours = Math.floor(cooldownTime / (1000 * 60 * 60));
    const minutes = Math.floor((cooldownTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  if (!isOpen || !lockedClass) return null;

  const remainingVotes = Math.max(lockedClass.requiredVotes - totalVotes, 0);
  const remainingTime = getRemainingTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{lockedClass.name}</h2>
              <p className="text-sm text-gray-600">{lockedClass.subject}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {lockedClass.cycle.charAt(0).toUpperCase() + lockedClass.cycle.slice(1)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-6 bg-gray-50">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-600">
                {totalVotes} / {lockedClass.requiredVotes} votes
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {remainingVotes > 0 
                ? `${remainingVotes} vote${remainingVotes > 1 ? 's' : ''} restant${remainingVotes > 1 ? 's' : ''}` 
                : '🎉 Objectif atteint !'
              }
            </p>
          </div>

          {/* Vote Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{voteStats.yes}</div>
              <div className="text-xs text-gray-500">Pour</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-600">{voteStats.no}</div>
              <div className="text-xs text-gray-500">Contre</div>
            </div>
          </div>
        </div>

        {/* Voting Form */}
        {!hasVoted && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom
                </label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez votre nom"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre email *
                </label>
                <input
                  type="email"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {!canVote && remainingTime && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <i className="fas fa-clock mr-2"></i>
                    Vous devez attendre {remainingTime} avant de voter à nouveau.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSubmitVote('yes')}
                  disabled={isSubmitting || !canVote || !voterName.trim() || !voterEmail.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-thumbs-up"></i>
                      Voter Oui
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleSubmitVote('no')}
                  disabled={isSubmitting || !canVote || !voterName.trim() || !voterEmail.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-thumbs-down"></i>
                      Voter Non
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="p-6 bg-green-50 border-t border-green-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Vote enregistré !</h3>
              <p className="text-sm text-green-700">
                Merci pour votre participation. Cette fenêtre se fermera automatiquement.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingModal;