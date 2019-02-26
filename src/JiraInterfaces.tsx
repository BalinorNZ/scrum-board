export interface SprintList {
    maxResults: number;
    startAt: number;
    isLast: boolean;
    values: Sprint[];
}

export interface Sprint {
    id: number;
    self: string;
    state: string;
    name: string;
    startDate?: Date;
    endDate?: Date;
    completeDate?: Date;
    originBoardId: number;
}

export interface IssueList {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: Issue[];
}

export interface Issue {
    id: string;
    self: string;
    key: string;
    fields: {
        epic: {
            id: number;
            key: string;
            self: string;
            name: string;
            summary: string;
            done: boolean;
        };
        status: {
            self: string;
            name: string;
        };
        summary: string;
        description: string;
        customfield_10806: number;
    };
}

export interface EpicList {
    [epic: string]: Issue[];
}

export interface BoardList {
    maxResults: number;
    startAt: number;
    total: number;
    isLast: boolean;
    values: Board[];
}

export interface Board {
    id: number;
    self: string;
    name: string;
    type: string;
    location: {
        projectId: number;
        displayName: string;
        projectName: string;
        projectKey: string;
        projectTypeKey: string;
        avatarURI: string;
        name: string;
    };
}