import React, { createContext, useState, useEffect, useContext } from 'react';
import { settingsService, contactService } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [socialLinks, setSocialLinks] = useState([]);
    const [shippingStates, setShippingStates] = useState([]);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch all global settings in parallel
                const [socialRes, shippingRes, contactRes] = await Promise.allSettled([
                    settingsService.getSocialMedia(),
                    settingsService.getShippingStates(),
                    contactService.getContactInfo()
                ]);

                if (socialRes.status === 'fulfilled') {
                    setSocialLinks(socialRes.value.data.data);
                } else {
                    console.error('Failed to fetch social links:', socialRes.reason);
                }

                if (shippingRes.status === 'fulfilled') {
                    setShippingStates(shippingRes.value.data.data);
                } else {
                    // Shipping states might not be critical for all pages, so just log error
                    console.error('Failed to fetch shipping states:', shippingRes.reason);
                }

                if (contactRes.status === 'fulfilled') {
                    setContactInfo(contactRes.value.data.data);
                } else {
                    console.error('Failed to fetch contact info:', contactRes.reason);
                }

            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ socialLinks, shippingStates, contactInfo, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

