import { useState, useCallback, useEffect } from 'react';
import { AppConfig } from '../types';

const CONFIG_STORAGE_KEY = 'appConfig_v1';

const defaultConfig: AppConfig = {
    establishmentName: '',
    defaultTeacherName: '',
    printShowDescriptions: true,
    theme: 'system',
};

export const useConfigManager = () => {
    const [config, setConfig] = useState<AppConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (storedConfig) {
                setConfig({ ...defaultConfig, ...JSON.parse(storedConfig) });
            }
        } catch (error) {
            console.error("Failed to load config from localStorage", error);
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
                console.error("Failed to save config to localStorage", error);
            }
            return updated;
        });
    }, []);

    return { config, updateConfig, isLoading };
};
