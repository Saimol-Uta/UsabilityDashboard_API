using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateTestTaskValidator : AbstractValidator<CreateTestTaskDto>
    {
        public CreateTestTaskValidator()
        {
            RuleFor(x => x.TestPlanId)
                .NotEmpty().WithMessage("El TestPlan es obligatorio");

            RuleFor(x => x.TaskNumber)
                .GreaterThan(0).WithMessage("El número de tarea debe ser mayor a 0");

            RuleFor(x => x.Scenario)
                .NotEmpty().WithMessage("El escenario es obligatorio")
                .MaximumLength(1000);

            RuleFor(x => x.ExpectedResult)
                .NotEmpty().WithMessage("El resultado esperado es obligatorio");

            RuleFor(x => x.MainMetric)
                .NotEmpty().WithMessage("La métrica principal es obligatoria");

            RuleFor(x => x.MaxTimeSeconds)
                .GreaterThan(0).WithMessage("El tiempo máximo debe ser mayor a 0");
        }
    }
}
