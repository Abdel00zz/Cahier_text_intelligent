import { useState, useCallback, useEffect } from 'react';
import { AppConfig } from '../types';
import { logger } from '../utils/logger';

const CONFIG_STORAGE_KEY = 'appConfig_v1';

const defaultConfig: AppConfig = {
    establishmentName: '',
    defaultTeacherName: '',
    printShowDescriptions: false,
    theme: 'system',
};

export const useConfigManager = () => {
    const [config, setConfig] = useState<AppConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (storedConfig) {
                const loadedConfig = JSON.parse(storedConfig);
                // Ensure printShowDescriptions defaults to false if not set
                if (typeof loadedConfig.printShowDescriptions === 'undefined') {
                    loadedConfig.printShowDescriptions = false;
                }
                setConfig({ ...defaultConfig, ...loadedConfig });
            } else {
                // For new users, explicitly set the default to false
                setConfig({ ...defaultConfig, printShowDescriptions: false });
            }
        } catch (error) {
            logger.error("Failed to load config from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateConfig = useCallback((newConfig: Partial<AppConfig>) => {
        setConfig(prevConfig => {
            const updated = { ...prevConfig, ...newConfig };
            try {
                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                logger.error("Failed to save config to localStorage", error);
            }
            return updated;
        });
    }, []);

    return { config, updateConfig, isLoading };
};
