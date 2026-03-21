using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameCreatedToCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Created",
                table: "TestPlans");

            migrationBuilder.DropColumn(
                name: "Created",
                table: "ObservationLogs");

            migrationBuilder.DropColumn(
                name: "Created",
                table: "ImprovementActions");

            migrationBuilder.DropColumn(
                name: "Created",
                table: "Findings");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "TestTasks",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "TestSessions",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Participants",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "ModeratorScripts",
                newName: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "TestTasks",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "TestSessions",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Participants",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "ModeratorScripts",
                newName: "Created");

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "TestPlans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "ObservationLogs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "ImprovementActions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "Findings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
