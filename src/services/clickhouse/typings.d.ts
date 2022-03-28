declare namespace ClickHouse {
  type Activity = {
    owner: string;
    repo: string;
    githubLogin: number;
    knowledgeSharing: number;
    codeContribution: number;
    issueCoordination: number;
    progressControl: number;
    codeTweaking: number;
    issueReporting: number;
  };
}
