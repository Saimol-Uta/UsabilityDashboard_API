using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateTestPlanValidator : AbstractValidator<CreateTestPlanDto>
    {
        public CreateTestPlanValidator()
        {
            RuleFor(x => x.ProjectName)
                .NotEmpty().WithMessage("El nombre del proyecto es obligatorio")
                .MaximumLength(200).WithMessage("El nombre no puede superar 200 caracteres");

            RuleFor(x => x.Product)
                .NotEmpty().WithMessage("El producto es obligatorio")
                .MaximumLength(200);

            RuleFor(x => x.EvaluatedModule)
                .NotEmpty().WithMessage("El módulo evaluado es obligatorio");

            RuleFor(x => x.Objective)
                .NotEmpty().WithMessage("El objetivo es obligatorio")
                .MaximumLength(1000);

            RuleFor(x => x.UserProfile)
                .NotEmpty().WithMessage("El perfil de usuario es obligatorio");

            RuleFor(x => x.Methodology)
                .NotEmpty().WithMessage("La metodología es obligatoria");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("La fecha de inicio es obligatoria");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("La fecha de fin es obligatoria")
                .GreaterThan(x => x.StartDate)
                .WithMessage("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }
}
