// New "Descriptions visibles" section for ConfigModal.tsx
// Replace lines 109-203 with this content

          <div className={sectionClasses}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="fas fa-eye text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Descriptions visibles</h3>
                  <p className="text-xs text-slate-500">Contrôlez l'affichage des descriptions par contexte</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600 font-medium">Intelligent</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Application Context */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-desktop text-blue-600"></i>
                    <span className="font-medium text-blue-900">Application</span>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Écran</div>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    {localConfig.screenDescriptionMode === 'all' ? 'Tout visible' : 
                     localConfig.screenDescriptionMode === 'none' ? 'Masqué' : 
                     `${localConfig.screenDescriptionTypes?.length || 0} type(s)`}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
                  {(['all','none','custom'] as const).map(mode => {
                    const selected = localConfig.screenDescriptionMode===mode;
                    const icons = { all: 'fas fa-check-double', none: 'fas fa-eye-slash', custom: 'fas fa-sliders-h' };
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLocalConfig(p => ({...p, screenDescriptionMode: mode}))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected ? 'bg-blue-600 text-white shadow-sm scale-105' : 'bg-white/70 text-blue-700 hover:bg-white border border-blue-200'
                        }`}
                      >
                        <i className={icons[mode]}></i>
                        {mode==='all'?'Tout':mode==='none'?'Aucune':'Sélection'}
                      </button>
                    );
                  })}
                </div>

                {localConfig.screenDescriptionMode === 'custom' && (
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-700 font-medium">Types sélectionnés</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setAllTypes('screen', true)} 
                          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition">Tout</button>
                        <button type="button" onClick={() => setAllTypes('screen', false)} 
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition">Aucun</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allNormalizedTypes.map(t => {
                        const active = !!localConfig.screenDescriptionTypes?.includes(t);
                        return (
                          <button
                            key={`s-${t}`}
                            type="button"
                            onClick={() => toggleType('screen', t)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                              active ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-blue-600 border border-blue-200 hover:border-blue-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-blue-300'}`}></span>
                            <span>{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Print Context */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-print text-emerald-600"></i>
                    <span className="font-medium text-emerald-900">Impression</span>
                    <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">PDF</div>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">
                    {localConfig.printDescriptionMode === 'all' ? 'Tout visible' : 
                     localConfig.printDescriptionMode === 'none' ? 'Masqué' : 
                     `${localConfig.printDescriptionTypes?.length || 0} type(s)`}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-3">
                  {(['all','none','custom'] as const).map(mode => {
                    const selected = localConfig.printDescriptionMode===mode;
                    const icons = { all: 'fas fa-check-double', none: 'fas fa-eye-slash', custom: 'fas fa-sliders-h' };
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLocalConfig(p => ({...p, printDescriptionMode: mode, printShowDescriptions: mode==='all' ? true : (mode==='none'? false : p.printShowDescriptions)}))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected ? 'bg-emerald-600 text-white shadow-sm scale-105' : 'bg-white/70 text-emerald-700 hover:bg-white border border-emerald-200'
                        }`}
                      >
                        <i className={icons[mode]}></i>
                        {mode==='all'?'Tout':mode==='none'?'Aucune':'Sélection'}
                      </button>
                    );
                  })}
                </div>

                {localConfig.printDescriptionMode === 'custom' && (
                  <div className="bg-white/60 rounded-lg p-3 border border-emerald-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-700 font-medium">Types sélectionnés</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => setAllTypes('print', true)} 
                          className="text-xs px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition">Tout</button>
                        <button type="button" onClick={() => setAllTypes('print', false)} 
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition">Aucun</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allNormalizedTypes.map(t => {
                        const active = !!localConfig.printDescriptionTypes?.includes(t);
                        return (
                          <button
                            key={`p-${t}`}
                            type="button"
                            onClick={() => toggleType('print', t)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                              active ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-emerald-300'}`}></span>
                            <span>{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <i className="fas fa-lightbulb text-amber-600 mt-0.5"></i>
                <div className="text-xs text-amber-800">
                  <span className="font-medium">Conseil:</span> Mode "Sélection" pour un contrôle granulaire par type d'élément. 
                  Changez dynamiquement selon vos besoins d'affichage.
                </div>
              </div>
            </div>
          </div>
