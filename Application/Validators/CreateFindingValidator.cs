using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateFindingValidator : AbstractValidator<CreateFindingDto>
    {
        private static readonly string[] ValidSeverities = ["Low", "Medium", "High", "Critical"];
        private static readonly string[] ValidPriorities = ["Low", "Medium", "High"];

        public CreateFindingValidator()
        {
            RuleFor(x => x.TestPlanId)
                .NotEmpty().WithMessage("El TestPlan es obligatorio");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripción es obligatoria")
                .MaximumLength(1000);

            RuleFor(x => x.Severity)
                .NotEmpty()
                .Must(s => ValidSeverities.Contains(s))
                .WithMessage($"Severity debe ser: {string.Join(", ", ValidSeverities)}");

            RuleFor(x => x.Priority)
                .NotEmpty()
                .Must(p => ValidPriorities.Contains(p))
                .WithMessage($"Priority debe ser: {string.Join(", ", ValidPriorities)}");

            RuleFor(x => x.Recommendation)
                .NotEmpty().WithMessage("La recomendación es obligatoria");
        }
    }
}
