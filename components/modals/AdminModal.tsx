import React, { useState, useEffect, useCallback } from 'react';
import { manifestService, LockedClass, ManifestClass } from '../../services/ManifestService';
import { ClassInfo, Cycle } from '../../types';
import { logger } from '../../utils/logger';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  onClassUpdate: () => void;
}

interface VoteStats {
  classId: string;
  className: string;
  subject: string;
  cycle: Cycle;
  votes: number;
  requiredVotes: number;
  percentage: number;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, classes, onClassUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'votes' | 'settings'>('overview');
  const [lockedClasses, setLockedClasses] = useState<LockedClass[]>([]);
  const [demoClasses, setDemoClasses] = useState<ManifestClass[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<Cycle>('college');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated, selectedCycle]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Charger les classes verrouillées
      const locked = await manifestService.getLockedClasses(selectedCycle);
      setLockedClasses(locked);

      // Charger les classes de démonstration
      const demo = await manifestService.getDemoClasses(selectedCycle);
      setDemoClasses(demo);

      // Calculer les statistiques de vote
      const stats: VoteStats[] = locked.map(lc => {
        const votes = manifestService.getVoteCount(lc.id);
        return {
          classId: lc.id,
          className: lc.name,
          subject: lc.subject,
          cycle: lc.cycle,
          votes,
          requiredVotes: lc.requiredVotes,
          percentage: Math.min((votes / lc.requiredVotes) * 100, 100)
        };
      });
      setVoteStats(stats);
    } catch (error) {
      logger.error('Failed to load admin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = () => {
    if (accessCode === '0114') {
      setIsAuthenticated(true);
      setAccessCode('');
    } else {
      alert('Code d\'accès incorrect');
      setAccessCode('');
    }
  };

  const handleUnlockClass = async (classId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir débloquer cette classe manuellement ?')) {
      try {
        // Simuler le déverrouillage en ajoutant des votes
        const lockedClass = lockedClasses.find(lc => lc.id === classId);
        if (lockedClass) {
          const votesNeeded = lockedClass.requiredVotes - manifestService.getVoteCount(classId);
          for (let i = 0; i < votesNeeded; i++) {
            await manifestService.submitVote(classId, 'Admin', 'admin@system.com', 'yes');
          }
          await loadAdminData();
          onClassUpdate();
        }
      } catch (error) {
        logger.error('Failed to unlock class', error);
        alert('Erreur lors du déverrouillage de la classe');
      }
    }
  };

  const handleResetVotes = async (classId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les votes pour cette classe ?')) {
      try {
        // Réinitialiser les votes (simulation)
        localStorage.removeItem('class_votes_v1');
        await loadAdminData();
        onClassUpdate();
      } catch (error) {
        logger.error('Failed to reset votes', error);
        alert('Erreur lors de la réinitialisation des votes');
      }
    }
  };

  const handleDeleteClass = async (classId: string, isDemo: boolean) => {
    const className = isDemo 
      ? demoClasses.find(dc => dc.id === classId)?.name
      : lockedClasses.find(lc => lc.id === classId)?.name;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${className}" ?`)) {
      try {
        // Supprimer de la liste des classes utilisateur si elle existe
        const userClass = classes.find(c => c.name === className);
        if (userClass) {
          localStorage.removeItem(`classData_v1_${userClass.id}`);
          const updatedClasses = classes.filter(c => c.id !== userClass.id);
          localStorage.setItem('classManager_v1', JSON.stringify(updatedClasses));
        }
        
        await loadAdminData();
        onClassUpdate();
      } catch (error) {
        logger.error('Failed to delete class', error);
        alert('Erreur lors de la suppression de la classe');
      }
    }
  };

  const getTotalVotes = () => {
    return voteStats.reduce((total, stat) => total + stat.votes, 0);
  };

  const getUnlockedCount = () => {
    return voteStats.filter(stat => stat.percentage >= 100).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {!isAuthenticated ? (
          // Écran d'authentification - Style minimaliste
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <i className="fas fa-key text-2xl text-slate-600"></i>
            </div>
            <h2 className="text-2xl font-light text-slate-800 mb-3">Administration</h2>
            <p className="text-slate-500 mb-8 text-sm">Code d'accès requis</p>
            
            <div className="max-w-xs mx-auto">
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                className="w-full px-4 py-4 text-center text-xl font-mono border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all bg-slate-50"
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAuthentication}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Accéder
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Interface d'administration
          <div className="flex flex-col h-full">
            {/* Header - Style minimaliste */}
            <div className="bg-white border-b border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-light text-slate-800">Administration</h2>
                  <p className="text-slate-500 text-sm">Gestion du système</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              
              {/* Tabs - Style minimaliste */}
              <div className="flex gap-0 border border-slate-200 rounded-xl p-1 bg-slate-50">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: 'fa-chart-pie' },
                  { key: 'classes', label: 'Classes', icon: 'fa-graduation-cap' },
                  { key: 'votes', label: 'Votes', icon: 'fa-vote-yea' },
                  { key: 'settings', label: 'Paramètres', icon: 'fa-cog' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      activeTab === tab.key
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-red-600 mb-4"></i>
                    <p className="text-gray-600">Chargement des données...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cycle Selector - Style minimaliste */}
                  <div className="mb-8">
                    <div className="flex gap-0 border border-slate-200 rounded-xl p-1 bg-slate-50 max-w-md">
                      {(['college', 'lycee', 'prepa'] as Cycle[]).map(cycle => (
                        <button
                          key={cycle}
                          onClick={() => setSelectedCycle(cycle)}
                          className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                            selectedCycle === cycle
                              ? 'bg-white text-slate-800 shadow-sm'
                              : 'text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          {cycle === 'college' ? 'Collège' : cycle === 'lycee' ? 'Lycée' : 'Prépa'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 font-medium text-sm">Classes Utilisateur</p>
                            <p className="text-2xl font-light text-slate-800 mt-1">{classes.filter(c => (c.cycle || 'college') === selectedCycle).length}</p>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <i className="fas fa-users text-slate-600"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 font-medium text-sm">Classes Démo</p>
                            <p className="text-2xl font-light text-slate-800 mt-1">{demoClasses.length}</p>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <i className="fas fa-play-circle text-slate-600"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 font-medium text-sm">Classes Verrouillées</p>
                            <p className="text-2xl font-light text-slate-800 mt-1">{lockedClasses.length}</p>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <i className="fas fa-lock text-slate-600"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-600 font-medium text-sm">Total Votes</p>
                            <p className="text-2xl font-light text-slate-800 mt-1">{getTotalVotes()}</p>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <i className="fas fa-vote-yea text-slate-600"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'votes' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-slate-800 mb-4">Statistiques de Vote - {selectedCycle}</h3>
                      
                      {/* Classes verrouillées avec votes */}
                       <div className="space-y-4">
                         {(() => {
                           const lockedClassesWithVotes = manifestService.getAllLockedClassesWithVotes()
                             .filter(c => c.cycle === selectedCycle);
                           
                           if (lockedClassesWithVotes.length === 0) {
                             return (
                               <p className="text-slate-500 text-center py-8">Aucune classe verrouillée avec des votes pour ce cycle</p>
                             );
                           }
                           
                           return lockedClassesWithVotes.map(stat => (
                             <div key={stat.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                               <div className="flex justify-between items-start mb-3">
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                     <h4 className="text-base font-medium text-slate-800">{stat.name}</h4>
                                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                       Verrouillée
                                     </span>
                                   </div>
                                   <p className="text-slate-600 text-sm">{stat.subject}</p>
                                 </div>
                                 
                                 <div className="flex gap-2">
                                   <button
                                     onClick={() => handleUnlockClass(stat.id)}
                                     className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                                     disabled={stat.percentage >= 100}
                                   >
                                     <i className="fas fa-unlock mr-1"></i>
                                     Débloquer
                                   </button>
                                   <button
                                     onClick={() => handleResetVotes(stat.id)}
                                     className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors"
                                   >
                                     <i className="fas fa-redo mr-1"></i>
                                     Reset
                                   </button>
                                 </div>
                               </div>
                               
                               <div className="mb-2">
                                 <div className="flex justify-between text-xs text-slate-600 mb-1">
                                   <span>Progression</span>
                                   <span>{stat.votes} / {stat.requiredVotes} votes ({stat.percentage.toFixed(1)}%)</span>
                                 </div>
                                 <div className="w-full bg-slate-200 rounded-full h-2">
                                   <div 
                                     className={`h-2 rounded-full transition-all duration-300 ${
                                       stat.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                     }`}
                                     style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                   ></div>
                                 </div>
                               </div>
                               
                               {stat.percentage >= 100 && (
                                 <div className="bg-green-50 border-green-200 border rounded-lg p-2 mt-2">
                                   <p className="text-green-700 font-medium text-xs">
                                     <i className="fas fa-unlock mr-1"></i>
                                     Cette classe sera automatiquement déverrouillée !
                                   </p>
                                 </div>
                               )}
                             </div>
                           ));
                         })()}
                      </div>
                    </div>
                  )}

                  {activeTab === 'classes' && (
                    <div className="space-y-6">
                      {/* Classes Utilisateur */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Classes Utilisateur - {selectedCycle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {classes.filter(c => (c.cycle || 'college') === selectedCycle).map(cls => (
                            <div key={cls.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-800">{cls.name}</h4>
                                  <p className="text-sm text-gray-600">{cls.subject}</p>
                                  <p className="text-xs text-gray-500">{cls.teacherName}</p>
                                </div>
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: cls.color }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Créée le {new Date(cls.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Classes Démo */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Classes Démo - {selectedCycle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {demoClasses.map(cls => (
                            <div key={cls.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-blue-800">{cls.name}</h4>
                                  <p className="text-sm text-blue-600">{cls.subject}</p>
                                  <p className="text-xs text-blue-500">Priorité: {cls.priority || 1}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteClass(cls.id, true)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <i className="fas fa-trash text-sm"></i>
                                </button>
                              </div>
                              <p className="text-xs text-blue-600">{cls.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Classes Verrouillées */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Classes Verrouillées - {selectedCycle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {lockedClasses.map(cls => {
                            const votes = manifestService.getVoteCount(cls.id);
                            const percentage = Math.min((votes / cls.requiredVotes) * 100, 100);
                            return (
                              <div key={cls.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-yellow-800">{cls.name}</h4>
                                    <p className="text-sm text-yellow-600">{cls.subject}</p>
                                    <p className="text-xs text-yellow-500">{votes}/{cls.requiredVotes} votes</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteClass(cls.id, false)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <i className="fas fa-trash text-sm"></i>
                                  </button>
                                </div>
                                <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-yellow-600">{cls.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Paramètres Système</h3>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Actions Système</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les votes ?')) {
                                localStorage.removeItem('class_votes_v1');
                                localStorage.removeItem('vote_cooldown_v1');
                                loadAdminData();
                                onClassUpdate();
                              }
                            }}
                            className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
                          >
                            <i className="fas fa-trash-alt text-red-600 text-xl mb-2"></i>
                            <h5 className="font-semibold text-red-800">Réinitialiser tous les votes</h5>
                            <p className="text-sm text-red-600">Supprime tous les votes et cooldowns</p>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
                                localStorage.removeItem('dismissed_locked_cards_v1');
                                loadAdminData();
                                onClassUpdate();
                              }
                            }}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                          >
                            <i className="fas fa-broom text-blue-600 text-xl mb-2"></i>
                            <h5 className="font-semibold text-blue-800">Vider le cache</h5>
                            <p className="text-sm text-blue-600">Réaffiche toutes les cartes masquées</p>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Informations Système</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Version: 2.0.0</p>
                            <p className="text-gray-600">Dernière mise à jour: {new Date().toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Classes totales: {classes.length}</p>
                            <p className="text-gray-600">Votes totaux: {getTotalVotes()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;