        import { useUser } from '@clerk/clerk-expo';
        import { useEffect, useRef } from 'react';
        import { syncUserToSupabase } from '@/lib/userSync';

        export function useClerkSupabaseSync() {
        const { user, isLoaded } = useUser();
        const hasSynced = useRef(false);

        useEffect(() => {
            const syncUser = async () => {
            if (isLoaded && user && !hasSynced.current) {
                hasSynced.current = true;
                await syncUserToSupabase({
                id: user.id,
                emailAddresses: user.emailAddresses,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                });
            }
            };

            syncUser();
        }, [isLoaded, user]);
        }