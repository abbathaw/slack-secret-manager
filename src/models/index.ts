export interface Message {
    workspaceId: string;
    uuid: string;
    channelId?: string;
    authorId: string;
    title: string;
    users: any;
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
