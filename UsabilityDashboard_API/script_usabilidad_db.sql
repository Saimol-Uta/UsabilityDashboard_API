IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Participants] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Age] int NOT NULL,
    [Profile] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Participants] PRIMARY KEY ([Id])
);

CREATE TABLE [TestPlans] (
    [Id] uniqueidentifier NOT NULL,
    [ProjectName] nvarchar(200) NOT NULL,
    [Product] nvarchar(200) NOT NULL,
    [EvaluatedModule] nvarchar(200) NOT NULL,
    [Objective] nvarchar(1000) NOT NULL,
    [UserProfile] nvarchar(500) NOT NULL,
    [Methodology] nvarchar(200) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Location] nvarchar(300) NOT NULL,
    [EstimatedDuration] nvarchar(100) NOT NULL,
    [Scope] nvarchar(1000) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_TestPlans] PRIMARY KEY ([Id])
);

CREATE TABLE [Findings] (
    [Id] uniqueidentifier NOT NULL,
    [TestPlanId] uniqueidentifier NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [Frequency] nvarchar(100) NOT NULL,
    [Severity] nvarchar(50) NOT NULL,
    [Priority] nvarchar(50) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [Recommendation] nvarchar(1000) NOT NULL,
    [Category] nvarchar(200) NOT NULL,
    [Tool] nvarchar(200) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Findings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Findings_TestPlans_TestPlanId] FOREIGN KEY ([TestPlanId]) REFERENCES [TestPlans] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [ModeratorScripts] (
    [Id] uniqueidentifier NOT NULL,
    [TestPlanId] uniqueidentifier NOT NULL,
    [Introduction] nvarchar(max) NOT NULL,
    [FollowUpQuestions] nvarchar(max) NOT NULL,
    [ClosingInstructions] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_ModeratorScripts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ModeratorScripts_TestPlans_TestPlanId] FOREIGN KEY ([TestPlanId]) REFERENCES [TestPlans] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [TestSessions] (
    [Id] uniqueidentifier NOT NULL,
    [TestPlanId] uniqueidentifier NOT NULL,
    [ParticipantId] uniqueidentifier NOT NULL,
    [Date] datetime2 NOT NULL,
    [PlatformTested] nvarchar(200) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_TestSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TestSessions_Participants_ParticipantId] FOREIGN KEY ([ParticipantId]) REFERENCES [Participants] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TestSessions_TestPlans_TestPlanId] FOREIGN KEY ([TestPlanId]) REFERENCES [TestPlans] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [TestTasks] (
    [Id] uniqueidentifier NOT NULL,
    [TestPlanId] uniqueidentifier NOT NULL,
    [TaskNumber] int NOT NULL,
    [Scenario] nvarchar(1000) NOT NULL,
    [ExpectedResult] nvarchar(1000) NOT NULL,
    [MainMetric] nvarchar(200) NOT NULL,
    [SuccessCriteria] nvarchar(500) NOT NULL,
    [MaxTimeSeconds] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_TestTasks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TestTasks_TestPlans_TestPlanId] FOREIGN KEY ([TestPlanId]) REFERENCES [TestPlans] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [ImprovementActions] (
    [Id] uniqueidentifier NOT NULL,
    [FindingId] uniqueidentifier NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [Priority] nvarchar(50) NOT NULL,
    [ImplementedDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_ImprovementActions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ImprovementActions_Findings_FindingId] FOREIGN KEY ([FindingId]) REFERENCES [Findings] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [ObservationLogs] (
    [Id] uniqueidentifier NOT NULL,
    [TestSessionId] uniqueidentifier NOT NULL,
    [TestTaskId] uniqueidentifier NOT NULL,
    [TaskSuccess] bit NOT NULL,
    [TimeSeconds] int NOT NULL,
    [ErrorCount] int NOT NULL,
    [Comments] nvarchar(1000) NOT NULL,
    [DetectedProblem] nvarchar(1000) NOT NULL,
    [Severity] nvarchar(50) NOT NULL,
    [ProposedImprovement] nvarchar(1000) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_ObservationLogs] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ObservationLogs_TestSessions_TestSessionId] FOREIGN KEY ([TestSessionId]) REFERENCES [TestSessions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ObservationLogs_TestTasks_TestTaskId] FOREIGN KEY ([TestTaskId]) REFERENCES [TestTasks] ([Id])
);

CREATE INDEX [IX_Findings_TestPlanId] ON [Findings] ([TestPlanId]);

CREATE INDEX [IX_ImprovementActions_FindingId] ON [ImprovementActions] ([FindingId]);

CREATE UNIQUE INDEX [IX_ModeratorScripts_TestPlanId] ON [ModeratorScripts] ([TestPlanId]);

CREATE INDEX [IX_ObservationLogs_TestSessionId] ON [ObservationLogs] ([TestSessionId]);

CREATE INDEX [IX_ObservationLogs_TestTaskId] ON [ObservationLogs] ([TestTaskId]);

CREATE INDEX [IX_TestSessions_ParticipantId] ON [TestSessions] ([ParticipantId]);

CREATE INDEX [IX_TestSessions_TestPlanId] ON [TestSessions] ([TestPlanId]);

CREATE INDEX [IX_TestTasks_TestPlanId] ON [TestTasks] ([TestPlanId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260322213717_RenameCreatedToCreatedAt', N'10.0.5');

COMMIT;
GO

