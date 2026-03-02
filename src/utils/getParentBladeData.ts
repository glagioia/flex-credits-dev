interface ParentBladeData {
    id: string;
    name: string;
    position: string;
    source: string;
    variant: string;
    state: string;
    type: string;
}

export function getParentBladeData(appId?: string): ParentBladeData {
    const blankData: ParentBladeData = {
        id: '',
        name: '',
        position: '',
        source: '',
        variant: '',
        state: '',
        type: ''
    };
    
    const appContainer = document.getElementById(appId || 'react-external');
    if (!appContainer) return blankData;

    const bladeParent = appContainer.closest('[data-blade-name="sf/open"]') as HTMLElement;
    if (!bladeParent) return blankData;

    const mappedData: Partial<ParentBladeData> = {};

    Array.from(bladeParent.attributes).forEach(attr => {
        if (attr.name.startsWith('data-blade-')) {
            // Convert data-blade-string to string
            const key = attr.name.replace('data-blade-', '') as keyof ParentBladeData;
            mappedData[key] = attr.value;
        }
    });
    
    return {
        ...blankData,
        ...mappedData
    };
}
