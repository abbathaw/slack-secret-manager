export interface Message {
    workspaceId: string;
    uuid: string;
    channelId?: string;
    authorId: string;
    title: string;
    users: string[];
    expiry: number;
    onetime: boolean;
    conversation?: any;
    createdAt: string;
}

export interface Secret {
    uuid: string;
    encrypted: string;
    ttl: string;
}

export interface AccessLog {
    uuid: string;
    secretUuid: string;
    userId: string;
    valid: boolean;
    createdAt: string;
}

export interface UserSettings {
    workspaceId: string;
    userId: string;
    defaultTitle: string;
    defaultExpiry: number;
    defaultOneTime: boolean;
}

// message with message history retrieved decode key during vault command only
export interface combinedMHType extends Message {
    decodeKey: string;
}
