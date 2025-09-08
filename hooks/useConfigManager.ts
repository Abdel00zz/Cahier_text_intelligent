import { useCallback, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { AppConfig } from '../types';
import { logger } from '../utils/logger';

const CONFIG_STORAGE_KEY = 'appConfig_v1';

const defaultConfig: AppConfig = {
    establishmentName: '',
    defaultTeacherName: '',
    printShowDescriptions: false,
    theme: 'system',
    screenDescriptionMode: 'all',
    screenDescriptionTypes: [],
    printDescriptionMode: 'all',
    printDescriptionTypes: [],
};

export const useConfigManager = () => {
    const [config, setConfig] = useImmer<AppConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (storedConfig) {
                const loadedConfig = JSON.parse(storedConfig);
                setConfig(currentConfig => ({
                    ...defaultConfig,
                    ...loadedConfig,
                    printShowDescriptions: loadedConfig.printShowDescriptions ?? loadedConfig.printDescriptionMode === 'none' ? false : (loadedConfig.printDescriptionMode === 'all' ? true : (typeof loadedConfig.printShowDescriptions === 'boolean' ? loadedConfig.printShowDescriptions : false)),
                    screenDescriptionMode: loadedConfig.screenDescriptionMode ?? 'all',
                    screenDescriptionTypes: loadedConfig.screenDescriptionTypes ?? [],
                    printDescriptionMode: loadedConfig.printDescriptionMode ?? (typeof loadedConfig.printShowDescriptions === 'boolean' ? (loadedConfig.printShowDescriptions ? 'all' : 'none') : 'all'),
                    printDescriptionTypes: loadedConfig.printDescriptionTypes ?? [],
                }));
            } else {
                setConfig(currentConfig => ({
                    ...currentConfig,
                    printShowDescriptions: false,
                }));
            }
        } catch (error) {
            logger.error("Failed to load config from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, [setConfig]);

    const updateConfig = useCallback((newConfig: Partial<AppConfig>) => {
        setConfig(draft => {
            Object.assign(draft, newConfig);
            try {
                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(draft));
            } catch (error) {
                logger.error("Failed to save config to localStorage", error);
            }
        });
    }, [setConfig]);

    return { config, updateConfig, isLoading };
};
