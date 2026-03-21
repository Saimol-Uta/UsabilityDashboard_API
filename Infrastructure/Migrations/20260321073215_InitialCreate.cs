using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Profile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TestPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Product = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EvaluatedModule = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Objective = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    UserProfile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Methodology = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    EstimatedDuration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedA = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Findings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Recommendation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Tool = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Findings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Findings_TestPlans_TestPlanId",
                        column: x => x.TestPlanId,
                        principalTable: "TestPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModeratorScripts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Introduction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FollowUpQuestions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClosingInstructions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModeratorScripts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModeratorScripts_TestPlans_TestPlanId",
                        column: x => x.TestPlanId,
                        principalTable: "TestPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlatformTested = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestSessions_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TestSessions_TestPlans_TestPlanId",
                        column: x => x.TestPlanId,
                        principalTable: "TestPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TestTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestPlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskNumber = table.Column<int>(type: "int", nullable: false),
                    Scenario = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ExpectedResult = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MainMetric = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SuccessCriteria = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MaxTimeSeconds = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestTasks_TestPlans_TestPlanId",
                        column: x => x.TestPlanId,
                        principalTable: "TestPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ImprovementActions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FindingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ImplementedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImprovementActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImprovementActions_Findings_FindingId",
                        column: x => x.FindingId,
                        principalTable: "Findings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ObservationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestTaskId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskSuccess = table.Column<bool>(type: "bit", nullable: false),
                    TimeSeconds = table.Column<int>(type: "int", nullable: false),
                    ErrorCount = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DetectedProblem = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProposedImprovement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObservationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ObservationLogs_TestSessions_TestSessionId",
                        column: x => x.TestSessionId,
                        principalTable: "TestSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ObservationLogs_TestTasks_TestTaskId",
                        column: x => x.TestTaskId,
                        principalTable: "TestTasks",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Findings_TestPlanId",
                table: "Findings",
                column: "TestPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_ImprovementActions_FindingId",
                table: "ImprovementActions",
                column: "FindingId");

            migrationBuilder.CreateIndex(
                name: "IX_ModeratorScripts_TestPlanId",
                table: "ModeratorScripts",
                column: "TestPlanId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ObservationLogs_TestSessionId",
                table: "ObservationLogs",
                column: "TestSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_ObservationLogs_TestTaskId",
                table: "ObservationLogs",
                column: "TestTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TestSessions_ParticipantId",
                table: "TestSessions",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_TestSessions_TestPlanId",
                table: "TestSessions",
                column: "TestPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TestTasks_TestPlanId",
                table: "TestTasks",
                column: "TestPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ImprovementActions");

            migrationBuilder.DropTable(
                name: "ModeratorScripts");

            migrationBuilder.DropTable(
                name: "ObservationLogs");

            migrationBuilder.DropTable(
                name: "Findings");

            migrationBuilder.DropTable(
                name: "TestSessions");

            migrationBuilder.DropTable(
                name: "TestTasks");

            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "TestPlans");
        }
    }
}
